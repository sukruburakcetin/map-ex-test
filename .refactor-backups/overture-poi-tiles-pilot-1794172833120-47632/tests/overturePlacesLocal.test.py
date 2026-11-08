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
        self.assertEqual(sum(self.dataset.icon_counts.values()),self.dataset.count)
        self.assertEqual(self.dataset.icon_counts['other'],40)
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
            with urllib.request.urlopen(base+'/style.json?min_confidence=0.75') as response:
                filtered=json.load(response);self.assertTrue(filtered['sources']['places']['tiles'][0].endswith('?min_confidence=0.75'))
            with urllib.request.urlopen(base+'/style.json?min_confidence=0.75&hide_closed=1') as response:
                url=json.load(response)['sources']['places']['tiles'][0];self.assertIn('min_confidence=0.75',url);self.assertIn('hide_closed=1',url)
            with urllib.request.urlopen(base+'/style.json?group=education&hide_closed=1&min_confidence=0.75') as response:
                url=json.load(response)['sources']['places']['tiles'][0];self.assertIn('group=education',url)
            with urllib.request.urlopen(base+'/status') as response:
                metadata=json.load(response);self.assertEqual(metadata['category_filter_version'],1);self.assertEqual(len(metadata['supported_icon_families']),28)
            with urllib.request.urlopen(base+'/style.json?family=restaurant&hide_closed=1&min_confidence=0.75') as response:
                url=json.load(response)['sources']['places']['tiles'][0];self.assertIn('family=restaurant',url);self.assertIn('hide_closed=1',url)
            with urllib.request.urlopen(base+'/sprites/places@2x.json') as response:
                sprite=json.load(response);self.assertEqual(sprite['other']['pixelRatio'],2)
            with urllib.request.urlopen(base+'/sprites/places@2x.png') as response:
                self.assertEqual(response.headers['Content-Type'],'image/png')
                self.assertTrue(response.read().startswith(b'\x89PNG'))
            data=json.dumps({'geometry':{'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}}).encode()
            with urllib.request.urlopen(urllib.request.Request(base+'/query',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(len(json.load(response)['features']),32)
            with urllib.request.urlopen(urllib.request.Request(base+'/search',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(len(json.load(response)['features']),40)
            with urllib.request.urlopen(urllib.request.Request(base+'/search?family=restaurant',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(json.load(response)['features'],[])
            with urllib.request.urlopen(urllib.request.Request(base+'/query?family=restaurant',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(json.load(response)['features'],[])
            with urllib.request.urlopen(urllib.request.Request(base+'/query?min_confidence=0.75',data=data,headers={'Content-Type':'application/json'})) as response:
                self.assertEqual(json.load(response)['features'],[])
        finally:server.shutdown();server.server_close();thread.join()

class SpriteTest(unittest.TestCase):
    def test_sprites_have_matching_geometry_and_retina_metadata(self):
        import struct,zlib
        from places_sprite import make_sprite,GROUPS
        for scale in (1,2):
            png,metadata=make_sprite(scale)
            self.assertTrue(png.startswith(b'\x89PNG\r\n\x1a\n'))
            width,height=struct.unpack('!II',png[16:24])
            self.assertEqual((width,height),(24*len(GROUPS)*scale,24*scale))
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

class CategoryTest(unittest.TestCase):
    def test_specific_categories_and_safe_fallbacks(self):
        from place_categories import icon_group,EXACT,BASIC_ICONS
        from places_sprite import GROUPS
        for category,expected in {
            'coffee_shop':'cafe','chinese_restaurant':'restaurant','barber_shop':'beauty',
            'hotel_bar':'bar','gas_station':'fuel','childrens_hospital':'health',
            'parking_garage':'parking','hardware_store':'shop','lawyer':'office',
            'museum':'landmarks','non_profit_organization':'office','pharmacy_schools':'education',
            'professional_services':'office','cafe':'cafe','unknown_future_category':'other',
            'barbecue_restaurant':'restaurant','business_schools':'education',
            'casual_eatery':'restaurant','health_care':'health','services_and_business':'office',
            'pharmacy_and_drug_store':'health','bank_or_credit_union':'bank',
            'muslim_place_of_worship':'worship','food_and_beverage_store':'grocery',
            'buddhist_place_of_worship':'worship','vehicle_dealer':'automotive',
        }.items():self.assertEqual(icon_group(category),expected,category)
        self.assertEqual(icon_group(None),'other');self.assertEqual(icon_group(''),'other')
        self.assertTrue(set(EXACT.values())<=set(GROUPS))
        self.assertEqual(len(BASIC_ICONS),298)
        self.assertNotIn('other',set(BASIC_ICONS.values()))
        self.assertTrue(set(BASIC_ICONS.values())<=set(GROUPS))
        self.assertEqual(icon_group('  COFFEE-SHOP  '),'cafe')

class ConfidenceTest(unittest.TestCase):
    def test_filters_before_limits_and_preserves_all_records_option(self):
        case=LocalServerTest();case.setUp()
        try:
            dataset=case.dataset
            with dataset.lock:
                dataset.db.execute('UPDATE places SET confidence=0.75 WHERE id=39')
                dataset.db.execute('UPDATE places SET confidence=0.9 WHERE id=40')
                dataset.db.execute('UPDATE places SET confidence=0 WHERE id=38')
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            response=dataset.query(geometry,.75)
            self.assertEqual(len(response['features']),2);self.assertFalse(response['exceededTransferLimit'])
            self.assertEqual(len(dataset.query(geometry,.9)['features']),1)
            self.assertEqual(len(dataset.query(geometry,0)['features']),3)
            self.assertTrue(dataset.query(geometry)['exceededTransferLimit'])
            x,y=project(29,41);args=(16,int(x*65536),int(y*65536))
            self.assertNotEqual(dataset.tile(*args),dataset.tile(*args,.75))
            self.assertEqual(dataset.tile(*args,.75),dataset.tile(*args,.75))
        finally:case.tearDown()
    def test_rejects_invalid_thresholds(self):
        from serve_places_local import confidence_filter
        self.assertIsNone(confidence_filter(None));self.assertEqual(confidence_filter('0'),0)
        for value in ['nan','inf','bad',-.01,1.01]:
            with self.assertRaises(ValueError):confidence_filter(value)

class OperatingStatusTest(unittest.TestCase):
    def test_closed_filter_keeps_unknown_status_and_combines_with_confidence(self):
        case=LocalServerTest();case.setUp()
        try:
            dataset=case.dataset
            with dataset.lock:
                dataset.db.execute("UPDATE places SET confidence=0.9, operating_status='permanently_closed' WHERE id=39")
                dataset.db.execute("UPDATE places SET confidence=0.9 WHERE id=40")
                dataset.db.execute("UPDATE places SET operating_status='temporary_closure' WHERE id=38")
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            self.assertEqual(len(dataset.query(geometry,.75)['features']),2)
            filtered=dataset.query(geometry,.75,True)
            self.assertEqual(len(filtered['features']),1);self.assertEqual(filtered['features'][0]['attributes']['gers_id'],'39')
            x,y=project(29,41)
            self.assertEqual(len(dataset.rows(x-.01,y-.01,x+.01,y+.01,100,None,True)),39)
            self.assertEqual(len(dataset.rows(x-.01,y-.01,x+.01,y+.01,100)),40)
            args=(16,int(x*65536),int(y*65536),.75)
            self.assertNotEqual(dataset.tile(*args),dataset.tile(*args,True))
        finally:case.tearDown()
    def test_validates_request_filters(self):
        from serve_places_local import request_filters
        self.assertEqual(request_filters(''),(None,False,'all','all'))
        self.assertEqual(request_filters('min_confidence=0.75&hide_closed=1'),(.75,True,'all','all'))
        for value in ['true','false','2','']:
            with self.assertRaises(ValueError):request_filters('hide_closed='+value)

class AreaQueryTest(unittest.TestCase):
    def test_area_cap_and_server_group_filter_before_limit(self):
        case=LocalServerTest();case.setUp()
        try:
            case.dataset.db.close()
            records=[]
            for i in range(260):
                records.append({'type':'Feature','geometry':{'type':'Point','coordinates':[29.,41.]},'properties':{
                    'gers_id':str(i),'place_name':'Place '+str(i),'category':'school' if i==259 else None,
                    'confidence':.9 if i==259 else None,'operating_status':'open','data_release':'2026-10-21.0'}})
            case.source.write_text('\n'.join(json.dumps(record) for record in records))
            path=case.source.with_suffix('.manifest.json');manifest=json.loads(path.read_text());manifest['feature_count']=260;path.write_text(json.dumps(manifest))
            case.dataset=Dataset(case.source)
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            all_results=case.dataset.query(geometry,limit=200)
            self.assertEqual(len(all_results['features']),200);self.assertTrue(all_results['exceededTransferLimit'])
            selected=case.dataset.query(geometry,.75,True,'education',200)
            self.assertEqual(len(selected['features']),1);self.assertFalse(selected['exceededTransferLimit'])
            self.assertEqual(selected['features'][0]['attributes']['gers_id'],'259')
            self.assertEqual(selected['features'][0]['attributes']['place_group'],'education')
            self.assertEqual(case.dataset.query(geometry,group='health',limit=200)['features'],[])
        finally:case.tearDown()

class IconFamilyQueryTest(unittest.TestCase):
    def test_every_family_is_accepted_and_unknown_values_rejected(self):
        from serve_places_local import request_filters
        from places_sprite import GROUPS
        for family in GROUPS:self.assertEqual(request_filters('family='+family)[3],family)
        import re
        contract=(Path(__file__).resolve().parents[1]/'src/features/places/tileCategories.ts').read_text()
        ids=set(re.findall(r"\[\s*'([^']+)'\s*,\s*'uiPoi[^']+'\s*\]",contract))
        self.assertEqual(ids,set(GROUPS))
        with self.assertRaises(ValueError):request_filters('family=unknown')
    def test_family_predicates_apply_to_queries_and_tiles_without_legacy_aliasing(self):
        case=LocalServerTest();case.setUp()
        try:
            dataset=case.dataset
            with dataset.lock:
                dataset.db.execute("UPDATE places SET icon_group='restaurant', confidence=0.9 WHERE id=40")
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            result=dataset.query(geometry,.75,False,'all',200,'restaurant')
            self.assertEqual(len(result['features']),1);self.assertEqual(result['features'][0]['attributes']['icon_group'],'restaurant')
            self.assertEqual(len(dataset.query(geometry,limit=32,family='restaurant')['features']),1)
            self.assertEqual(dataset.query(geometry,family='cafe')['features'],[])
            x,y=project(29,41);args=(16,int(x*65536),int(y*65536))
            self.assertNotEqual(dataset.tile(*args,family='restaurant'),dataset.tile(*args,family='other'))
        finally:case.tearDown()

if __name__=='__main__':unittest.main()
