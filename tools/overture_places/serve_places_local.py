#!/usr/bin/env python3
"""Local-only HTTPS vector-tile and picking harness. Python standard library only."""
import argparse
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import math
from pathlib import Path
import sqlite3
import ssl
import threading
import unicodedata
from urllib.parse import urlparse,parse_qs,urlencode
from places_sprite import make_sprite,GROUPS
from place_categories import icon_group
from collections import Counter


def confidence_filter(value):
    if value is None:return None
    try: threshold=float(value)
    except (ValueError,TypeError):raise ValueError('Confidence must be a number between 0 and 1')
    if not math.isfinite(threshold) or not 0<=threshold<=1:raise ValueError('Confidence must be between 0 and 1')
    return threshold


def normalize_search(value):
    if not isinstance(value,str) or len(value)>120:raise ValueError('Search text must contain at most 120 characters')
    return ''.join(c for c in unicodedata.normalize('NFKD',value.strip().casefold()) if not unicodedata.combining(c))


def request_filters(query):
    params=parse_qs(query,keep_blank_values=True)
    threshold=confidence_filter(params.get('min_confidence',[None])[0])
    closed=params.get('hide_closed',['0'])[0]
    if closed not in ('0','1'):raise ValueError('hide_closed must be 0 or 1')
    group=params.get('group',['all'])[0]
    if group not in ('all','health','education','parks','landmarks','services'):raise ValueError('Invalid place group')
    family=params.get('family',['all'])[0]
    if family!='all' and family not in GROUPS:raise ValueError('Invalid icon family')
    return threshold,closed=='1',group,family


def varint(value):
    output = bytearray()
    while value > 127:
        output.append((value & 127) | 128)
        value >>= 7
    output.append(value)
    return bytes(output)


def field(number, value):
    if isinstance(value, int):
        return varint(number << 3) + varint(value)
    return varint((number << 3) | 2) + varint(len(value)) + value


def tile_bytes(points):
    """MVT v2: bounded representatives, counts and short collision-managed labels."""
    features, values = [], []
    for index, point in enumerate(points):
        identifier, x, y, group = point[:4]
        count, name = point[4:] if len(point)>4 else (1,'')
        values.extend([field(1,str(identifier).encode()),field(1,group.encode()),field(5,count),field(1,name.encode())])
        zigzag = lambda value: (value << 1) ^ (value >> 31)
        commands = varint(9) + varint(zigzag(x)) + varint(zigzag(y))
        tags=b''.join(varint(k)+varint(index*4+k) for k in range(4))
        features.append(field(1,index+1)+field(2,tags)+field(3,1)+field(4,commands))
    layer=field(15,2)+field(1,b'places')+b''.join(field(2,f) for f in features)
    layer+=b''.join(field(3,k) for k in [b'gers_id',b'icon_group',b'count',b'place_name'])+b''.join(field(4,v) for v in values)+field(5,4096)
    return field(3,layer)


def project(lon, lat):
    if not -180 <= lon <= 180 or not -85.051129 <= lat <= 85.051129:
        raise ValueError('Point is outside supported Web Mercator bounds')
    return (lon+180)/360, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2


def query_extent(geometry):
    wkid = geometry.get('spatialReference',{}).get('latestWkid') or geometry.get('spatialReference',{}).get('wkid')
    xmin,ymin,xmax,ymax = [float(geometry[k]) for k in ['xmin','ymin','xmax','ymax']]
    if not all(math.isfinite(n) for n in [xmin,ymin,xmax,ymax]) or xmin>=xmax or ymin>=ymax:
        raise ValueError('Invalid extent')
    if wkid == 4326:
        west,north = project(xmin,ymin);east,south = project(xmax,ymax)
    elif wkid in [3857,102100,102113]:
        world = 2*math.pi*6378137
        west,east = xmin/world+.5,xmax/world+.5
        south,north = .5-ymax/world,.5-ymin/world
    else:
        raise ValueError('Only WGS84 and Web Mercator extents are supported')
    return west,south,east,north


