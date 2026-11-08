import json
import math
from pathlib import Path
import sys
import tempfile
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/overture_places'))
from serve_places_local import Dataset,make_handler,tile_bytes,project

class LocalServerTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.source=Path(self.temp.name)/'places.geojsonl'
        features=[{'type':'Feature','geometry':{'type':'Point','coordinates':[29.,41.]},'properties':{
            'gers_id':str(i),'place_name':None,'category':None,'confidence':None,'data_release':'2026-10-21.0'}} for i in range(40)]
        self.source.write_text('\n'.join(json.dumps(f) for f in features))
        self.source.with_suffix('.manifest.json').write_text(json.dumps({'schema':'overture-places-all-pilot-v1','feature_count':40,'release':'2026-10-21.0','bbox':[28.9,40.9,29.1,41.1]}))
        self.dataset=Dataset(self.source)
    def tearDown(self):self.dataset.db.close();self.temp.cleanup()
    def test_query_is_bounded_unfiltered_and_truncation_explicit(self):
        response=self.dataset.query({'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}})
        self.assertEqual(len(response['features']),32);self.assertTrue(response['exceededTransferLimit'])
        self.assertIsNone(response['features'][0]['attributes']['confidence'])
        self.assertEqual(self.dataset.query({'xmin':0,'ymin':0,'xmax':1,'ymax':1,'spatialReference':{'wkid':4326}})['features'],[])
    def test_webmercator_query_matches_geographic_query(self):
        def merc(lon,lat):return math.radians(lon)*6378137,math.asinh(math.tan(math.radians(lat)))*6378137
        x1,y1=merc(28.99,40.99);x2,y2=merc(29.01,41.01)
        response=self.dataset.query({'xmin':x1,'ymin':y1,'xmax':x2,'ymax':y2,'spatialReference':{'wkid':102100}})
        self.assertEqual(len(response['features']),32)
        with self.assertRaises(ValueError):self.dataset.query({'xmin':0,'ymin':0,'xmax':1,'ymax':1,'spatialReference':{'wkid':999}})
    def test_point_tiles_and_cache(self):
        x,y=project(29.,41.);tile=self.dataset.tile(16,int(x*65536),int(y*65536))
        self.assertIn(b'places',tile);self.assertIn(b'gers_id',tile)
        self.assertEqual(self.dataset.tile(16,int(x*65536),int(y*65536)),tile)
        self.assertLessEqual(self.dataset.tile.cache_info().currsize,64)
        self.assertLess(len(tile_bytes([])),len(tile))
    def test_http_style_cors_and_query(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),make_handler(self.dataset,'https://localhost:3444','https://localhost:3001'))
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            base='http://127.0.0.1:'+str(server.server_port)
            with urllib.request.urlopen(base+'/style.json') as response:
                style=json.load(response);self.assertEqual(style['layers'][0]['type'],'symbol')
                self.assertEqual(style['layers'][0]['layout']['icon-image'],'{icon_group}')
                self.assertEqual(response.headers['Access-Control-Allow-Origin'],'https://localhost:3001')
            with urllib.request.urlopen(base+'/sprites/places@2x.json') as response:
                sprite=json.load(response);self.assertEqual(sprite['other']['pixelRatio'],2)
            with urllib.request.urlopen(base+'/sprites/places@2x.png') as response:
                self.assertEqual(response.headers['Content-Type'],'image/png')
                self.assertTrue(response.read().startswith(b'\x89PNG'))
            data=json.dumps({'geometry':{'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}}).encode()
            with urllib.request.urlopen(urllib.request.Request(base+'/query',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(len(json.load(response)['features']),32)
        finally:server.shutdown();server.server_close();thread.join()

class SpriteTest(unittest.TestCase):
    def test_sprites_have_matching_geometry_and_retina_metadata(self):
        import struct,zlib
        from places_sprite import make_sprite,GROUPS
        for scale in (1,2):
            png,metadata=make_sprite(scale)
            self.assertTrue(png.startswith(b'\x89PNG\r\n\x1a\n'))
            width,height=struct.unpack('!II',png[16:24])
            self.assertEqual((width,height),(144*scale,24*scale))
            self.assertEqual(set(metadata),set(GROUPS))
            for spec in metadata.values():
                self.assertEqual(spec['pixelRatio'],scale)
                self.assertLessEqual(spec['x']+spec['width'],width)
            position=8;compressed=b''
            while position<len(png):
                length=struct.unpack('!I',png[position:position+4])[0]
                kind=png[position+4:position+8];data=png[position+8:position+8+length]
                crc=struct.unpack('!I',png[position+8+length:position+12+length])[0]
                self.assertEqual(crc,zlib.crc32(kind+data)&0xffffffff)
                if kind==b'IDAT':compressed+=data
                position+=12+length
            self.assertEqual(len(zlib.decompress(compressed)),height*(width*4+1))

if __name__=='__main__':unittest.main()
