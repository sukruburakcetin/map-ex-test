#!/usr/bin/env python3
"""Restore source attributes to a new copy of a Pro-generated Places VTPK.

Offline, standard-library Python only. Matches exact name/category plus point
position within one MVT unit plus 0.1 mm projected rounding. Exact coincident
records are restored one-for-one only when native geometry, attributes and
cardinality agree and there are no native feature IDs; other ambiguities fail.
All source IDs must be represented. Geometry, original attributes and other
resources are verified after writing, before exclusive output publication.
"""
from collections import defaultdict
from copy import copy
import argparse
import gzip
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import re
import shutil
import struct
import sys
import tempfile
from urllib.parse import urlsplit, urlunsplit
import zipfile

from inspect_places_vtpk import _fields, _packed, _bundle_tiles, tile_properties, MAX_TILE_BYTES
from places_geojson import portal_feature, publish_files

PLACE_FIELDS = ('gers_id','place_name','category','icon_group','confidence','operating_status','address','website','data_release')
MAX_PACKAGE_BYTES = 512 * 1024 * 1024
MAX_BUNDLE_BYTES = 32 * 1024 * 1024
INDEX_END = 64 + 131072
WEB_MERCATOR_WORLD_METERS = 40075016.68557849
PROJECTED_ROUNDING_METERS = 0.0001
BUNDLE_PATH = re.compile(r'^(?P<root>[^/]+)/tile/L(?P<z>\d+)/R(?P<row>[0-9a-f]+)C(?P<col>[0-9a-f]+)\.bundle$')


class RestorationError(ValueError):
    """Diagnostics contain counts/field names, never source record values."""


def query_layer_url(value):
    if value is None:
        return None
    if not isinstance(value,str) or any(c.isspace() for c in value.strip()):
        raise RestorationError('Use a valid HTTPS query-layer URL')
    u = urlsplit(value.strip())
    try:_ = u.port
    except ValueError as error:raise RestorationError('Invalid query-layer URL port') from error
    if u.scheme != 'https' or not u.netloc or u.username or u.password or u.query or u.fragment or not re.search(r'/FeatureServer/\d+$',u.path.rstrip('/'),re.I):
        raise RestorationError('Use a credential-free HTTPS FeatureServer numeric layer URL')
    return urlunsplit((u.scheme,u.netloc,u.path.rstrip('/'),'',''))


