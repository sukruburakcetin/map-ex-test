"""Saved-area refresh, release discovery, publication state and rollback safety."""
import argparse
import copy
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/overture_places'))
import places_area as area
import places_releases as catalog
from places_geojson import write_features

R1='2026-09-23.0';R2='2026-10-21.0'


def feature(identifier='a',**properties):
    return {'type':'Feature','geometry':{'type':'Point','coordinates':[29.,41.]},'properties':{'gers_id':identifier,'place_name':'Café','category':'cafe','confidence':.75,'data_release':R1,**properties}}


def exporter(features):
    def run(arguments):
        p=argparse.ArgumentParser();p.add_argument('--bbox');p.add_argument('--release');p.add_argument('--output');p.add_argument('--max-features',type=int);args=p.parse_args(arguments)
        output=Path(args.output);rows=copy.deepcopy(features)
        for row in rows:row['properties']['data_release']=args.release
        count=write_features(rows,output,args.max_features,output.suffix[1:])
        output.with_suffix('.manifest.json').write_text(json.dumps({'release':args.release,'feature_count':count,'bbox':list(map(float,args.bbox.split(','))),'schema':'overture-places-all-pilot-v1','source':'test-fixture'}))
    return run


class SavedAreas(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.profile=self.base/'area.json'
        area.init_profile(self.profile,'İstanbul operations',[28.9,40.9,29.1,41.1],'external')
    def tearDown(self):self.tmp.cleanup()
    def root(self):return area.load_profile(self.profile)[2]
    def prepare(self,release,features):return area.prepare(self.profile,release,exporter=exporter(features))
    def test_refresh_real_sqlite_and_publication_remain_separate(self):
        first=self.prepare(R1,[feature('a'),feature('b')]);self.assertEqual(first['status'],'prepared_not_published');self.assertIsNone(area.published_release(self.root()))
        area.mark_published(self.profile,R1)
        newer=self.prepare(R2,[feature('a',place_name='New café'),feature('c')])
        self.assertEqual(newer['changes'],{'added':1,'removed':1,'changed':1,'unchanged':0})
        self.assertEqual(area.published_release(self.root()),R1)
        report=area.read_json(Path(newer['folder'])/'changes.json',1024*1024)
        self.assertIn('place_name',report['changed_ids'][0]['fields']);self.assertNotIn('data_release',report['changed_ids'][0]['fields'])
        self.assertTrue((Path(first['folder'])/'places.sqlite').is_file())
        self.assertEqual(area.mark_published(self.profile,R2)['previous_release'],R1)
    def test_default_exporter_is_quiet_and_only_final_paths_are_reported(self):
        import export_all_places
        from contextlib import redirect_stdout
        output=io.StringIO()
        with patch.object(export_all_places,'main',side_effect=lambda argv,quiet=False:exporter([feature()])(argv)) as download,redirect_stdout(output):
            result=area.prepare(self.profile,R1)
        self.assertTrue(download.call_args.kwargs['quiet'])
        self.assertNotIn('.places-refresh-',json.dumps(result));self.assertNotIn('Upload',output.getvalue())
        self.assertTrue(Path(result['source_path']).is_file());self.assertTrue(Path(result['changes_report']).is_file())
    def test_release_only_change_is_not_an_object_change(self):
        self.prepare(R1,[feature()]);second=self.prepare(R2,[feature()]);self.assertEqual(second['changes'],{'added':0,'removed':0,'changed':0,'unchanged':1})
    def test_repeated_prepare_is_idempotent_and_never_downloads_twice(self):
        first=self.prepare(R1,[feature()]);source=Path(first['folder'])/'places.geojsonl';original=source.read_bytes()
        result=area.prepare(self.profile,R1,exporter=lambda args:self.fail('Unexpected download'))
        self.assertTrue(result['already_prepared']);self.assertEqual(source.read_bytes(),original)
    def test_failed_download_or_import_leaves_no_ready_release_and_keeps_previous(self):
        first=self.prepare(R1,[feature()]);original=(Path(first['folder'])/'places.sqlite').read_bytes()
        def broken(arguments):raise ValueError('download interrupted')
        with self.assertRaises(ValueError):area.prepare(self.profile,R2,exporter=broken)
        with self.assertRaises(ValueError):area.prepare(self.profile,R2,exporter=exporter([feature()]),importer=lambda *a:(_ for _ in ()).throw(ValueError('import interrupted')))
        self.assertFalse((self.root()/'releases'/R2).exists());self.assertEqual((Path(first['folder'])/'places.sqlite').read_bytes(),original)
    def test_truncated_duplicate_empty_or_outside_data_never_publish(self):
        for values in [[feature(),feature()],[],[{**feature(),'geometry':{'type':'Point','coordinates':[0,0]}}]]:
            with self.assertRaises(ValueError):self.prepare(R1,values)
            self.assertFalse((self.root()/'releases'/R1/'preparation.json').exists())
    def test_modifications_cannot_be_silently_marked_published(self):
        result=self.prepare(R1,[feature()]);(Path(result['folder'])/'places.geojsonl').write_text('edited')
        with self.assertRaisesRegex(ValueError,'modified'):area.mark_published(self.profile,R1)
        self.assertIsNone(area.published_release(self.root()))
    def test_changed_area_cannot_compare_against_another_rectangle(self):
        self.prepare(R1,[feature()]);value=area.read_json(self.profile);value['bbox']=[28.,40.,30.,42.];self.profile.write_text(json.dumps(value))
        with self.assertRaisesRegex(ValueError,'match'):self.prepare(R2,[feature()])
    def test_profiles_reject_paths_credentials_unknown_modes_and_antimeridian(self):
        profile=area.read_json(self.profile)
        for key,value in [('output_directory','../elsewhere'),('output_directory','C:/private'),('output_directory','/tmp/x'),('source','url'),('bbox',[170,0,-170,1]),('max_features',100001),('release','2026-99-99.0')]:
            with self.subTest(key=key,value=value),self.assertRaises(ValueError):area.validate_profile({**profile,key:value})
        with self.assertRaises(ValueError):area.validate_profile({**profile,'token':'secret'})
    def test_boundary_file_avoids_typing_coordinates_and_uses_rectangle(self):
        file=self.base/'boundary.geojson';file.write_text(json.dumps({'type':'Polygon','coordinates':[[[28.9,40.9],[29.1,40.9],[29.1,41.1],[28.9,41.1],[28.9,40.9]]]}))
        self.assertEqual(area.boundary_bbox(file),[28.9,40.9,29.1,41.1])
        file.write_text(json.dumps({'type':'Polygon','coordinates':[[[179,0],[-179,0],[-179,1],[179,1],[179,0]]]}))
        with self.assertRaisesRegex(ValueError,'date line'):area.boundary_bbox(file)
    def test_report_escapes_untrusted_names_and_bounds_examples(self):
        values=[feature(str(i),place_name='<script>alert(1)</script>') for i in range(105)]
        result=self.prepare(R1,values);text=(Path(result['folder'])/'changes.html').read_text()
        self.assertNotIn('<script>',text);self.assertIn('&lt;script&gt;',text)
        report=area.read_json(Path(result['folder'])/'changes.json',2*1024*1024)
        self.assertEqual(len(report['added_ids']),105);self.assertEqual(len(report['examples']['added']),100)
    def test_profile_folders_resolve_beside_profile_not_shell_working_directory(self):
        _,profile,root=area.load_profile(self.profile);self.assertEqual(root,self.base/'places-data'/'istanbul-operations'/'external')
    def test_check_distinguishes_prepared_from_declared_publication(self):
        self.prepare(R1,[feature()]);catalog_file=self.base/'catalog.json';catalog_file.write_text(json.dumps({'latest':R2}))
        first=area.check(self.profile,catalog_file);self.assertIsNone(first['published_release']);self.assertEqual(first['prepared_releases'],[R1])
        area.mark_published(self.profile,R1);second=area.check(self.profile,catalog_file);self.assertEqual(second['published_release'],R1);self.assertTrue(second['newer_than_published'])
    def test_existing_manual_snapshot_can_be_adopted_without_network_or_service_changes(self):
        source=self.base/'manual.geojson';write_features([feature()],source,25000,'geojson')
        manifest=self.base/'manual.manifest.json';manifest.write_text(json.dumps({'schema':'overture-places-portal-v1','release':R1,'bbox':[28.9,40.9,29.1,41.1],'feature_count':1}))
        with patch.object(area,'available_releases',side_effect=AssertionError('No catalog fetch for adoption')):
            result=area.adopt(self.profile,source,manifest,published=True)
        self.assertEqual(result['publication']['release'],R1);self.assertTrue(result['publication']['existing_deployment'])
        self.assertTrue(source.exists());self.assertEqual(self.prepare(R2,[feature()])['changes']['unchanged'],1)
    def test_adoption_cannot_relabel_a_different_existing_snapshot_as_published(self):
        self.prepare(R1,[feature()]);source=self.base/'different.geojson';write_features([feature(place_name='Changed')],source,25000,'geojson')
        manifest=self.base/'different.manifest.json';manifest.write_text(json.dumps({'schema':'overture-places-portal-v1','release':R1,'bbox':[28.9,40.9,29.1,41.1],'feature_count':1}))
        with self.assertRaisesRegex(ValueError,'different snapshot'):area.adopt(self.profile,source,manifest,published=True)
        self.assertIsNone(area.published_release(self.root()))
    def test_record_limit_failure_leaves_no_prepared_snapshot(self):
        profile=area.read_json(self.profile);profile['max_features']=1;self.profile.write_text(json.dumps(profile))
        with self.assertRaisesRegex(ValueError,'exceeds'):self.prepare(R1,[feature('a'),feature('b')])
        self.assertFalse((self.root()/'releases'/R1).exists())
    def test_portal_build_runs_all_existing_steps_in_order_and_is_never_implicit_publication(self):
        portal=self.base/'portal.json';area.init_profile(portal,'Same area',[28.9,40.9,29.1,41.1],'portal');result=area.prepare(portal,R1,exporter=exporter([feature()]))
        events=[]
        def builder(source,output,**kwargs):
            events.append('build');output.mkdir();(output/'places-portal.vtpk').write_bytes(b'native restored');(output/'places-package-source.geojson').write_bytes(source.read_bytes());self.assertFalse(kwargs['fresh_output'])
        def styler(source,output):events.append('icons');output.write_bytes(b'icons')
        def clusterer(source,geojson,output):events.append('clusters');output.write_bytes(b'clusters')
        with self.assertRaisesRegex(ValueError,'Build'):area.mark_published(portal,R1)
        built=area.build_portal(portal,R1,'https://example.com/FeatureServer/0',builder=builder,styler=styler,clusterer=clusterer)
        self.assertEqual(events,['build','icons','clusters']);self.assertFalse(built['portal_publishing_tested'])
        self.assertEqual(area.mark_published(portal,R1)['release'],R1)
        with self.assertRaisesRegex(ValueError,'exists'):area.build_portal(portal,R1,'https://example.com/FeatureServer/0',builder=builder)


class ReleaseCatalog(unittest.TestCase):
    def test_catalog_children_numeric_revision_and_latest_field(self):
        catalog_data={'latest':'2026-10-21.9','links':[{'rel':'child','href':'./2026-10-21.10/catalog.json'},{'rel':'child','href':'https://evil.example/2027-01-01.0/catalog.json'},{'rel':'parent','href':'2027-01-01.0/catalog.json'}]}
        self.assertEqual(catalog.catalog_releases(catalog_data),['2026-10-21.10','2026-10-21.9'])
    def test_release_network_is_only_explicit_bounded_and_has_timeout(self):
        raw=io.BytesIO(json.dumps({'latest':R2}).encode())
        with patch.object(catalog.urllib.request,'urlopen',return_value=raw) as request:
            self.assertEqual(catalog.available_releases(),[R2]);self.assertEqual(request.call_args.kwargs['timeout'],30)
        with self.assertRaises(ValueError):catalog.catalog_releases({'links':[]})

if __name__=='__main__':unittest.main()