class Dataset:
    def __init__(self, source):
        self.lock = threading.Lock()
        self.db = sqlite3.connect(':memory:', check_same_thread=False)
        # Great-circle distance ordering stays in SQLite, before the bounded response.
        def proximity(lon,lat,origin_lon,origin_lat):
            dlat=math.radians(lat-origin_lat);dlon=math.radians(lon-origin_lon)
            return math.sin(dlat/2)**2+math.cos(math.radians(lat))*math.cos(math.radians(origin_lat))*math.sin(dlon/2)**2
        self.db.create_function('proximity',4,proximity,deterministic=True)
        self.db.execute('CREATE TABLE places (id INTEGER PRIMARY KEY, gers TEXT UNIQUE, x REAL, y REAL, lon REAL, lat REAL, properties TEXT, icon_group TEXT, confidence REAL, operating_status TEXT, place_group TEXT, search_text TEXT)')
        self.db.execute('CREATE VIRTUAL TABLE spatial USING rtree(id,minx,maxx,miny,maxy)')
        manifest = json.loads(source.with_suffix('.manifest.json').read_text(encoding='utf-8'))
        if manifest.get('schema') != 'overture-places-all-pilot-v1':
            raise ValueError('Expected export_all_places.py output and matching manifest')
        self.icon_counts=Counter()
        self.unmapped_categories=Counter()
        with source.open(encoding='utf-8') as stream:
            count = 0
            for count, line in enumerate(stream, 1):
                if count > 100000:
                    raise ValueError('Local harness is limited to 100,000 POIs')
                feature = json.loads(line)
                lon, lat = feature['geometry']['coordinates']
                x, y = project(lon,lat)
                properties = feature['properties']
                if not properties.get('gers_id') or properties.get('data_release') != manifest['release']:
                    raise ValueError('Missing ID or mismatched release')
                group=icon_group(properties.get('category'))
                self.icon_counts[group]+=1
                if group=='other':self.unmapped_categories[properties.get('category') or '(missing category)']+=1
                confidence=confidence_filter(properties.get('confidence'))
                place_group=group if group in ('health','education','parks','landmarks','services') else 'services' if group in ('bank','grocery','convenience','fuel') else 'other'
                search_text= ''.join(c for c in unicodedata.normalize('NFKD',' '.join(str(properties.get(k) or '') for k in ('place_name','category','address')).replace('_',' ').casefold()) if not unicodedata.combining(c))
                self.db.execute('INSERT INTO places VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', (count,properties['gers_id'],x,y,lon,lat,json.dumps(properties,allow_nan=False),group,confidence,properties.get('operating_status'),place_group,search_text))
                self.db.execute('INSERT INTO spatial VALUES (?,?,?,?,?)', (count,x,x,y,y))
        if not count or count != manifest['feature_count']:
            raise ValueError('Empty data or manifest count mismatch')
        self.count, self.manifest = count, manifest
        self.db.execute('CREATE INDEX places_icon_family ON places(icon_group)')
        self.db.commit()

    def rows(self, west, south, east, north, limit, min_confidence=None, hide_closed=False,group='all',family='all',origin=None,offset=0,search=''):
        if group not in ('all','health','education','parks','landmarks','services'):raise ValueError('Invalid place group')
        if family!='all' and family not in GROUPS:raise ValueError('Invalid icon family')
        term=normalize_search(search)
        threshold=confidence_filter(min_confidence)
        ordering = ' ORDER BY proximity(p.lon,p.lat,?,?),p.gers' if origin is not None else ''
        with self.lock:
            return self.db.execute('''SELECT p.gers,p.x,p.y,p.lon,p.lat,p.properties,p.icon_group,p.place_group FROM spatial s
                JOIN places p ON p.id=s.id WHERE s.minx<=? AND s.maxx>=? AND s.miny<=? AND s.maxy>=?
                AND p.x BETWEEN ? AND ? AND p.y BETWEEN ? AND ?
                AND (? IS NULL OR p.confidence>=?)
                AND (?=0 OR p.operating_status IS NULL OR p.operating_status<>'permanently_closed')
                AND (?='all' OR p.place_group=?) AND (?='all' OR p.icon_group=?) AND (?='' OR instr(p.search_text,?)>0)''' + ordering + ' LIMIT ? OFFSET ?',
                (east,west,north,south,west,east,south,north,threshold,threshold,int(hide_closed),group,group,family,family,term,term)+ (tuple(origin) if origin is not None else ()) + (limit,offset)).fetchall()

    @lru_cache(maxsize=64)
    def tile_records(self,z,x,y,min_confidence=None,hide_closed=False,group='all',family='all'):
        scale=2**z
        rows=self.rows(x/scale,y/scale,(x+1)/scale,(y+1)/scale,5001,min_confidence,hide_closed,group,family) if z>=15 else ()
        if z>=15 and len(rows)<=5000:
            return tuple((r[0],r[1],r[2],r[6],1,str(json.loads(r[5]).get('place_name') or '')[:80]) for r in rows if x/scale<=r[1]<(x+1)/scale and y/scale<=r[2]<(y+1)/scale)
        # Aggregate ALL filtered matches in SQL, never a truncated point sample.
        # Global cell boundaries are aligned across tile edges: 64 px at overview,
        # 8 px for exceptionally dense street tiles. At most 64*64 representatives.
        cells=scale*(8 if z<15 else 64)
        threshold=confidence_filter(min_confidence)
        with self.lock:
            result=self.db.execute('''SELECT min(p.gers),avg(p.x),avg(p.y),count(*),min(p.icon_group),min(p.properties)
                FROM spatial s JOIN places p ON p.id=s.id
                WHERE s.minx<=? AND s.maxx>=? AND s.miny<=? AND s.maxy>=?
                AND p.x>=? AND p.x<? AND p.y>=? AND p.y<?
                AND (? IS NULL OR p.confidence>=?)
                AND (?=0 OR p.operating_status IS NULL OR p.operating_status<>'permanently_closed')
                AND (?='all' OR p.place_group=?) AND (?='all' OR p.icon_group=?)
                GROUP BY cast(p.x*? AS INTEGER),cast(p.y*? AS INTEGER)
                ORDER BY 2,3''',((x+1)/scale,x/scale,(y+1)/scale,y/scale,x/scale,(x+1)/scale,y/scale,(y+1)/scale,threshold,threshold,int(hide_closed),group,group,family,family,cells,cells)).fetchall()
        return tuple((r[0] if r[3]==1 else 'cluster:'+str(z)+':'+str(int(r[1]*cells))+':'+str(int(r[2]*cells)),r[1],r[2],r[4],r[3],str(json.loads(r[5]).get('place_name') or '')[:80] if r[3]==1 else '') for r in result)

    @lru_cache(maxsize=64)
    def tile(self,z,x,y,min_confidence=None,hide_closed=False,group='all',family='all'):
        scale=2**z
        return tile_bytes([(r[0],round((r[1]*scale-x)*4096),round((r[2]*scale-y)*4096),r[3],r[4],r[5]) for r in self.tile_records(z,x,y,min_confidence,hide_closed,group,family)])

    def cluster_query(self,geometry,zoom,min_confidence=None,hide_closed=False,group='all',family='all'):
        if isinstance(zoom,bool) or not isinstance(zoom,int) or not 12<=zoom<=19:raise ValueError('Invalid tile zoom')
        west,south,east,north=query_extent(geometry)
        scale=2**zoom;xs=range(max(0,int(west*scale)),min(scale,int(east*scale)+1));ys=range(max(0,int(south*scale)),min(scale,int(north*scale)+1))
        if len(xs)*len(ys)>16:raise ValueError('Pick area is too large; zoom closer')
        features=[]
        for x in xs:
            for y in ys:
                for identifier,px,py,icon,count,name in self.tile_records(zoom,x,y,min_confidence,hide_closed,group,family):
                    if not west<=px<=east or not south<=py<=north:continue
                    if count==1:
                        with self.lock:row=self.db.execute('SELECT properties,place_group FROM places WHERE gers=?',(identifier,)).fetchone()
                        attributes={**json.loads(row[0]),'place_group':row[1],'icon_group':icon}
                    else:attributes={'gers_id':identifier,'cluster_count':count}
                    features.append({'attributes':attributes,'geometry':{'x':px*360-180,'y':math.degrees(math.atan(math.sinh(math.pi*(1-2*py)))),'spatialReference':{'wkid':4326}}})
                    if len(features)>32:return {'features':features[:32],'exceededTransferLimit':True}
        return {'features':features,'exceededTransferLimit':False}

    def query(self,geometry,min_confidence=None,hide_closed=False,group='all',limit=32,family='all',origin=None,offset=0,search=''):
        term=normalize_search(search)
        if limit==32 and term:raise ValueError('Text search is only supported for area results')
        if limit not in (32,200):raise ValueError('Invalid query limit')
        if isinstance(offset,bool) or not isinstance(offset,int) or offset<0 or offset>100000 or offset%200 or (limit==32 and offset):raise ValueError('Invalid page offset')
        west,south,east,north=query_extent(geometry)
        if limit == 200:
            if origin is None:
                # Compatibility for direct /search clients without an explicit origin.
                center_x=(west+east)/2;center_y=(south+north)/2
                origin=[center_x*360-180,math.degrees(math.atan(math.sinh(math.pi*(1-2*center_y))))]
            if not isinstance(origin,dict) and not isinstance(origin,(list,tuple)):
                raise ValueError('Invalid search origin')
            if isinstance(origin,dict):origin=[origin.get('lon'),origin.get('lat')]
            if len(origin)!=2 or any(isinstance(v,bool) or not isinstance(v,(float,int)) or not math.isfinite(v) for v in origin) or not -180<=origin[0]<=180 or not -90<=origin[1]<=90:
                raise ValueError('Invalid search origin')
        else:origin=None  # Keep click candidate/truncation semantics unchanged.
        rows = self.rows(west,south,east,north,limit+1,min_confidence,hide_closed,group,family,origin,offset,search)
        return {'offset':offset,'nextOffset':offset+limit if len(rows)>limit else None,'exceededTransferLimit':len(rows)>limit,'features':[
            {'attributes':{**json.loads(row[5]),'place_group':row[7],'icon_group':row[6]},'geometry':{'x':row[3],'y':row[4],'spatialReference':{'wkid':4326}}} for row in rows[:limit]]}


