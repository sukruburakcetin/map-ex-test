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
from urllib.parse import urlparse,parse_qs,urlencode
from places_sprite import make_sprite
from place_categories import icon_group
from collections import Counter


def confidence_filter(value):
    if value is None:return None
    try: threshold=float(value)
    except (ValueError,TypeError):raise ValueError('Confidence must be a number between 0 and 1')
    if not math.isfinite(threshold) or not 0<=threshold<=1:raise ValueError('Confidence must be between 0 and 1')
    return threshold


def request_filters(query):
    params=parse_qs(query,keep_blank_values=True)
    threshold=confidence_filter(params.get('min_confidence',[None])[0])
    closed=params.get('hide_closed',['0'])[0]
    if closed not in ('0','1'):raise ValueError('hide_closed must be 0 or 1')
    group=params.get('group',['all'])[0]
    if group not in ('all','health','education','parks','landmarks','services'):raise ValueError('Invalid place group')
    return threshold,closed=='1',group


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
    """MVT v2 point layer; only the stable ID is included as a tile attribute."""
    features, values = [], []
    for index, point in enumerate(points):
        identifier, x, y = point[:3]
        group = point[3] if len(point)>3 else 'other'
        values.extend([field(1, str(identifier).encode()),field(1,group.encode())])
        zigzag = lambda value: (value << 1) ^ (value >> 31)
        commands = varint(9) + varint(zigzag(x)) + varint(zigzag(y))
        features.append(field(1,index+1) + field(2,varint(0)+varint(index*2)+varint(1)+varint(index*2+1)) + field(3,1) + field(4,commands))
    layer = field(15,2) + field(1,b'places') + b''.join(field(2,f) for f in features)
    layer += field(3,b'gers_id') + field(3,b'icon_group') + b''.join(field(4,v) for v in values) + field(5,4096)
    return field(3,layer)


def project(lon, lat):
    if not -180 <= lon <= 180 or not -85.051129 <= lat <= 85.051129:
        raise ValueError('Point is outside supported Web Mercator bounds')
    return (lon+180)/360, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2


class Dataset:
    def __init__(self, source):
        self.lock = threading.Lock()
        self.db = sqlite3.connect(':memory:', check_same_thread=False)
        self.db.execute('CREATE TABLE places (id INTEGER PRIMARY KEY, gers TEXT UNIQUE, x REAL, y REAL, lon REAL, lat REAL, properties TEXT, icon_group TEXT, confidence REAL, operating_status TEXT, place_group TEXT)')
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
                self.db.execute('INSERT INTO places VALUES (?,?,?,?,?,?,?,?,?,?,?)', (count,properties['gers_id'],x,y,lon,lat,json.dumps(properties,allow_nan=False),group,confidence,properties.get('operating_status'),place_group))
                self.db.execute('INSERT INTO spatial VALUES (?,?,?,?,?)', (count,x,x,y,y))
        if not count or count != manifest['feature_count']:
            raise ValueError('Empty data or manifest count mismatch')
        self.count, self.manifest = count, manifest
        self.db.commit()

    def rows(self, west, south, east, north, limit, min_confidence=None, hide_closed=False,group='all'):
        if group not in ('all','health','education','parks','landmarks','services'):raise ValueError('Invalid place group')
        threshold=confidence_filter(min_confidence)
        with self.lock:
            return self.db.execute('''SELECT p.gers,p.x,p.y,p.lon,p.lat,p.properties,p.icon_group,p.place_group FROM spatial s
                JOIN places p ON p.id=s.id WHERE s.minx<=? AND s.maxx>=? AND s.miny<=? AND s.maxy>=?
                AND p.x BETWEEN ? AND ? AND p.y BETWEEN ? AND ?
                AND (? IS NULL OR p.confidence>=?)
                AND (?=0 OR p.operating_status IS NULL OR p.operating_status<>'permanently_closed')
                AND (?='all' OR p.place_group=?) LIMIT ?''',
                (east,west,north,south,west,east,south,north,threshold,threshold,int(hide_closed),group,group,limit)).fetchall()

    @lru_cache(maxsize=64)
    def tile(self,z,x,y,min_confidence=None,hide_closed=False,group='all'):
        scale = 2**z
        rows = self.rows(x/scale,y/scale,(x+1)/scale,(y+1)/scale,5001,min_confidence,hide_closed,group)
        if len(rows)>5000:
            raise ValueError('Tile exceeds 5,000 points; use a smaller area or zoom in')
        return tile_bytes([(r[0],round((r[1]*scale-x)*4096),round((r[2]*scale-y)*4096),r[6]) for r in rows])

    def query(self,geometry,min_confidence=None,hide_closed=False,group='all',limit=32):
        if limit not in (32,200):raise ValueError('Invalid query limit')
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
        rows = self.rows(west,south,east,north,limit+1,min_confidence,hide_closed,group)
        return {'exceededTransferLimit':len(rows)>limit,'features':[
            {'attributes':{**json.loads(row[5]),'place_group':row[7]},'geometry':{'x':row[3],'y':row[4],'spatialReference':{'wkid':4326}}} for row in rows[:limit]]}


