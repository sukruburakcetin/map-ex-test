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
    def test_search_ranks_before_limit_and_filters_before_ranking(self):
        source=Path(self.temp.name)/'ranked.geojsonl'
        features=[]
        for i in range(250):
            features.append({'type':'Feature','geometry':{'type':'Point','coordinates':[29+i*.00001,41]},'properties':{
                'gers_id':f'p{i:03}','place_name':f'Place {i}','category':'restaurant','confidence':.9,'operating_status':'open','data_release':'2026-10-21.0'}})
        # Closer records rejected by quality/category filters must not consume the limit.
        for i,(category,confidence,status) in enumerate([('restaurant',.1,'open'),('restaurant',.9,'permanently_closed'),('cafe',.9,'open')]):
            features.append({'type':'Feature','geometry':{'type':'Point','coordinates':[29.003,41]},'properties':{
                'gers_id':f'excluded{i}','category':category,'confidence':confidence,'operating_status':status,'data_release':'2026-10-21.0'}})
        source.write_text('\n'.join(json.dumps(f) for f in features))
        source.with_suffix('.manifest.json').write_text(json.dumps({'schema':'overture-places-all-pilot-v1','feature_count':len(features),'release':'2026-10-21.0','bbox':[28.9,40.9,29.1,41.1]}))
        dataset=Dataset(source)
        geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
        try:
            result=dataset.query(geometry,.75,True,limit=200,family='restaurant',origin={'lon':29.003,'lat':41})
            self.assertTrue(result['exceededTransferLimit'])
            self.assertEqual([f['attributes']['gers_id'] for f in result['features']],[f'p{i:03}' for i in range(249,49,-1)])
            second=dataset.query(geometry,.75,True,limit=200,family='restaurant',origin={'lon':29.003,'lat':41},offset=200)
            self.assertEqual(second['offset'],200);self.assertIsNone(second['nextOffset']);self.assertFalse(second['exceededTransferLimit'])
            self.assertEqual(len(second['features']),50)
            self.assertEqual(len({f['attributes']['gers_id'] for f in result['features']+second['features']}),250)
            self.assertEqual(result['nextOffset'],200)
            for offset in [-200,1,200.0,True,100200]:
                with self.assertRaises(ValueError):dataset.query(geometry,limit=200,offset=offset)
            with self.assertRaises(ValueError):dataset.query(geometry,limit=32,offset=200)
            result=dataset.query(geometry,.75,True,limit=200,family='restaurant',origin={'lon':29,'lat':41})
            self.assertEqual([f['attributes']['gers_id'] for f in result['features']],[f'p{i:03}' for i in range(200)])
            for origin in [{'lon':float('nan'),'lat':41},{'lon':181,'lat':41},{'lon':29},[29],True]:
                with self.assertRaises(ValueError):dataset.query(geometry,limit=200,origin=origin)
        finally:dataset.db.close()

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
                self.assertEqual(style['sources']['places']['maxzoom'],19)
                self.assertEqual(style['layers'][-1]['minzoom'],17)
                self.assertIn('{range}',style['glyphs'])
                self.assertEqual(style['layers'][1]['filter'],['>','count',1])
                self.assertEqual(style['layers'][0]['layout']['icon-image'],'{icon_group}')
                self.assertEqual(response.headers['Access-Control-Allow-Origin'],'https://localhost:3001')
            with urllib.request.urlopen(base+'/style.json?min_confidence=0.75') as response:
                filtered=json.load(response);self.assertTrue(filtered['sources']['places']['tiles'][0].endswith('?min_confidence=0.75'))
            with urllib.request.urlopen(base+'/style.json?min_confidence=0.75&hide_closed=1') as response:
                url=json.load(response)['sources']['places']['tiles'][0];self.assertIn('min_confidence=0.75',url);self.assertIn('hide_closed=1',url)
            with urllib.request.urlopen(base+'/style.json?group=education&hide_closed=1&min_confidence=0.75') as response:
                url=json.load(response)['sources']['places']['tiles'][0];self.assertIn('group=education',url)
            with urllib.request.urlopen(base+'/status') as response:
                metadata=json.load(response);self.assertEqual(metadata['paging_version'],1);self.assertEqual(metadata['scale_display_version'],1);self.assertEqual(metadata['category_filter_version'],1);self.assertEqual(len(metadata['supported_icon_families']),28)
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