def make_handler(dataset,base,origin):
    prefix=urlparse(base).path.rstrip('/')
    def service_route(path):return (path[len(prefix):] or '/') if prefix and (path==prefix or path.startswith(prefix+'/')) else path
    sprite_png,sprite_metadata=make_sprite()
    sprite_png_2x,sprite_metadata_2x=make_sprite(2)
    class Handler(BaseHTTPRequestHandler):
        def reply(self,status,body,kind='application/json'):
            if not isinstance(body,bytes): body=json.dumps(body).encode()
            self.send_response(status)
            self.send_header('Content-Type',kind)
            self.send_header('Content-Length',str(len(body)))
            self.send_header('Access-Control-Allow-Origin',origin)
            self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers','Content-Type')
            self.send_header('Access-Control-Allow-Private-Network','true')
            self.send_header('Cache-Control','no-store')
            self.end_headers();self.wfile.write(body)

        def do_OPTIONS(self): self.reply(200,b'')

        def do_GET(self):
            parsed=urlparse(self.path);route=service_route(parsed.path)
            try:threshold,hide_closed,group,family=request_filters(parsed.query)
            except ValueError as error:return self.reply(400,{'error':str(error)})
            params={}
            if threshold is not None:params['min_confidence']=threshold
            if hide_closed:params['hide_closed']='1'
            if group!='all':params['group']=group
            if family!='all':params['family']=family
            suffix='?'+urlencode(params) if params else ''
            if route=='/style.json':
                self.reply(200,{'version':8,'name':'Local Overture POI test','glyphs':'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf','sprite':base+'/sprites/places','sources':{'places':{
                    'type':'vector','tiles':[base+'/tiles/{z}/{x}/{y}.pbf'+suffix],'minzoom':12,'maxzoom':19,
                    'attribution':'Overture Maps · '+dataset.manifest['release']}},'layers':[{
                    'id':'places','type':'symbol','source':'places','source-layer':'places','minzoom':12,
                    'filter':['==','count',1],
                    'layout':{'icon-image':'{icon_group}','icon-size':0.8,'icon-allow-overlap':False,'icon-ignore-placement':False,'icon-padding':2}},
                    {'id':'place-counts','type':'circle','source':'places','source-layer':'places','filter':['>', 'count',1],
                     'paint':{'circle-color':'#345c43','circle-radius':{'property':'count','stops':[[2,14],[100,18],[10000,23]]},'circle-stroke-width':1,'circle-stroke-color':'#b4d9bc'}},
                    {'id':'place-count-labels','type':'symbol','source':'places','source-layer':'places','filter':['>','count',1],
                     'layout':{'text-field':'{count}','text-font':['Arial Unicode MS Regular'],'text-size':11,'text-allow-overlap':True},'paint':{'text-color':'#ffffff'}},
                    {'id':'place-names','type':'symbol','source':'places','source-layer':'places','minzoom':17,'filter':['==','count',1],
                     'layout':{'text-field':'{place_name}','text-font':['Arial Unicode MS Regular'],'text-size':11,'text-anchor':'top','text-offset':[0,1.2],'text-max-width':10,'text-allow-overlap':False},
                     'paint':{'text-color':'#173c28','text-halo-color':'#ffffff','text-halo-width':1.5}}]})
            elif route=='/sprites/places.json':self.reply(200,sprite_metadata)
            elif route=='/sprites/places.png':self.reply(200,sprite_png,'image/png')
            elif route=='/sprites/places@2x.json':self.reply(200,sprite_metadata_2x)
            elif route=='/sprites/places@2x.png':self.reply(200,sprite_png_2x,'image/png')
            elif route in ['/','/status']:
                self.reply(200,{'ready':True,'paging_version':1,'text_search_version':1,'scale_display_version':1,'category_filter_version':1,'supported_icon_families':list(GROUPS),'count':dataset.count,'min_confidence':threshold,'hide_closed':hide_closed,'group':group,'family':family,'release':dataset.manifest['release'],
                    'bbox':dataset.manifest['bbox'],'icon_counts':dict(dataset.icon_counts),'unmapped_categories':dict(dataset.unmapped_categories.most_common(20)),'style':base+'/style.json','query':base+'/query','search':base+'/search'})
            elif route.startswith('/tiles/'):
                try:
                    parts=route.split('/');z,x,y=int(parts[2]),int(parts[3]),int(parts[4].removesuffix('.pbf'))
                    if len(parts)!=5 or not 12<=z<=19 or not 0<=x<2**z or not 0<=y<2**z: raise ValueError('Invalid tile')
                    self.reply(200,dataset.tile(z,x,y,threshold,hide_closed,group,family),'application/x-protobuf')
                except (ValueError,IndexError) as error:self.reply(400,{'error':str(error)})
            else:self.reply(404,{'error':'Not found'})

        def do_POST(self):
            route=service_route(urlparse(self.path).path)
            if route not in ('/query','/search'):return self.reply(404,{'error':'Not found'})
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=8192:raise ValueError('Invalid request size')
                payload=json.loads(self.rfile.read(size))
                threshold,hide_closed,group,family=request_filters(urlparse(self.path).query)
                if route=='/query' and payload.get('zoom') is not None:
                    result=dataset.cluster_query(payload['geometry'],payload['zoom'],threshold,hide_closed,group,family)
                else:result=dataset.query(payload['geometry'],threshold,hide_closed,group,200 if route=='/search' else 32,family,payload.get('origin'),payload.get('offset',0),payload.get('text',''))
                self.reply(200,result)
            except (ValueError,KeyError,TypeError) as error:self.reply(400,{'error':str(error)})
    return Handler


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True)
    parser.add_argument('--cert',type=Path,help='Experience Builder server/cert/server.cert')
    parser.add_argument('--key',type=Path,help='Experience Builder server/cert/server.key')
    parser.add_argument('--port',type=int,default=3444)
    parser.add_argument('--public-url',help='Public HTTPS service root, optionally including a path prefix')
    parser.add_argument('--origin',default='https://localhost:3001',help='Origin of your Experience Builder application')
    args=parser.parse_args()
    if bool(args.cert) != bool(args.key): parser.error('Supply both --cert and --key')
    if not args.cert:
        for parent in [Path.cwd(), *Path.cwd().parents, *Path(__file__).resolve().parents]:
            folder=parent/'server'/'cert'
            if (folder/'server.cert').is_file() and (folder/'server.key').is_file():
                args.cert,args.key=folder/'server.cert',folder/'server.key';break
        if not args.cert: parser.error('Cannot find Experience Builder certificate. Supply --cert and --key pointing to its server/cert files')
    if not 1<=args.port<=65535: parser.error('Invalid port')
    base=(args.public_url or f'https://localhost:{args.port}').rstrip('/')
    address=urlparse(base)
    if address.scheme!='https' or not address.netloc or address.username or address.password or address.query or address.fragment:parser.error('Public URL must be an HTTPS root without credentials, query or fragment')
    dataset=Dataset(args.input)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),make_handler(dataset,base,args.origin))
    context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.load_cert_chain(args.cert,args.key)
    server.socket=context.wrap_socket(server.socket,server_side=True)
    print(f'Local POI server: {base}/status | {dataset.count} POIs | Ctrl+C to stop',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close();dataset.db.close()


if __name__=='__main__':main()
