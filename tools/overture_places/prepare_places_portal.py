"""Add bounded, filter-aware vector tile clusters and repair overzoom metadata."""
import argparse
from collections import Counter, defaultdict
from copy import copy
import gzip
import json
import math
from pathlib import Path
import struct
import tempfile
import zipfile

from inspect_places_vtpk import _bundle_tiles, _fields, tile_properties, MAX_TILE_BYTES
from places_geojson import publish_files
from restore_places_vtpk import (BUNDLE_PATH, INDEX_END, MAX_BUNDLE_BYTES, MAX_PACKAGE_BYTES,
    RestorationError, load_source, _local_zip_extra_fields, _write_native_zip_member)

LAYER = 'places_clusters'
CELLS = 8  # 64 pixel cells on the native 512 pixel tile grid.


def varint(n):
    out = bytearray()
    while n > 127:
        out.append((n & 127) | 128); n >>= 7
    out.append(n)
    return bytes(out)


def field(n, value):
    return varint(n*8)+varint(value) if isinstance(value,int) else varint(n*8+2)+varint(len(value))+value


def projected(lon, lat):
    return (lon+180)/360, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2


def count_properties(records, score_index):
    counts = Counter()
    for feature in records:
        p = feature['properties']; family = p['icon_group']; score = p['confidence']
        opened = p['operating_status'] != 'permanently_closed'
        for group in ('all', family):
            counts['n_'+group] += 1
            if opened: counts['o_'+group] += 1
            if score is not None:
                key = group+'_'+str(score_index[score])
                counts['h_'+key] += 1
                counts['b_'+group+'_'+str(score_index[score]//32)] += 1
                if opened:
                    counts['j_'+key] += 1
                    counts['q_'+group+'_'+str(score_index[score]//32)] += 1
    return dict(counts)


def cluster_layer(cells, score_index, z, row, col):
    keys = []; key_index = {}; values = []; value_index = {}; features = []
    def tag(key,value):
        if key not in key_index:key_index[key]=len(keys);keys.append(key)
        identity=(type(value),value)
        if identity not in value_index:
            value_index[identity]=len(values)
            values.append(field(1,value.encode()) if isinstance(value,str) else field(5,value))
        return varint(key_index[key])+varint(value_index[identity])
    for (cx,cy),records in sorted(cells.items()):
        props=count_properties(records,score_index)
        props.update(cell_x=cx,cell_y=cy,tile_z=z,tile_x=col,tile_y=row)
        tags=b''.join(tag(k,v) for k,v in props.items())
        x,y=round((cx+.5)*4096/CELLS),round((cy+.5)*4096/CELLS)
        geom=varint(9)+varint(x*2)+varint(y*2)
        features.append(field(2,field(2,tags)+field(3,1)+field(4,geom)))
    return field(3,field(15,2)+field(1,LAYER.encode())+b''.join(features)+
        b''.join(field(3,k.encode()) for k in keys)+b''.join(field(4,v) for v in values)+field(5,4096))


def tile_index(coordinates):
    root=[0,0,0,0]
    for z,row,col in sorted(coordinates):
        node=root
        for level in range(1,z+1):
            shift=z-level;slot=((col>>shift)&1)+2*((row>>shift)&1)
            if level==z:
                if node[slot]==0:node[slot]=1
            else:
                if not isinstance(node[slot],list):node[slot]=[0,0,0,0]
                node=node[slot]
    return {'index':root}


def new_bundle(template, entries):
    data=bytearray(template[:INDEX_END]);data[64:INDEX_END]=bytes(INDEX_END-64)
    for slot,payload in sorted(entries):
        offset=len(data)+4;data.extend(struct.pack('<I',len(payload)));data.extend(payload)
        struct.pack_into('<Q',data,64+slot*8,(len(payload)<<40)|offset)
    if struct.unpack_from('<I',data,4)[0]!=16384:struct.pack_into('<I',data,4,len(entries))
    struct.pack_into('<I',data,8,max(131092,max(len(p) for _,p in entries)))
    struct.pack_into('<Q',data,16,0);struct.pack_into('<Q',data,24,len(data))
    if len(data)>MAX_BUNDLE_BYTES:raise RestorationError('Overview bundle exceeds budget')
    return bytes(data)


def prepare(input_package, source_geojson, output_package):
    source,target=Path(input_package).resolve(),Path(output_package).resolve()
    if source==target or target.suffix.lower()!='.vtpk' or target.exists():
        raise RestorationError('Choose a new output .vtpk path')
    records,release=load_source(source_geojson)
    scores=sorted({f['properties']['confidence'] for f in records if f['properties']['confidence'] is not None})
    if len(scores)>8192:raise RestorationError('Cluster score histogram exceeds 8192 distinct values; no scores were rounded')
    score_index={v:i for i,v in enumerate(scores)}
    expected={f['properties']['gers_id']:f['properties'] for f in records}
    target.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.places-clusters-',dir=target.parent) as folder:
        staged=Path(folder)/'places.vtpk'
        with zipfile.ZipFile(source) as zin:
            members=zin.infolist();names=[m.filename for m in members]
            if len(names)!=len(set(names)) or len(names)>20000 or any('..' in Path(n).parts or n.startswith('/') or '\\' in n for n in names):raise RestorationError('Invalid package paths')
            if sum(m.file_size for m in members)>MAX_PACKAGE_BYTES or any(m.flag_bits&1 for m in members):raise RestorationError('Encrypted or oversized package')
            bundles=[m for m in members if m.filename.endswith('.bundle')]
            if not bundles or any(not BUNDLE_PATH.fullmatch(m.filename) for m in bundles):raise RestorationError('Unsupported bundle layout')
            roots={BUNDLE_PATH.fullmatch(m.filename)['root'] for m in bundles}
            if len(roots)!=1:raise RestorationError('Expected one native cache root')
            root=next(iter(roots));style_path=root+'/resources/styles/root.json';root_path=root+'/root.json'
            if max(zin.getinfo(p).file_size for p in [style_path,root_path])>1024*1024:raise RestorationError('Oversized package metadata')
            style=json.loads(zin.read(style_path));service=json.loads(zin.read(root_path))
            contract=style.get('metadata',{}).get('mly:places',{})
            if contract.get('version')!=1 or contract.get('sourceLayers')!=['places'] or contract.get('sourceFeatureCount')!=len(records) or contract.get('release')!=release:raise RestorationError('Use a matching, restored complete Places package')
            icons=[l for l in style['layers'] if l.get('source-layer')=='places' and l.get('layout',{}).get('icon-image')]
            if not icons:raise RestorationError('Apply category icon styling before preparing clusters')
            levels=sorted({int(BUNDLE_PATH.fullmatch(m.filename)['z']) for m in bundles})
            if levels!=list(range(min(levels),max(levels)+1)) or not 0<=min(levels)<=max(levels)<=19:raise RestorationError('Expected consecutive cached levels')
            maximum=max(levels);cluster_max=maximum+1
            native_levels=list(levels);levels=list(range(min(12,min(levels)),maximum+1))
            # A tile-local grid avoids seam double-counting; each source point has
            # exactly one owning cell per level, independent of native tile buffers.
            grids={z:defaultdict(lambda:defaultdict(list)) for z in levels}
            for f in records:
                px,py=projected(*f['geometry']['coordinates'])
                for z in levels:
                    x,y=px*2**z,py*2**z;col,row=math.floor(x),math.floor(y)
                    cx,cy=min(CELLS-1,math.floor((x-col)*CELLS)),min(CELLS-1,math.floor((y-row)*CELLS))
                    grids[z][(row,col)][(cx,cy)].append(f)
            contract['clusters']={'version':1,'layer':LAYER,'cells':CELLS,'minzoom':min(levels),'maxzoom':cluster_max,'cachedMaxZoom':maximum,'scores':scores,'scoreBlockSize':32}
            # Cluster data deliberately isn't an individual-place source layer.
            # The adapter validates and handles it separately.
            for s in style['sources'].values():
                if s.get('type')=='vector':s['maxzoom']=24;s['minzoom']=min(levels)
            source_name=icons[0]['source']
            fonts=next((l['layout']['text-font'] for l in style['layers'] if l.get('layout',{}).get('text-font')),None)
            if not fonts:raise RestorationError('Native cached font stack is missing')
            for layer in style['layers']:
                if layer.get('source-layer')!='places':continue
                if layer.get('layout',{}).get('icon-image'):
                    layer['minzoom']=cluster_max;layer.pop('maxzoom',None)
                elif 'text-field' in layer.get('layout',{}):layer.setdefault('layout',{})['visibility']='none'
            style['layers']=[l for l in style['layers'] if not (l.get('source-layer')=='places' and 'text-field' in l.get('layout',{}) and 'icon-image' not in l.get('layout',{}))]
            style['layers'] += [
                {'id':'mly-place-clusters','type':'circle','source':source_name,'source-layer':LAYER,'minzoom':min(levels),'maxzoom':cluster_max,'filter':['>', 'n_all',0],'paint':{'circle-color':'#345c43','circle-radius':16,'circle-stroke-width':1,'circle-stroke-color':'#b4d9bc'}},
                {'id':'mly-place-cluster-counts','type':'symbol','source':source_name,'source-layer':LAYER,'minzoom':min(levels),'maxzoom':cluster_max,'filter':['>', 'n_all',0],'layout':{'text-field':'{n_all}','text-font':fonts,'text-size':11,'text-allow-overlap':True,'text-ignore-placement':True},'paint':{'text-color':'#ffffff'}}]
            service['minScale']=0;service['maxScale']=0;service['minLOD']=min(levels);service['maxLOD']=maximum
            first=service['tileInfo']['lods'][0]
            if first['level']!=0:raise RestorationError('Expected native level zero scheme')
            service['tileInfo']['lods']=[{'level':z,'resolution':first['resolution']/2**z,'scale':first['scale']/2**z} for z in range(25)]
            service['minzoom']=min(levels);service['maxzoom']=24
            service['tileMap']='tilemap/root.json'
            updates={style_path:json.dumps(style,separators=(',',':')).encode(),root_path:json.dumps(service,separators=(',',':')).encode()}
            extras=_local_zip_extra_fields(source,members);seen=set();coverage={z:set() for z in levels};tiles=0
            coordinates=set();added={}
            with zipfile.ZipFile(staged,'w') as zout:
                zout.comment=zin.comment
                for member in members:
                    contents=updates.get(member.filename)
                    if member in bundles:
                        m=BUNDLE_PATH.fullmatch(member.filename);z=int(m['z']);rb=int(m['row'],16);cb=int(m['col'],16)
                        observations={};entries=list(_bundle_tiles(zin,member,16384,observations));fixed=zin.read(member)[:INDEX_END];data=bytearray(fixed);max_size=0
                        for slot,payload in entries:
                            row,col=rb+slot//128,cb+slot%128
                            coordinates.add((z,row,col))
                            for name,attrs in tile_properties(payload):
                                if name!='places' or attrs.get('gers_id') not in expected or any(attrs.get(k)!=v for k,v in expected[attrs['gers_id']].items() if k in ('gers_id','place_name','icon_group','confidence','operating_status')):raise RestorationError('Tile/source attributes differ')
                                seen.add(attrs['gers_id'])
                            raw=gzip.decompress(payload) if payload[:2]==b'\x1f\x8b' else payload
                            cells=grids[z].get((row,col),{})
                            for points in cells.values():coverage[z].update(f['properties']['gers_id'] for f in points)
                            extra_layer=cluster_layer(cells,score_index,z,row,col)
                            result=gzip.compress(raw+extra_layer,mtime=0)
                            if len(result)>MAX_TILE_BYTES or len(raw)+len(extra_layer)>MAX_TILE_BYTES:raise RestorationError('Cluster tile exceeds budget')
                            offset=len(data)+4;data.extend(struct.pack('<I',len(result)));data.extend(result);struct.pack_into('<Q',data,64+slot*8,(len(result)<<40)|offset);max_size=max(max_size,len(result));tiles+=1
                        struct.pack_into('<Q',data,16,0);struct.pack_into('<Q',data,24,len(data));struct.pack_into('<I',data,8,max(max_size,observations['maximumRecordSize']))
                        if len(data)>MAX_BUNDLE_BYTES:raise RestorationError('Cluster bundle exceeds budget')
                        contents=bytes(data)
                    _write_native_zip_member(zin,zout,member,extras[member.filename],contents)
                template=zin.read(bundles[0])
                for z in levels:
                    if z in native_levels:continue
                    grouped=defaultdict(list)
                    for (row,col),cells in grids[z].items():
                        coordinates.add((z,row,col));coverage[z].update(f['properties']['gers_id'] for points in cells.values() for f in points)
                        payload=gzip.compress(cluster_layer(cells,score_index,z,row,col),mtime=0)
                        rb,cb=(row//128)*128,(col//128)*128
                        grouped[(rb,cb)].append(((row-rb)*128+col-cb,payload));tiles+=1
                    for (rb,cb),entries in grouped.items():
                        name=root+'/tile/L'+str(z).zfill(2)+'/R'+format(rb,'04x')+'C'+format(cb,'04x')+'.bundle'
                        added[name]=new_bundle(template,entries)
                added[root+'/tilemap/root.json']=json.dumps(tile_index(coordinates),separators=(',',':')).encode()
                for name,contents in sorted(added.items()):
                    if name in names:raise RestorationError('Additional resource already exists')
                    member=copy(members[0]);member.filename=name;member.orig_filename=name
                    _write_native_zip_member(zin,zout,member,b'',contents)
            if seen!=set(expected) or any(ids!=set(expected) for ids in coverage.values()):raise RestorationError('Cached tiles do not cover every source point at every level')
            with zipfile.ZipFile(staged) as check:
                if check.testzip() is not None or set(check.namelist())!=set(names)|set(added) or {k:v for k,v in _local_zip_extra_fields(staged,check.infolist()).items() if k in extras}!=extras:raise RestorationError('Cluster archive validation failed')
                # Read back counts and prove every native layer field stayed exact.
                totals=Counter()
                for member in members:
                    actual=check.getinfo(member.filename)
                    if actual.extra!=member.extra:raise RestorationError('Central ZIP metadata changed')
                    if member in bundles:
                        before=dict(_bundle_tiles(zin,member,16384));z=int(BUNDLE_PATH.fullmatch(member.filename)['z'])
                        for slot,payload in _bundle_tiles(check,actual,16384):
                            raw=gzip.decompress(payload);old=before[slot];old=gzip.decompress(old) if old[:2]==b'\x1f\x8b' else old
                            if not raw.startswith(old):raise RestorationError('Native tile data changed')
                            for name,attrs in tile_properties(payload):
                                if name==LAYER:totals[z]+=attrs['n_all']
                    elif member.filename in updates:
                        if check.read(actual)!=updates[member.filename]:raise RestorationError('Metadata read-back failed')
                    elif (actual.CRC,actual.file_size)!=(member.CRC,member.file_size):raise RestorationError('Unrelated resource changed')
                for name,contents in added.items():
                    if check.read(name)!=contents:raise RestorationError('Additional resource read-back failed')
                    if name.endswith('.bundle'):
                        z=int(BUNDLE_PATH.fullmatch(name)['z'])
                        for _,payload in _bundle_tiles(check,check.getinfo(name),16384):
                            for layer,attrs in tile_properties(payload):
                                if layer==LAYER:totals[z]+=attrs['n_all']
                if any(totals[z]!=len(records) for z in levels):raise RestorationError('Cluster counts do not match full source')
                if sum(m.file_size for m in check.infolist())>MAX_PACKAGE_BYTES:raise RestorationError('Prepared package exceeds budget')
        publish_files([(staged,target)])
    return {'sourcePlaces':len(records),'tiles':tiles,'cachedLevels':levels,'clusterMaxZoom':cluster_max,'nativeLayersPreserved':True,'portalPublishingTested':False}


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--input',required=True);p.add_argument('--source',required=True);p.add_argument('--output',required=True);a=p.parse_args()
    try:print(json.dumps(prepare(a.input,a.source,a.output)))
    except (ValueError,OSError,zipfile.BadZipFile) as e:p.exit(1,'Places preparation: '+str(e)+'\n')