class ScaleDisplayTest(unittest.TestCase):
    def test_dense_tiles_summarize_all_matches_then_split_at_street_scale(self):
        case=LocalServerTest();case.setUp()
        try:
            case.dataset.db.close()
            # Put 6,001 distinct points inside one global overview grid cell.
            px,py=project(29,41);cell=1/(2**12*8);left=math.floor(px/cell)*cell;top=math.floor(py/cell)*cell
            records=[]
            for i in range(6001):
                x=left+cell*(.1+.8*i/6000);y=top+cell*.5
                lon=x*360-180;lat=math.degrees(math.atan(math.sinh(math.pi*(1-2*y))))
                records.append({'geometry':{'coordinates':[lon,lat]},'properties':{'gers_id':str(i),'place_name':'Place '+str(i),'category':'restaurant','confidence':.9,'data_release':'2026-10-21.0'}})
            case.source.write_text('\n'.join(json.dumps(r) for r in records))
            manifest=json.loads(case.source.with_suffix('.manifest.json').read_text());manifest['feature_count']=len(records);case.source.with_suffix('.manifest.json').write_text(json.dumps(manifest));case.dataset=Dataset(case.source)
            overview=case.dataset.tile_records(12,int(px*4096),int(py*4096));self.assertEqual(sum(r[4] for r in overview),6001);self.assertEqual(len(overview),1)
            self.assertEqual(len(case.dataset.tile_records(12,int(px*4096),int(py*4096),family='cafe')),0)
            self.assertEqual(len(case.dataset.tile_records(12,int(px*4096),int(py*4096),min_confidence=.95)),0)
            encoded=case.dataset.tile(12,int(px*4096),int(py*4096));self.assertIn(b'count',encoded)
            def fields(data):
                position=0
                def number():
                    nonlocal position
                    value=shift=0
                    while True:
                        byte=data[position];position+=1;value|=(byte&127)<<shift
                        if byte<128:return value
                        shift+=7
                result=[]
                while position<len(data):
                    tag=number()
                    if tag&7==0:value=number()
                    else:
                        self.assertEqual(tag&7,2);length=number();value=data[position:position+length];position+=length
                    result.append((tag>>3,value))
                return result
            layer=fields(fields(encoded)[0][1]);values=[fields(v) for k,v in layer if k==4]
            self.assertEqual(values[2],[(5,6001)])  # MVT count is a numeric attribute, not just a label.

            street=[]
            for x in range(int(left*65536),int((left+cell)*65536)):
                street.extend(case.dataset.tile_records(16,x,int((top+cell*.5)*65536)))
            self.assertEqual(len(street),6001);self.assertTrue(all(r[4]==1 for r in street));self.assertTrue(all(r[5] for r in street))
            cluster=overview[0];lon=cluster[1]*360-180;lat=math.degrees(math.atan(math.sinh(math.pi*(1-2*cluster[2]))))
            geometry={'xmin':lon-.0001,'ymin':lat-.0001,'xmax':lon+.0001,'ymax':lat+.0001,'spatialReference':{'wkid':4326}}
            hit=case.dataset.cluster_query(geometry,12);self.assertEqual(hit['features'][0]['attributes']['cluster_count'],6001)
            # A hidden member far from the summary must not act as an individual icon.
            lon,lat=records[0]['geometry']['coordinates'];geometry.update(xmin=lon-.000001,xmax=lon+.000001,ymin=lat-.000001,ymax=lat+.000001)
            self.assertEqual(case.dataset.cluster_query(geometry,12)['features'],[])
        finally:case.tearDown()

class FullAreaTextSearchTest(unittest.TestCase):
    def test_search_finds_places_beyond_the_first_200_before_pagination(self):
        case=LocalServerTest();case.setUp()
        try:
            case.dataset.db.close();records=[]
            for i in range(1800):
                records.append({'geometry':{'coordinates':[29.,41.]},'properties':{'gers_id':f'p{i:04}','place_name':'Generic '+str(i),'category':'restaurant','address':'Main Road','confidence':.9,'data_release':'2026-10-21.0'}})
            records[-1]['properties']['place_name']='Café Hidden Oak'
            records[-2]['properties'].update(place_name='100% Real',category='pharmacy')
            case.source.write_text('\n'.join(json.dumps(r) for r in records));manifest=json.loads(case.source.with_suffix('.manifest.json').read_text());manifest['feature_count']=1800;case.source.with_suffix('.manifest.json').write_text(json.dumps(manifest));case.dataset=Dataset(case.source)
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            page=case.dataset.query(geometry,limit=200);self.assertNotIn('p1799',[r['attributes']['gers_id'] for r in page['features']])
            found=case.dataset.query(geometry,limit=200,search='CAFE hidden');self.assertEqual([r['attributes']['gers_id'] for r in found['features']],['p1799']);self.assertFalse(found['exceededTransferLimit'])
            self.assertEqual(case.dataset.query(geometry,limit=200,search='%')['features'][0]['attributes']['gers_id'],'p1798')
            self.assertEqual(len(case.dataset.query(geometry,limit=200,search='%')['features']),1)
            self.assertEqual(case.dataset.query(geometry,limit=200,family='cafe',search='hidden')['features'],[])
            self.assertEqual(case.dataset.query(geometry,limit=200,search="' OR 1=1 --")['features'],[])
            ids=[]
            for offset in range(0,1800,200):
                result=case.dataset.query(geometry,limit=200,offset=offset,search='Main Road');ids.extend(r['attributes']['gers_id'] for r in result['features'])
            self.assertEqual(len(set(ids)),1800);self.assertFalse(result['exceededTransferLimit'])
            self.assertEqual(len(case.dataset.query(geometry,limit=200,search='pharmacy')['features']),1)
            for bad in [None,123,[],True,'x'*121]:
                with self.assertRaises(ValueError):case.dataset.query(geometry,limit=200,search=bad)
        finally:case.tearDown()

if __name__=='__main__':unittest.main()
