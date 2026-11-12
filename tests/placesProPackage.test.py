"""Offline diagnostic parser and Pro orchestration fixtures; not a native Pro run."""
import gzip
import json
from pathlib import Path
import struct
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import zipfile

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools/overture_places'))
import pro_places_package as pro
import inspect_places_vtpk as inspect


def feature(identifier='one',lon=29.,**props):
    return {'type':'Feature','geometry':{'type':'Point','coordinates':[lon,41.]},'properties':{'gers_id':identifier,'place_name':'Private name, not in report','icon_group':'cafe','category':'cafe','confidence':.75,'operating_status':'open',**props}}


def varint(n):
    result=bytearray()
    while n>127:result.append((n&127)|128);n>>=7
    result.append(n);return bytes(result)


def field(n,b):return varint(n*8+2)+varint(len(b))+b


def mvt(properties):
    keys,values,tags=[],[],[]
    for key,value in properties.items():
        if value is None:continue
        tags.extend([len(keys),len(values)]);keys.append(key)
        values.append(field(1,value.encode()) if isinstance(value,str) else b'\x19'+struct.pack('<d',value))
    layer=field(1,b'places')+field(2,field(2,b''.join(varint(n) for n in tags))+b'\x18\x01')
    layer+=b''.join(field(3,k.encode()) for k in keys)+b''.join(field(4,v) for v in values)+b'\x78\x02'
    return field(3,layer)


def bundle(payload,bad_offset=False):
    size=64+131072
    header=struct.pack('<4I3Q6I',3,16384,len(payload),5,0,size+4+len(payload),40,20+131072,3,16,16384,5,131072)
    indexes=bytearray(131072)
    struct.pack_into('<Q',indexes,0,((len(payload)<<40)|(3 if bad_offset else size+4)))
    return header+indexes+struct.pack('<I',len(payload))+payload


def package(path,properties=None,bad_offset=False):
    data=mvt(properties if properties is not None else feature()['properties'])
    with zipfile.ZipFile(path,'w') as archive:
        archive.writestr('p12/tile/L17/R0000C0000.bundle',bundle(gzip.compress(data),bad_offset))
        archive.writestr('p12/resources/styles/root.json',json.dumps({'version':8,'layers':[{'source-layer':'places'}],'sources':{'source':{'url':'https://private.example/?token=do-not-report'}}}))
        archive.writestr('p12/root.json',json.dumps({'tileInfo':{'rows':512,'cols':512,'spatialReference':{'wkid':3857},'lods':[{'level':17}]}}))