def load_source(path):
    path = Path(path)
    if path.stat().st_size > 128 * 1024 * 1024:
        raise RestorationError('Use a regional GeoJSON of at most 128 MiB')
    def invalid(_):
        raise RestorationError('Source contains a non-finite JSON number')
    with path.open(encoding='utf-8-sig') as stream:
        source = json.load(stream,parse_constant=invalid)
    if not isinstance(source,dict) or source.get('type') != 'FeatureCollection' or not isinstance(source.get('features'),list):
        raise RestorationError('Source must be the exact GeoJSON FeatureCollection used to build this package')
    if not 1 <= len(source['features']) <= 100000:
        raise RestorationError('Source must contain 1..100000 places')
    records, seen, releases = [], set(), set()
    for item in source['features']:
        feature = portal_feature(item)
        p = feature['properties']
        if p['gers_id'] in seen:
            raise RestorationError('Duplicate source GERS IDs')
        seen.add(p['gers_id'])
        if not isinstance(p['data_release'],str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+',p['data_release']):
            raise RestorationError('Source records must identify a pinned Overture release')
        releases.add(p['data_release'])
        records.append(feature)
    if len(releases) != 1:
        raise RestorationError('Source mixes different Overture releases')
    return records, next(iter(releases))


def _varint(value):
    if type(value) is not int or value < 0:
        raise RestorationError('Invalid protobuf integer')
    b = bytearray()
    while value > 127:
        b.append((value & 127) | 128); value >>= 7
    b.append(value)
    return bytes(b)


def _pack(number, wire, value):
    tag = _varint(number * 8 + wire)
    return tag + (_varint(value) if wire == 0 else _varint(len(value)) + value if wire == 2 else value)


def _encode_value(value):
    if isinstance(value,str):
        return _pack(1,2,value.encode('utf-8'))
    if type(value) in (int,float) and math.isfinite(value):
        return _pack(3,1,struct.pack('<d',value))
    raise RestorationError('Unsupported source attribute type')


def _inflate(payload):
    if len(payload) > MAX_TILE_BYTES:
        raise RestorationError('Compressed tile exceeds 4 MiB')
    if payload[:2] == b'\x1f\x8b':
        with gzip.GzipFile(fileobj=io.BytesIO(payload)) as stream:
            result = stream.read(MAX_TILE_BYTES+1)
    else:
        result = payload
    if len(result) > MAX_TILE_BYTES:
        raise RestorationError('Decoded tile exceeds 4 MiB')
    return result


def _point(feature):
    fields = list(_fields(feature))
    if [v for n,w,v in fields if n == 3 and w == 0] != [1]:
        raise RestorationError('Only single point features can be restored')
    geometry = [v for n,w,v in fields if n == 4 and w == 2]
    if len(geometry) != 1:
        raise RestorationError('Expected one point geometry field')
    commands = list(_packed(geometry[0]))
    if len(commands) != 3 or commands[0] != 9:
        raise RestorationError('Multipoints and other geometry commands require investigation')
    return ((commands[1] >> 1) ^ -(commands[1] & 1), (commands[2] >> 1) ^ -(commands[2] & 1))


class SourceIndex:
    """One zoom/extent index at a time; no all-record scan for each tile feature."""
    def __init__(self,records):
        self.records = records
        self.geometry_digest = hashlib.sha256()
        self.locations = {f['properties']['gers_id']:tuple(f['geometry']['coordinates'][:2]) for f in records}
        self.coincident_ids = set()
        self.signature = None
        self.buckets = None
        self.projected = []
        for f in records:
            lon,lat = f['geometry']['coordinates'][:2]
            if abs(lat) > 85.0511287798066:
                raise RestorationError('Source is outside the finite Web Mercator tile range')
            self.projected.append(((lon+180)/360,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2,f['properties']))

    def candidates(self,name,group,z,extent,gx,gy):
        signature = (z,extent)
        if signature != self.signature:
            buckets = defaultdict(list)
            scale = 2**z * extent
            for nx,ny,p in self.projected:
                x,y = nx*scale,ny*scale
                buckets[(p['place_name'] or '',p['icon_group'],math.floor(x/2),math.floor(y/2))].append((x,y,p))
            self.buckets, self.signature = buckets, signature
        cx,cy = math.floor(gx/2),math.floor(gy/2)
        candidates = []
        # GDB/projected-coordinate rounding is much smaller than a tile unit.
        # Bound it in projected metres, rather than widening a nearest-neighbour search.
        tolerance = 1.000001 + PROJECTED_ROUNDING_METERS * (2**z * extent) / WEB_MERCATOR_WORLD_METERS
        radius = math.ceil(tolerance/2)
        for dx in range(-radius,radius+1):
            for dy in range(-radius,radius+1):
                for x,y,p in self.buckets.get((name,group,cx+dx,cy+dy),()):
                    if abs(x-gx) <= tolerance and abs(y-gy) <= tolerance:
                        candidates.append(p)
        if not candidates:
            raise RestorationError('A tile point has no exact name/category and position match in the source')
        return candidates

    def match(self,name,group,z,extent,gx,gy):
        candidates = self.candidates(name,group,z,extent,gx,gy)
        if len(candidates) != 1:
            raise RestorationError('Ambiguous source match; no nearest-place guess was made')
        return candidates[0]


def _symbol_groups(style,layer_name):
    mapping = {}
    layers = style.get('layers')
    if style.get('version') != 8 or not isinstance(layers,list):
        raise RestorationError('Expected a version 8 Pro vector tile style')
    for layer in layers:
        if layer.get('source-layer') and layer['source-layer'] != layer_name:
            raise RestorationError('Use a dedicated single-source-layer Places package')
        if layer.get('source-layer') != layer_name or layer.get('type') != 'circle':
            continue
        f = layer.get('filter')
        if not isinstance(f,list) or len(f)!=3 or f[:2]!=['==','_symbol'] or type(f[2]) is not int:
            raise RestorationError('Expected Pro category circle layers with simple _symbol filters')
        family = layer.get('id','').rsplit('/',1)[-1]
        if not re.fullmatch(r'[a-z_]+',family) or f[2] in mapping and mapping[f[2]] != family:
            raise RestorationError('Ambiguous symbol-to-category style mapping')
        mapping[f[2]] = family
    if not mapping:
        raise RestorationError('No supported Pro category renderer found')
    return mapping


def _assign_layer_sources(raw_features,properties,z,row,col,extent,index,groups,stats):
    """Assign indistinguishable coincident native points as a set, never by distance.

    With identical coordinates/labels/style and no native IDs there is no distinct
    native identity to infer. Restore every distinct source object exactly once
    across an equal number of identical native feature shells. Different positions,
    native IDs, metadata or multiplicity remain unsupported and fail closed.
    """
    assignments = [None] * len(raw_features)
    coincident = defaultdict(list)
    for position,(raw,attrs) in enumerate(zip(raw_features,properties)):
        symbol,name = attrs.get('_symbol'),attrs.get('_name','')
        if type(symbol) is not int or symbol not in groups or not isinstance(name,str):
            raise RestorationError('Missing Pro symbol or name attributes')
        x,y = _point(raw)
        candidates = index.candidates(name,groups[symbol],z,extent,col*extent+x,row*extent+y)
        if 'gers_id' in attrs:
            identified = [p for p in candidates if p['gers_id'] == attrs['gers_id']]
            if len(identified) != 1:
                raise RestorationError('Existing restored identity differs from the source')
            assignments[position] = identified[0]
        elif len(candidates) == 1:
            assignments[position] = candidates[0]
        else:
            if len({index.locations[p['gers_id']] for p in candidates}) != 1:
                raise RestorationError('Ambiguous distinct source positions; no nearest-place guess was made')
            fields = list(_fields(raw))
            if any(n == 1 for n,w,v in fields):
                raise RestorationError('Coincident native feature IDs cannot be associated safely without a source identity key')
            if any(key in attrs for key in PLACE_FIELDS):
                raise RestorationError('Partially restored coincident records require investigation')
            # Include ALL original non-tag fields and original properties: rows
            # with other native differences must not be treated as interchangeable.
            shell = tuple((n,w,v) for n,w,v in fields if n != 2)
            attribute_signature = json.dumps(attrs,sort_keys=True,ensure_ascii=False,allow_nan=False,separators=(',',':'))
            identities = tuple(sorted(p['gers_id'] for p in candidates))
            coincident[(identities,shell,attribute_signature)].append((position,candidates))
    for (identities,_,_),entries in coincident.items():
        if len(entries) != len(identities):
            raise RestorationError('Coincident native/source record counts differ; no objects were discarded or fabricated')
        by_id = {p['gers_id']:p for p in entries[0][1]}
        for (position,_),identifier in zip(entries,identities):
            assignments[position] = by_id[identifier]
        index.coincident_ids.update(identities)
        stats['coincidentGroupsRestored'] += 1
        stats['coincidentFeatureInstancesRestored'] += len(entries)
    if any(p is None for p in assignments):
        raise RestorationError('A source assignment is missing')
    return assignments


def _rewrite_tile(payload,z,row,col,source_index,groups,layer_name,matched,stats):
    data = _inflate(payload)
    tile_out = []
    for number,wire,value in _fields(data):
        if number != 3 or wire != 2:
            tile_out.append(_pack(number,wire,value));continue
        layer = list(_fields(value))
        names = [v.decode('utf-8') for n,w,v in layer if n==1 and w==2]
        if names != [layer_name]:
            raise RestorationError('Unexpected tile source layer')
        extent_values = [v for n,w,v in layer if n==5 and w==0]
        extent = extent_values[0] if len(extent_values)==1 else 4096
        if type(extent) is not int or not 256<=extent<=65536:
            raise RestorationError('Unsupported MVT extent')
        keys = [v.decode('utf-8') for n,w,v in layer if n==3 and w==2]
        values = [v for n,w,v in layer if n==4 and w==2]
        if len(keys)!=len(set(keys)):
            raise RestorationError('Duplicate MVT property keys')
        properties = [p for _,p in tile_properties(_pack(3,2,value))]
        feature_fields = [v for n,w,v in layer if n==2 and w==2]
        if len(properties)!=len(feature_fields):
            raise RestorationError('MVT feature table mismatch')
        key_indexes = {key:i for i,key in enumerate(keys)}
        value_indexes = {v:i for i,v in enumerate(values)}
        rewritten = []
        assignments = _assign_layer_sources(feature_fields,properties,z,row,col,extent,source_index,groups,stats)
        for raw,attrs,desired in zip(feature_fields,properties,assignments):
            symbol,name = attrs.get('_symbol'),attrs.get('_name','')
            if type(symbol) is not int or symbol not in groups or not isinstance(name,str):
                raise RestorationError('Missing Pro symbol or name attributes')
            x,y = _point(raw)
            fields = list(_fields(raw))
            tag_fields = [v for n,w,v in fields if n==2 and w==2]
            if len(tag_fields)!=1:
                raise RestorationError('Expected one MVT attribute tag field')
            tags = list(_packed(tag_fields[0]))
            if len(tags)%2 or len(tags[::2])!=len(set(tags[::2])):
                raise RestorationError('Invalid or duplicate MVT attribute tags')
            tag_pairs = dict(zip(tags[::2],tags[1::2]))
            for key in PLACE_FIELDS:
                expected = desired[key]
                if key in attrs and (attrs[key] != expected or key=='confidence' and expected is not None and type(attrs[key]) not in (int,float)):
                    raise RestorationError('Existing restored attribute differs from the source: '+key)
                if expected is None:
                    continue  # MVT has no null scalar; missing scores remain missing.
                if key not in key_indexes:
                    key_indexes[key]=len(keys);keys.append(key)
                encoded = _encode_value(expected)
                if encoded not in value_indexes:
                    value_indexes[encoded]=len(values);values.append(encoded)
                tag_pairs[key_indexes[key]]=value_indexes[encoded]
            new_tags = b''.join(_varint(k)+_varint(v) for k,v in tag_pairs.items())
            new_feature = b''.join(_pack(n,w,new_tags if n==2 and w==2 else v) for n,w,v in fields)
            if _point(new_feature)!=(x,y):
                raise RestorationError('Geometry changed unexpectedly')
            # Type, ID, raw geometry commands and unknown fields must be byte-equivalent.
            if [(n,w,v) for n,w,v in _fields(new_feature) if n!=2] != [(n,w,v) for n,w,v in fields if n!=2]:
                raise RestorationError('Feature fields other than attributes changed')
            for gn,gw,gv in fields:
                if gn==4 and gw==2:source_index.geometry_digest.update(gv)
            rewritten.append(new_feature)
            matched.add(desired['gers_id']);stats['featureInstancesRestored']+=1
        original_key_count,original_value_count = len([1 for n,w,v in layer if n==3 and w==2]),len([1 for n,w,v in layer if n==4 and w==2])
        features = iter(rewritten)
        layer_out = [_pack(n,w,next(features) if n==2 and w==2 else v) for n,w,v in layer]
        layer_out.extend(_pack(3,2,key.encode('utf-8')) for key in keys[original_key_count:])
        layer_out.extend(_pack(4,2,v) for v in values[original_value_count:])
        tile_out.append(_pack(3,2,b''.join(layer_out)))
    result = b''.join(tile_out)
    if len(result)>MAX_TILE_BYTES:
        raise RestorationError('Restored tile exceeds the 4 MiB decoded-tile budget')
    compressed = gzip.compress(result,mtime=0) if payload[:2]==b'\x1f\x8b' else result
    if len(compressed)>MAX_TILE_BYTES:
        raise RestorationError('Restored tile exceeds the encoded-tile budget')
    # Independent read-back of every resulting feature through the inspector.
    for _,attrs in tile_properties(compressed):
        if attrs.get('gers_id') not in matched:
            raise RestorationError('Restored tile identity verification failed')
    stats['tilesRestored']+=1
    return compressed


def _rewrite_bundle(archive,member,source_index,groups,layer_name,matched,stats):
    match = BUNDLE_PATH.fullmatch(member.filename)
    if not match:
        raise RestorationError('Unsupported vector bundle path')
    z,row_base,col_base = int(match['z']),int(match['row'],16),int(match['col'],16)
    if not 0<=z<=22 or row_base%128 or col_base%128:
        raise RestorationError('Invalid vector bundle tile coordinates')
    # The reader validates header variants, count, all offsets and length prefixes.
    observations = {}
    entries = list(_bundle_tiles(archive,member,16384,observations))
    with archive.open(member) as stream:
        fixed = bytearray(stream.read(INDEX_END))
    if len(fixed)!=INDEX_END:
        raise RestorationError('Truncated compact bundle index')
    output = bytearray(fixed)
    max_size=0
    for slot,payload in sorted(entries):
        row,col = row_base+slot//128,col_base+slot%128
        if row>=2**z or col>=2**z:
            raise RestorationError('Tile coordinate is outside the Web Mercator world')
        result = _rewrite_tile(payload,z,row,col,source_index,groups,layer_name,matched,stats)
        offset = len(output)+4
        output.extend(struct.pack('<I',len(result)));output.extend(result)
        struct.pack_into('<Q',output,64+slot*8,(len(result)<<40)|offset)
        max_size=max(max_size,len(result))
        if len(output)>MAX_BUNDLE_BYTES:
            raise RestorationError('Restored bundle exceeds 32 MiB')
    struct.pack_into('<Q',output,16,0)  # Repacking removes any original slack.
    struct.pack_into('<Q',output,24,len(output))
    # Pro uses an index/user-record floor of 131092, not a magic constant.
    # Enrichment can grow a tile beyond that floor; the declared maximum must
    # cover the new payload or native cache readers can reject the bundle.
    if observations['layout']=='compact-v2-capacity-count':
        struct.pack_into('<I',output,8,max_size)
    else:
        struct.pack_into('<I',output,8,max(observations['maximumRecordSize'],max_size))
    stats['bundlesRestored']+=1
    return bytes(output)


def _local_zip_extra_fields(package_path,members):
    """Keep local and central extras separate, as in the native Pro container.

    ZipInfo.extra describes CENTRAL directory fields. Python otherwise duplicates
    those bytes into local headers, unlike the native Pro package layout.
    """
    extras = {}
    with Path(package_path).open('rb') as stream:
        for member in members:
            stream.seek(member.header_offset)
            header = stream.read(30)
            if len(header)!=30 or header[:4]!=b'PK\x03\x04':
                raise RestorationError('Invalid native ZIP local file header')
            name_length,extra_length = struct.unpack_from('<HH',header,26)
            name = stream.read(name_length)
            extra = stream.read(extra_length)
            encoding = 'utf-8' if member.flag_bits & 0x800 else 'cp437'
            if len(name)!=name_length or len(extra)!=extra_length or name.decode(encoding)!=member.filename:
                raise RestorationError('Native ZIP local/central filename mismatch')
            extras[member.filename] = extra
    return extras


def _write_native_zip_member(source_archive,target_archive,member,local_extra,contents=None):
    """Preserve the native separation of local and central ZIP metadata."""
    target=copy(member)
    target.extra=local_extra
    try:
        if contents is None:
            with source_archive.open(member) as source,target_archive.open(target,'w') as destination:
                shutil.copyfileobj(source,destination,64*1024)
        else:
            target_archive.writestr(target,contents)
    finally:
        # The central directory is written on close from this same ZipInfo object.
        target.extra=member.extra


def restore_package(input_package,source_geojson,output_package,*,query_url=None,report_path=None):
    input_package,output_package = Path(input_package).resolve(),Path(output_package).resolve()
    report_path = Path(report_path).resolve() if report_path else output_package.with_suffix('.restoration.json')
    if output_package.suffix.lower()!='.vtpk' or len({input_package,output_package,report_path,Path(source_geojson).resolve()})!=4:
        raise RestorationError('Use different input, source, output .vtpk and report paths')
    if output_package.exists() or report_path.exists():
        raise RestorationError('Output or report already exists; choose new names')
    query_url = query_layer_url(query_url)
    records,release = load_source(source_geojson)
    source_index = SourceIndex(records)
    expected_ids = {f['properties']['gers_id'] for f in records}
    output_package.parent.mkdir(parents=True,exist_ok=True)
    report_path.parent.mkdir(parents=True,exist_ok=True)
    if report_path.parent!=output_package.parent:
        raise RestorationError('Keep package and report in the same output directory')
    stats = {'kind':'places-vtpk-attribute-restoration','version':1,'sourceRecords':len(records),'release':release,
             'featureInstancesRestored':0,'tilesRestored':0,'bundlesRestored':0,'geometryPreserved':False,
             'completeSourceCoverageVerified':False,'portalPublishingTested':False,'portalDatasetMatchTested':False,
             'pairedQueryUrlConfigured':query_url is not None,'coincidentGroupsRestored':0,
             'coincidentFeatureInstancesRestored':0,'projectedRoundingToleranceMeters':PROJECTED_ROUNDING_METERS}
    matched,modified,unchanged = set(),set(),{}
    with tempfile.TemporaryDirectory(prefix='.places-restore-',dir=output_package.parent) as folder:
        staged=Path(folder)/'restored.vtpk'
        with zipfile.ZipFile(input_package) as zin:
            members=zin.infolist()
            names=[m.filename for m in members]
            local_extras=_local_zip_extra_fields(input_package,members)
            if len(names)>20000 or len(names)!=len(set(names)) or any('..' in PurePosixPath(n).parts or n.startswith('/') or '\\' in n for n in names):
                raise RestorationError('Invalid or duplicate package member paths')
            if sum(m.file_size for m in members)>MAX_PACKAGE_BYTES or any(m.flag_bits&1 for m in members):
                raise RestorationError('Encrypted or oversized package is not supported')
            bundles=[m for m in members if m.filename.endswith('.bundle')]
            roots={BUNDLE_PATH.fullmatch(m.filename)['root'] for m in bundles if BUNDLE_PATH.fullmatch(m.filename)}
            if not bundles or len(roots)!=1 or any(not BUNDLE_PATH.fullmatch(m.filename) for m in bundles):
                raise RestorationError('Expected one Pro vector cache root')
            root=next(iter(roots));style_path=root+'/resources/styles/root.json'
            if style_path not in names or zin.getinfo(style_path).file_size>1024*1024:
                raise RestorationError('Missing or oversized native Pro style')
            cache_path=root+'/root.json'
            if cache_path not in names or zin.getinfo(cache_path).file_size>1024*1024:
                raise RestorationError('Missing native vector cache metadata')
            cache=json.loads(zin.read(cache_path).decode('utf-8-sig'))
            info=cache.get('tileInfo',{});sr=info.get('spatialReference',{})
            origin=info.get('origin',{});storage=cache.get('resourceInfo',{}).get('cacheInfo',{}).get('storageInfo',{})
            if (info.get('rows')!=512 or info.get('cols')!=512 or (sr.get('latestWkid') or sr.get('wkid')) not in (3857,102100,102113)
                or abs(origin.get('x',0)+20037508.342789244)>1 or abs(origin.get('y',0)-20037508.342789244)>1
                or storage.get('packetSize')!=128 or storage.get('storageFormat')!='compactV2'):
                raise RestorationError('Expected the standard native Pro 512-pixel Web Mercator Compact V2 cache')
            for member in bundles:
                level=int(BUNDLE_PATH.fullmatch(member.filename)['z'])
                lods=[lod for lod in info.get('lods',[]) if lod.get('level')==level]
                if len(lods)!=1 or abs(lods[0].get('resolution',0)-78271.51696402048/2**level)>0.00001:
                    raise RestorationError('Native tile level does not use the expected Web Mercator resolution')
            style=json.loads(zin.read(style_path).decode('utf-8-sig'))
            groups=_symbol_groups(style,'places')
            if query_url:
                style.setdefault('metadata',{})['mly:places']={'version':1,'queryUrl':query_url,'sourceLayers':['places'],
                    'fields':list(PLACE_FIELDS),'release':release,'sourceFeatureCount':len(records)}
            with zipfile.ZipFile(staged,'w') as zout:
                zout.comment=zin.comment
                for member in members:
                    if member.filename.endswith('.bundle'):
                        contents=_rewrite_bundle(zin,member,source_index,groups,'places',matched,stats)
                        _write_native_zip_member(zin,zout,member,local_extras[member.filename],contents)
                        modified.add(member.filename)
                    elif member.filename==style_path and query_url:
                        contents=json.dumps(style,ensure_ascii=False,separators=(',',':')).encode('utf-8')
                        _write_native_zip_member(zin,zout,member,local_extras[member.filename],contents)
                        modified.add(member.filename)
                    else:
                        _write_native_zip_member(zin,zout,member,local_extras[member.filename])
                        unchanged[member.filename]=(member.CRC,member.file_size)
            missing=expected_ids-matched
            if missing:
                raise RestorationError(f'{len(missing)} source places are absent from the package; use the exact build source or rebuild the complete dataset')
            if matched!=expected_ids:
                raise RestorationError('Package identities differ from the exact source')
        # Reopen the finished ZIP, verify CRCs and parse every restored tile again.
        verified=set();instances=0;geometry=hashlib.sha256()
        with zipfile.ZipFile(staged) as check:
            if set(check.namelist())!=set(names) or check.testzip() is not None:
                raise RestorationError('Package archive validation failed')
            if _local_zip_extra_fields(staged,check.infolist())!=local_extras:
                raise RestorationError('Native ZIP local-header extras changed unexpectedly')
            central_extras={m.filename:m.extra for m in members}
            if {m.filename:m.extra for m in check.infolist()}!=central_extras:
                raise RestorationError('Native ZIP central-directory extras changed unexpectedly')
            for name,(crc,size) in unchanged.items():
                info=check.getinfo(name)
                if (info.CRC,info.file_size)!=(crc,size):
                    raise RestorationError('A non-tile resource changed unexpectedly')
            wanted={f['properties']['gers_id']:f['properties'] for f in records}
            for member in check.infolist():
                if not member.filename.endswith('.bundle'):continue
                for slot,payload in _bundle_tiles(check,member,16384):
                    for _,attrs in tile_properties(payload):
                        identifier=attrs.get('gers_id');p=wanted.get(identifier)
                        if p is None or any(attrs.get(key)!=p[key] for key in PLACE_FIELDS):
                            raise RestorationError('A restored attribute failed source read-back verification')
                        verified.add(identifier);instances+=1
                    for n,w,v in _fields(_inflate(payload)):
                        if n==3 and w==2:
                            for fn,fw,fv in _fields(v):
                                if fn==2 and fw==2:
                                    for gn,gw,gv in _fields(fv):
                                        if gn==4 and gw==2:geometry.update(gv)
        if geometry.hexdigest()!=source_index.geometry_digest.hexdigest():
            raise RestorationError('Final archive geometry digest differs from the original')
        if verified!=expected_ids or instances!=stats['featureInstancesRestored']:
            raise RestorationError('Complete restored source coverage was not verified')
        if staged.stat().st_size>MAX_PACKAGE_BYTES or sum(m.file_size for m in check.infolist())>MAX_PACKAGE_BYTES:
            raise RestorationError('Restored package exceeds 512 MiB')
        output_hash=hashlib.sha256()
        with staged.open('rb') as stream:
            for block in iter(lambda:stream.read(1024*1024),b''):output_hash.update(block)
        stats.update({'uniquePlacesRestored':len(verified),'completeSourceCoverageVerified':True,'geometryPreserved':True,
                      'otherResourcesUnchanged':True,'nativeZipHeaderLayoutPreserved':True,'distinctCoincidentPlacesRestored':len(source_index.coincident_ids),'archiveMembers':len(names),'geometryCommandsSha256':geometry.hexdigest(),'originalGeometryCommandsSha256':source_index.geometry_digest.hexdigest(),
                      'outputSha256':output_hash.hexdigest()})
        staged_report=Path(folder)/'restoration.json'
        staged_report.write_text(json.dumps(stats,indent=2),encoding='utf-8')
        publish_files([(staged,output_package),(staged_report,report_path)])
    return stats


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True,help='Existing native Pro .vtpk')
    parser.add_argument('--source',type=Path,required=True,help='Exact GeoJSON used to build this package')
    parser.add_argument('--output',type=Path,required=True,help='New .vtpk; original is never changed')
    parser.add_argument('--query-url',help='Matching HTTPS FeatureServer layer URL; no network request is made')
    args=parser.parse_args(argv)
    result=restore_package(args.input,args.source,args.output,query_url=args.query_url)
    print(f"Restored {result['uniquePlacesRestored']} places across {result['tilesRestored']} tiles. Geometry preserved. Portal publishing still needs testing.")
    return result


if __name__=='__main__':
    try:main()
    except Exception as error:
        print(f'Restoration failed: {error}',file=sys.stderr);sys.exit(1)