def make_handler(dataset,base,origin):
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
            parsed=urlparse(self.path);route=parsed.path
            try:threshold,hide_closed,group=request_filters(parsed.query)
            except ValueError as error:return self.reply(400,{'error':str(error)})
            params={}
            if threshold is not None:params['min_confidence']=threshold
            if hide_closed:params['hide_closed']='1'
            if group!='all':params['group']=group
            suffix='?'+urlencode(params) if params else ''
            if route=='/style.json':
                self.reply(200,{'version':8,'name':'Local Overture POI test','sprite':base+'/sprites/places','sources':{'places':{
                    'type':'vector','tiles':[base+'/tiles/{z}/{x}/{y}.pbf'+suffix],'minzoom':12,'maxzoom':16,
                    'attribution':'Overture Maps · '+dataset.manifest['release']}},'layers':[{
                    'id':'places','type':'symbol','source':'places','source-layer':'places','minzoom':12,
                    'layout':{'icon-image':'{icon_group}','icon-size':0.8,'icon-allow-overlap':False,'icon-ignore-placement':False,'icon-padding':2}}]})
            elif route=='/sprites/places.json':self.reply(200,sprite_metadata)
            elif route=='/sprites/places.png':self.reply(200,sprite_png,'image/png')
            elif route=='/sprites/places@2x.json':self.reply(200,sprite_metadata_2x)
            elif route=='/sprites/places@2x.png':self.reply(200,sprite_png_2x,'image/png')
            elif route in ['/','/status']:
                self.reply(200,{'ready':True,'count':dataset.count,'min_confidence':threshold,'hide_closed':hide_closed,'group':group,'release':dataset.manifest['release'],
                    'bbox':dataset.manifest['bbox'],'icon_counts':dict(dataset.icon_counts),'unmapped_categories':dict(dataset.unmapped_categories.most_common(20)),'style':base+'/style.json','query':base+'/query'})
            elif route.startswith('/tiles/'):
                try:
                    parts=route.split('/');z,x,y=int(parts[2]),int(parts[3]),int(parts[4].removesuffix('.pbf'))
                    if len(parts)!=5 or not 12<=z<=16 or not 0<=x<2**z or not 0<=y<2**z: raise ValueError('Invalid tile')
                    self.reply(200,dataset.tile(z,x,y,threshold,hide_closed,group),'application/x-protobuf')
                except (ValueError,IndexError) as error:self.reply(400,{'error':str(error)})
            else:self.reply(404,{'error':'Not found'})

        def do_POST(self):
            route=urlparse(self.path).path
            if route not in ('/query','/search'):return self.reply(404,{'error':'Not found'})
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=8192:raise ValueError('Invalid request size')
                payload=json.loads(self.rfile.read(size))
                threshold,hide_closed,group=request_filters(urlparse(self.path).query)
                self.reply(200,dataset.query(payload['geometry'],threshold,hide_closed,group,200 if route=='/search' else 32))
            except (ValueError,KeyError,TypeError) as error:self.reply(400,{'error':str(error)})
    return Handler


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True)
    parser.add_argument('--cert',type=Path,help='Experience Builder server/cert/server.cert')
    parser.add_argument('--key',type=Path,help='Experience Builder server/cert/server.key')
    parser.add_argument('--port',type=int,default=3444)
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
    dataset=Dataset(args.input)
    base=f'https://localhost:{args.port}'
    server=ThreadingHTTPServer(('127.0.0.1',args.port),make_handler(dataset,base,args.origin))
    context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.load_cert_chain(args.cert,args.key)
    server.socket=context.wrap_socket(server.socket,server_side=True)
    print(f'Local POI server: {base}/status | {dataset.count} POIs | Ctrl+C to stop',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close();dataset.db.close()


if __name__=='__main__':main()
