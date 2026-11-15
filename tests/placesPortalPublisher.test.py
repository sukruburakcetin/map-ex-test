"""Optional publishing orchestration: no live Portal/Pro sign-in or remote writes."""
import argparse
from concurrent.futures import Future
import copy
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import struct
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/overture_places'))
import publish_places_portal as publisher
import places_area as area
from places_geojson import write_features

RELEASE='2026-10-21.0';PORTAL='https://portal.example.com/portal'


def v(n):
    result=bytearray()
    while n>127:result.append((n&127)|128);n>>=7
    result.append(n);return bytes(result)


def f(n,b):return v(n*8+2)+v(len(b))+b


def tile(properties):
    values=[(k,x) for k,x in properties.items() if x is not None]
    encoded=[]
    for key,value in values:
        encoded.append(f(1,value.encode()) if isinstance(value,str) else v(25)+struct.pack('<d',value))
    tags=b''.join(v(i)+v(i) for i in range(len(values)))
    feature=f(2,tags)+v(24)+v(1)+f(4,v(9)+v(2)+v(2))
    layer=f(1,b'places')+f(2,feature)+b''.join(f(3,k.encode()) for k,_ in values)+b''.join(f(4,b) for b in encoded)+v(40)+v(4096)+v(120)+v(2)
    return f(3,layer)


class FakePortal:
    def __init__(self,record):
        self.portal_url=PORTAL;self.username='publisher';self.permission_check='checked';self.calls=[];self.record=record
        self.fail=None;self.query_root=None;self.tile_root=None;self.counter=0;self.available=True;self.root_pending=0
        self.original={'id':'0'*32,'url':'https://services.example.com/server/rest/services/Hosted/existing/FeatureServer','access':'org'}
        self.original_before=copy.deepcopy(self.original)
    def ensure_context(self):self.calls.append(('context',))
    def query_name_available(self,name):self.calls.append(('name',name));return self.available
    def create_folder(self,name):self.calls.append(('folder',name));return SimpleNamespace(properties={'id':'f'*32},name=name)
    def upload(self,folder,path,title,kind,release,on_id):
        self.counter+=1;identifier=f'{self.counter:032x}';on_id(identifier);self.calls.append(('upload',kind,str(path)))
        if self.fail=='upload':raise RuntimeError('token=SECRET_DO_NOT_WRITE')
        return SimpleNamespace(id=identifier,owner='publisher',title=title,kind=kind,url=None)
    def publish(self,item,name,kind):
        self.calls.append(('publish',kind,name))
        if self.fail=='publish':raise RuntimeError('password=SECRET_DO_NOT_WRITE')
        if self.fail=='existing':return SimpleNamespace(**self.original)
        self.counter+=1;url='https://services.example.com/server/rest/services/Hosted/'+name+('/FeatureServer' if kind=='feature' else '/VectorTileServer')
        if kind=='feature':self.query_root=url
        else:self.tile_root=url
        return SimpleNamespace(id=f'{self.counter:032x}',owner='publisher',title=name,url=url)
    def make_private(self,item):
        self.calls.append(('private',item.id))
        if item.id=='0'*32:raise AssertionError('Existing service sharing must never change')
        if self.fail=='sharing':raise RuntimeError('token=SECRET_DO_NOT_WRITE')
    def move(self,item,folder):self.calls.append(('move',item.id))
    def read_json(self,url,params=None):
        params=params or {};self.calls.append(('read',url,params))
        if url==self.query_root:return {'layers':[{'id':0}],'tables':[]}
        if url==self.query_root+'/0':
            return {'geometryType':'esriGeometryPoint','capabilities':'Query','objectIdField':'objectid','maxRecordCount':2000,'advancedQueryCapabilities':{'supportsPagination':True,'supportsOrderBy':True},'fields':[{'name':'objectid','type':'esriFieldTypeOID'}]+[{'name':name,'type':('esriFieldTypeString' if self.fail=='schema' else 'esriFieldTypeDouble') if name=='confidence' else 'esriFieldTypeString'} for name in publisher.FIELDS],'extent':{'xmin':28.9,'ymin':40.9,'xmax':29.1,'ymax':41.1,'spatialReference':{'wkid':4326}}}
        if url==self.query_root+'/0/query':
            if params.get('returnCountOnly')=='true':return {'count':0 if params['where'].startswith('data_release') else 2 if self.fail!='count' else 1}
            attrs=copy.deepcopy(self.record['properties'])
            if self.fail=='attributes':attrs['place_name']='Wrong name'
            return {'features':[{'attributes':attrs,'geometry':{'x':29.,'y':41.}}]}
        if url==self.tile_root:
            if self.root_pending:self.root_pending-=1;return {'capabilities':'TilesOnly'}
            return {'defaultStyles':'resources/styles','maxLOD':15,'tileInfo':{'rows':512,'cols':512,'spatialReference':{'wkid':3857},'lods':[{'level':14},{'level':15}]}}
        if url.endswith('/resources/styles/root.json'):
            return {'version':8,'sprite':'../sprites/sprite','metadata':{'mly:places':{'version':1,'queryUrl':self.query_root+'/0' if self.fail!='pair' else 'https://wrong.example/FeatureServer/0','release':RELEASE,'sourceFeatureCount':2,'sourceLayers':['places'],'fields':list(publisher.FIELDS),'clusters':{'version':1,'layer':'places_clusters','cells':8,'scoreBlockSize':32,'scores':[.750123],'minzoom':12,'cachedMaxZoom':15,'maxzoom':16}}},'layers':[{'type':'symbol','source-layer':'places','layout':{'icon-image':'{icon_group}'}},{'id':'mly-place-cluster-counts','source-layer':'places_clusters','type':'symbol'}]}
        if url.endswith('/resources/sprites/sprite.json'):return {'cafe':{'width':24,'height':24}}
        raise AssertionError('Unexpected request')
    def read_binary(self,url):
        self.calls.append(('binary',url))
        if url.endswith('.png'):return b'\x89PNG\r\n\x1a\nfixture'
        attrs=self.record['properties'].copy()
        if self.fail=='tile':attrs['gers_id']='not-the-source'
        return tile(attrs)