class PackageInspectionTest(unittest.TestCase):
    def test_documented_compact_v2_and_compressed_mvt_are_inspected_without_extraction_or_values(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'probe.vtpk';package(path)
            report=inspect.inspect_package(path,expected={'one':feature()['properties']})
            self.assertEqual(report['tilesInspected'],1)
            self.assertTrue(report['sampleContainsRequiredFields'])
            self.assertEqual(report['uniqueMatchingExpectedRecords'],1)
            self.assertFalse(report['completeDatasetValidation']);self.assertFalse(report['portalPublishingTested'])
            self.assertEqual(report['tileScheme']['wkid'],3857)
            text=json.dumps(report)
            for private in ['Private name','do-not-report','private.example','"one"']:self.assertNotIn(private,text)
            self.assertEqual(len(list(Path(folder).iterdir())),1)

    def test_observed_pro_36_header_populated_count_variant_is_checked(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'pro36.vtpk'
            payload=gzip.compress(mvt({'_name':'Do not expose','_symbol':1}))
            data=bytearray(bundle(payload))
            struct.pack_into('<I',data,4,1)
            struct.pack_into('<I',data,8,131092)
            struct.pack_into('<I',data,48,0)
            with zipfile.ZipFile(path,'w') as z:z.writestr('p12/tile/L15/R0000C0000.bundle',data)
            report=inspect.inspect_package(path)
            self.assertEqual(report['tilesInspected'],1);self.assertEqual(report['issues'],[])
            self.assertEqual(report['bundleLayouts'],{'pro-3.6-populated-count':1})
            self.assertFalse(report['sampleContainsRequiredFields'])
            struct.pack_into('<I',data,4,2)
            with zipfile.ZipFile(path,'w') as z:z.writestr('p12/tile/L15/R0000C0000.bundle',data)
            report=inspect.inspect_package(path)
            self.assertIn('populated count does not match',report['issues'][0])
            self.assertEqual(report['tilesInspected'],0)

    def test_sampling_flag_accounts_for_per_bundle_limit_and_prefix_is_verified(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'tiles.vtpk';payload=gzip.compress(mvt(feature()['properties']))
            data=bytearray(bundle(payload));offset=struct.unpack_from('<Q',data,64)[0]&((1<<40)-1)
            struct.pack_into('<Q',data,72,struct.unpack_from('<Q',data,64)[0])
            with zipfile.ZipFile(path,'w') as z:z.writestr('p12/tile/L15/R0000C0000.bundle',data)
            report=inspect.inspect_package(path,max_tiles_per_bundle=1)
            self.assertEqual(report['tilesInspected'],1);self.assertTrue(report['sampleBudgetReached'])
            self.assertEqual(report['tilesSkippedBySampling'],1)
            all_tiles=inspect.inspect_package(path,max_tiles_per_bundle=2)
            self.assertEqual(all_tiles['tilesInspected'],2);self.assertFalse(all_tiles['sampleBudgetReached'])
            struct.pack_into('<I',data,offset-4,len(payload)-1)
            with zipfile.ZipFile(path,'w') as z:z.writestr('p12/tile/L15/R0000C0000.bundle',data)
            report=inspect.inspect_package(path)
            self.assertIn('length prefix',report['issues'][0]);self.assertEqual(report['tilesInspected'],0)

    def test_missing_internal_attributes_and_bad_offsets_do_not_claim_compatibility(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'probe.vtpk';package(path,{'_symbol':1,'_name':'Private name'})
            report=inspect.inspect_package(path,expected={'one':feature()['properties']})
            self.assertFalse(report['sampleContainsRequiredFields']);self.assertEqual(report['uniqueMatchingExpectedRecords'],0)
            self.assertIn('_symbol',report['sourceLayers']['places']['fields'])
            package(path,bad_offset=True);report=inspect.inspect_package(path)
            self.assertTrue(report['issues']);self.assertFalse(report['sampleContainsRequiredFields'])

    def test_mismatched_values_and_null_fields_are_distinguished(self):
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/'test.vtpk';package(p,{**feature()['properties'],'confidence':.2})
            self.assertEqual(inspect.inspect_package(p,expected={'one':feature()['properties']})['uniqueMatchingExpectedRecords'],0)
            properties={**feature()['properties'],'confidence':None,'operating_status':None};package(p,properties)
            self.assertEqual(inspect.inspect_package(p,expected={'one':properties})['uniqueMatchingExpectedRecords'],1)

    def test_gzip_and_protobuf_budgets_fail_closed(self):
        with self.assertRaisesRegex(ValueError,'Decompressed'):list(inspect.tile_properties(gzip.compress(b'x'*(inspect.MAX_TILE_BYTES+1))))
        with self.assertRaises(ValueError):list(inspect.tile_properties(b'\x1a\x7f'))
        with self.assertRaises(ValueError):inspect.inspect_package('not-read',max_tiles=129)


class ProOrchestrationTest(unittest.TestCase):
    def test_sampling_is_nearby_varied_bounded_and_preserves_real_records(self):
        records=[feature('a'),feature('b',29.0001,confidence=None),feature('c',29.0002,operating_status='permanently_closed'),feature('far',35.)]
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/'places.geojson';source.write_text(json.dumps({'type':'FeatureCollection','features':records}))
            sample,info=pro.select_sample(source,3)
            self.assertEqual({r['properties']['gers_id'] for r in sample},{'a','b','c'});self.assertEqual(info['sampleRecords'],3)
            self.assertEqual(info['inputRecords'],4);self.assertEqual(info['nearbyCandidates'],3)
            self.assertIsNone(next(f for f in sample if f['properties']['gers_id']=='b')['properties']['confidence'])
            with self.assertRaises(ValueError):pro.select_sample(source,251)

    def stub(self,fail=False):
        calls=[],[]
        events,inserted=calls
        class Cursor:
            def __enter__(self):return self
            def __exit__(self,*args):pass
            def insertRow(self,row):inserted.append(row)
        class Map:
            def __init__(self):self.metadata=SimpleNamespace(isReadOnly=False,title='',summary='',description='',tags='',credits='')
            spatialReference=None
            defaultCamera=SimpleNamespace(setExtent=lambda e:events.append('extent'))
            def listLayers(self):return ['new-map-default-basemap']
            def removeLayer(self,l):events.append(('remove',l))
            def addDataFromPath(self,p):
                events.append(('add-data',p));self.spatialReference=SimpleNamespace(factoryCode=4326)
                return SimpleNamespace(name='',symbology=SimpleNamespace(updateRenderer=lambda name:None,renderer=SimpleNamespace()),supports=lambda name:False)
        class Project:
            def createMap(self,*args):events.append('create-map');return Map()
            def deleteItem(self,item):events.append('delete-map')
            def save(self):raise AssertionError('Must not save the existing project')
        def create_package(map,path,*args,**kwargs):
            self.assertEqual(map.spatialReference.factoryCode,102100,'Map must be reset AFTER the first layer is added')
            self.assertTrue(map.metadata.description.strip(),'ERROR 001117: Map description property must be set')
            self.assertTrue(map.metadata.summary.strip())
            self.assertTrue(map.metadata.tags.strip())
            self.assertEqual(kwargs['summary'],map.metadata.summary)
            self.assertEqual(kwargs['tags'],map.metadata.tags)
            events.append('create-package')
            if fail:raise RuntimeError('Private SDK error with token=do-not-report')
            package(path)
        management=SimpleNamespace(Project=lambda source,dest,sr:events.append(('project',source,dest,sr.factoryCode)),CreateFileGDB=lambda *a,**k:None,CreateFeatureclass=lambda *a,**k:None,AddField=lambda *a,**k:events.append(('field',a[1],a[2],k)),AddIndex=lambda *a,**k:None,CreateVectorTilePackage=create_package)
        arcpy=SimpleNamespace(GetInstallInfo=lambda:{'Version':'fixture'},management=management,SpatialReference=lambda wkid:SimpleNamespace(factoryCode=wkid),Describe=lambda p:SimpleNamespace(spatialReference=SimpleNamespace(factoryCode=102100)),da=SimpleNamespace(InsertCursor=lambda *a:Cursor()),mp=SimpleNamespace(ArcGISProject=lambda p:Project()),Extent=lambda *args,**kwargs:SimpleNamespace(projectAs=lambda sr:object()))
        return arcpy,events,inserted

    def test_build_uses_typed_fields_genuine_pro_tool_and_cleans_only_its_own_map(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'places.geojson';source.write_text(json.dumps({'type':'FeatureCollection','features':[feature()]}))
            arcpy,events,inserted=self.stub();output=root/'probe'
            report=pro.build_test(source,output,arcpy_module=arcpy)
            self.assertEqual(report['state'],'inspection-complete');self.assertIn('create-package',events);self.assertIn('delete-map',events)
            self.assertTrue(any(e[0]=='field' and e[1]=='confidence' and e[2]=='DOUBLE' for e in events if isinstance(e,tuple)))
            self.assertEqual(len(inserted),1);self.assertEqual((output/'places-package-report.json').exists(),True)
            self.assertTrue(any(e[0]=='project' and e[-1]==102100 for e in events if isinstance(e,tuple)))
            self.assertTrue(any(e[0]=='add-data' and e[1].endswith('places_web_mercator') for e in events if isinstance(e,tuple)))
            self.assertEqual(report['mapSpatialReferenceWkid'],102100)
            with self.assertRaises(ValueError):pro.build_test(source,output,arcpy_module=arcpy)
            (output/'keep.txt').write_text('previous attempt')
            pro.build_test(source,output,fresh_output=True,arcpy_module=arcpy)
            self.assertEqual((output/'keep.txt').read_text(),'previous attempt')
            self.assertTrue((root/'probe-2/places-package-report.json').is_file())

    def test_failure_preserves_existing_data_and_writes_sanitized_report(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'places.geojson';raw=json.dumps({'type':'FeatureCollection','features':[feature()]});source.write_text(raw)
            arcpy,events,_=self.stub(fail=True)
            with self.assertRaises(RuntimeError):pro.build_test(source,root/'probe',arcpy_module=arcpy)
            report=json.loads((root/'probe/places-package-report.json').read_text());self.assertEqual(report['state'],'failed')
            self.assertNotIn('do-not-report',json.dumps(report));self.assertEqual(source.read_text(),raw);self.assertIn('delete-map',events)


if __name__=='__main__':unittest.main()