class Publishing(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.profile=self.base/'area.json'
        area.init_profile(self.profile,'Test operation',[28.9,40.9,29.1,41.1],'portal')
        self.records=[{'type':'Feature','geometry':{'type':'Point','coordinates':[29.,41.]},'properties':{'gers_id':identifier,'place_name':'Café','category':'cafe','confidence':.750123,'operating_status':None,'address':None,'website':None,'data_release':RELEASE}} for identifier in ['one','two']]
        def export(args):
            p=argparse.ArgumentParser();p.add_argument('--output');p.add_argument('--max-features',type=int);p.add_argument('--bbox');p.add_argument('--release');a=p.parse_args(args)
            file=Path(a.output);write_features(self.records,file,a.max_features,'geojson');file.with_suffix('.manifest.json').write_text(json.dumps({'release':a.release,'feature_count':2,'bbox':list(map(float,a.bbox.split(',')))}))
        self.snapshot=area.prepare(self.profile,RELEASE,exporter=export)
        canonical=json.loads(Path(self.snapshot['source_path']).read_text())['features'][0]
        self.backend=FakePortal(canonical)
    def tearDown(self):self.tmp.cleanup()
    def plan(self):
        with redirect_stdout(io.StringIO()):return publisher.create_plan(self.profile,RELEASE,portal_url=PORTAL,_backend_instance=self.backend)
    def build(self,profile,release,query_url,project,build_name):
        self.assertEqual(query_url,self.backend.query_root+'/0');self.assertEqual(project,'CURRENT')
        directory=Path(self.snapshot['folder'])/build_name;directory.mkdir();package=directory/'places-portal-overview.vtpk';package.write_bytes(b'fixture native package')
        result={'release':RELEASE,'feature_count':2,'package':'places-portal-overview.vtpk','package_sha256':area.digest(package)}
        area.save_json_exclusive(directory/'portal-preparation.json',result)
        return {**result,'folder':str(directory)}
    def publish(self,plan):
        with redirect_stdout(io.StringIO()):return publisher.publish_plan(plan['plan_path'],validation_timeout=0,_backend_instance=self.backend,_build=self.build)
    def test_plan_reads_only_and_uses_unique_names_without_credentials(self):
        first=self.plan();second=self.plan();self.assertNotEqual(first['names'],second['names'])
        self.assertFalse(any(c[0] in ('folder','upload','publish','private','move') for c in self.backend.calls))
        text=Path(first['plan_path']).read_text();self.assertNotIn('token',text.lower());self.assertNotIn('password',text.lower())
    def test_full_flow_retains_existing_services_and_returns_pair_without_switching_app(self):
        plan=self.plan();result=self.publish(plan)
        self.assertEqual(result['status'],'ready_for_review');self.assertEqual(len(result['created_items']),4)
        self.assertFalse(result['experience_changed']);self.assertFalse(result['publication_recorded'])
        self.assertEqual(self.backend.original,self.backend.original_before)
        connection=area.read_json(result['connection_file']);self.assertEqual(connection['placesPortalQueryUrl'],self.backend.query_root+'/0');self.assertEqual(connection['placesPortalTilesUrl'],self.backend.tile_root)
        self.assertIsNone(area.published_release(area.load_profile(self.profile)[2]))
        self.assertTrue(Path(plan['plan_path']).with_name('source-upload.geojson').exists());self.assertTrue(Path(plan['plan_path']).with_name('package-upload.vtpk').exists())
        self.assertTrue(all(p['new_item_verified'] for p in result['created_items'].values()))
    def test_other_portal_or_account_is_rejected_before_writes(self):
        plan=self.plan();self.backend.portal_url='https://other.example/portal'
        with self.assertRaises(publisher.PublishingError):self.publish(plan)
        self.backend.portal_url=PORTAL;self.backend.username='another-account'
        with self.assertRaises(publisher.PublishingError):self.publish(plan)
        self.assertFalse(any(c[0]=='folder' for c in self.backend.calls))
    def test_changed_source_or_profile_is_rejected_before_writes(self):
        plan=self.plan();p=area.read_json(self.profile);p['name']='Edited';self.profile.write_text(json.dumps(p))
        with self.assertRaises(publisher.PublishingError):self.publish(plan)
        self.assertFalse(any(c[0]=='folder' for c in self.backend.calls))
    def test_second_run_of_same_plan_never_creates_duplicates(self):
        plan=self.plan();self.publish(plan);before=list(self.backend.calls)
        with self.assertRaisesRegex(publisher.PublishingError,'already started'):self.publish(plan)
        self.assertEqual([c for c in before if c[0]=='publish'],[c for c in self.backend.calls if c[0]=='publish'])
    def test_partial_failure_reports_ids_and_never_logs_raw_sdk_secrets(self):
        plan=self.plan();self.backend.fail='publish'
        with self.assertRaises(publisher.PublishingError) as failure:self.publish(plan)
        text=Path(plan['plan_path']).with_name('publication-report.json').read_text()
        self.assertNotIn('SECRET_DO_NOT_WRITE',text+str(failure.exception));report=json.loads(text);self.assertEqual(report['status'],'failed');self.assertIn('query_source',report['created_items'])
        self.assertFalse(report['automatic_deletion']);self.assertEqual(self.backend.original,self.backend.original_before)
    def test_invalid_query_counts_or_schema_stop_before_pro_build(self):
        for kind in ['count','schema','attributes']:
            with self.subTest(kind=kind):
                plan=self.plan();self.backend.fail=kind
                with self.assertRaises(publisher.PublishingError):self.publish(plan)
                self.assertFalse((Path(self.snapshot['folder'])/plan['names']['build']).exists())
    def test_unexpected_existing_service_is_never_reshared_or_moved(self):
        plan=self.plan();self.backend.fail='existing'
        with self.assertRaises(publisher.PublishingError):self.publish(plan)
        self.assertFalse(any(c[0] in ('private','move') and c[1]=='0'*32 for c in self.backend.calls))
    def test_vector_contract_or_tile_mismatch_never_emits_connection_file(self):
        for kind in ['pair','tile']:
            with self.subTest(kind=kind):
                plan=self.plan();self.backend.fail=kind
                with self.assertRaises(publisher.PublishingError):self.publish(plan)
                self.assertFalse(Path(plan['plan_path']).with_name('connection.json').exists())
    def test_capabilities_only_vector_root_stays_failed_not_ready(self):
        plan=self.plan();self.backend.root_pending=1
        with self.assertRaisesRegex(publisher.PublishingError,'timed out'):self.publish(plan)
        self.assertFalse(Path(plan['plan_path']).with_name('connection.json').exists())
    def test_missing_publication_privacy_prevents_service_publish(self):
        plan=self.plan();self.backend.fail='sharing'
        with self.assertRaises(publisher.PublishingError):self.publish(plan)
        self.assertFalse(any(c[0]=='publish' for c in self.backend.calls))
    def test_url_validation_never_accepts_tokens_plain_http_or_service_as_portal(self):
        for url in ['http://portal.example.com/portal',PORTAL+'?token=SECRET',PORTAL+'#x','https://user:secret@portal.example.com/portal',PORTAL+'/sharing/rest']:
            with self.assertRaises(publisher.PublishingError):publisher.clean_url(url)


class ApiAdapter(unittest.TestCase):
    def test_lazy_sdk_mapping_objects_are_hydrated_through_public_attributes(self):
        class LazyItem(dict):
            def __getattr__(self,key):
                self.update(owner='publisher',url='https://services.example.com/test/FeatureServer');return self[key]
        item=LazyItem();self.assertEqual(publisher._value(item,'owner'),'publisher');self.assertIn('url',item)
    def test_adapter_uses_current_api_properties_and_publish_never_overwrites(self):
        api=object.__new__(publisher.ProPortal);api.ensure_context=lambda:None;api.username='publisher';api.ItemTypeEnum=SimpleNamespace(GEOJSON='GeoJson',VECTOR_TILE_PACKAGE='Vector Tile Package');api.ItemProperties=lambda **kw:kw
        args={};item=SimpleNamespace(id='a'*32)
        folder=SimpleNamespace(add=lambda **kw:(args.update(kw),SimpleNamespace(itemid=item.id,result=lambda:item))[1])
        seen=[];self.assertIs(api.upload(folder,Path('data.geojson'),'name','geojson',RELEASE,seen.append),item);self.assertEqual(args['item_properties']['item_type'],'GeoJson');self.assertTrue(args['stream']);self.assertEqual(seen,[item.id,item.id])
        future=Future();future.set_result(item);publish_args={};source=SimpleNamespace(publish=lambda **kw:(publish_args.update(kw),future)[1])
        self.assertIs(api.publish(source,'unique_tiles','tiles'),item);self.assertFalse(publish_args['overwrite']);self.assertEqual(publish_args['output_type'],'VectorTiles');self.assertTrue(publish_args['build_initial_cache'])

if __name__=='__main__':unittest.main()
