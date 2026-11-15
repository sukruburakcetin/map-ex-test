"""Persistence, atomic publication and restart parity for the Places service."""
import json
import hashlib
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools/overture_places'))
from places_store import import_database, open_database, MAX_RECORDS
from places_service import load_config, main
from serve_places_local import Dataset


class PersistentPlacesTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.root = Path(self.folder.name)
        self.source = self.root / 'source.geojsonl'
        self.database = self.root / 'data' / 'places #1.sqlite'
        self.geometry = {'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
        self.records = [
            {'type':'Feature','geometry':{'type':'Point','coordinates':[29 + i*.00001,41]},
             'properties':{'gers_id':str(i),'place_name':'Café '+str(i),'category':'restaurant' if i%2 else None,
                           'confidence':None if i%2==0 else .9,'operating_status':'permanently_closed' if i==1 else 'open',
                           'data_release':'2026-10-21.0'}} for i in range(250)
        ]
        self.save()

    def save(self):
        self.source.write_text('\n'.join(json.dumps(row) for row in self.records), encoding='utf-8')
        self.source.with_suffix('.manifest.json').write_text(json.dumps({'schema':'overture-places-all-pilot-v1','release':'2026-10-21.0','feature_count':len(self.records),'bbox':[28.9,40.9,29.1,41.1]}))

    def tearDown(self):
        self.folder.cleanup()

    def test_readonly_restart_needs_no_source_files_and_does_not_reindex(self):
        metadata = import_database(self.source, self.database)
        self.assertEqual(metadata['count'], 250)
        self.assertEqual(metadata['source_sha256'], hashlib.sha256(self.source.read_bytes()).hexdigest())
        self.source.unlink()
        self.source.with_suffix('.manifest.json').unlink()
        with patch('serve_places_local.populate', side_effect=AssertionError('Startup must not import')):
            first = Dataset(database=self.database)
        try:
            expected = first.query(self.geometry, limit=200, origin={'lon':29,'lat':41})
            self.assertEqual(len(expected['features']), 200)
            with self.assertRaises(sqlite3.OperationalError):
                first.db.execute('DELETE FROM places')
        finally:
            first.db.close()
        second = Dataset(database=self.database)
        try:
            self.assertEqual(second.query(self.geometry, limit=200, origin={'lon':29,'lat':41}), expected)
        finally:
            second.db.close()

    def test_persistent_tiles_picks_search_and_filters_match_memory(self):
        memory = Dataset(self.source)
        import_database(self.source, self.database)
        disk = Dataset(database=self.database)
        try:
            from serve_places_local import project
            for minimum, closed, family in [(None,False,'all'),(.75,True,'restaurant'),(0,False,'all')]:
                for offset in (0,200):
                    args = {'limit':200,'origin':{'lon':29.001,'lat':41},'offset':offset,'search':'CAFE'}
                    self.assertEqual(memory.query(self.geometry,minimum,closed,family=family,**args),disk.query(self.geometry,minimum,closed,family=family,**args))
                for zoom in (12,15,19):
                    px,py=project(29,41);x,y=int(px*2**zoom),int(py*2**zoom)
                    self.assertEqual(memory.tile(zoom,x,y,minimum,closed,family),disk.tile(zoom,x,y,minimum,closed,family))
                self.assertEqual(memory.cluster_query(self.geometry,15,minimum,closed,family),disk.cluster_query(self.geometry,15,minimum,closed,family))
            self.assertEqual(memory.icon_counts,disk.icon_counts)
            self.assertEqual(memory.unmapped_categories,disk.unmapped_categories)
        finally:
            memory.db.close();disk.db.close()

    def test_existing_release_is_never_overwritten_even_when_another_import_wins(self):
        import_database(self.source, self.database)
        before = self.database.read_bytes()
        with self.assertRaisesRegex(ValueError,'already exists'):
            import_database(self.source,self.database)
        self.assertEqual(self.database.read_bytes(),before)
        other=self.root/'race.sqlite'
        def publish_first(_source,destination):
            Path(destination).write_bytes(b'other completed import')
            raise FileExistsError()
        with patch('places_store.os.link',side_effect=publish_first), self.assertRaisesRegex(ValueError,'already exists'):
            import_database(self.source,other)
        self.assertEqual(other.read_bytes(),b'other completed import')
        self.assertFalse(list(self.root.glob('.*.import*')))

    def test_invalid_or_incomplete_import_publishes_nothing_and_preserves_other_release(self):
        import_database(self.source,self.database)
        before=self.database.read_bytes()
        for mutate in [lambda: self.records.append(self.records[0]),
                       lambda: self.records[0]['geometry'].update(coordinates=[False,41]),
                       lambda: self.records[0]['properties'].update(data_release='2026-01-01.0'),
                       lambda: self.records[0]['properties'].update(confidence=2),
                       lambda: self.records[0]['properties'].update(gers_id=' invalid ')]:
            old=json.loads(json.dumps(self.records));mutate();self.save()
            with self.assertRaises(ValueError):import_database(self.source,self.root/'invalid.sqlite')
            self.assertFalse((self.root/'invalid.sqlite').exists())
            self.assertEqual(self.database.read_bytes(),before)
            self.assertFalse(list(self.root.glob('.*.import*')))
            self.records=old
        self.save()
        manifest=json.loads(self.source.with_suffix('.manifest.json').read_text());manifest['feature_count']+=1
        self.source.with_suffix('.manifest.json').write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError,'mismatch'):import_database(self.source,self.root/'invalid.sqlite')
        self.assertFalse((self.root/'invalid.sqlite').exists())

    def test_wrong_or_damaged_schema_is_rejected_without_writing(self):
        wrong=self.root/'wrong.sqlite'
        sqlite3.connect(wrong).close()
        with self.assertRaisesRegex(ValueError,'Unsupported'):open_database(wrong)
        import_database(self.source,self.database)
        db=sqlite3.connect(self.database);db.execute('DROP INDEX places_icon_family');db.commit();db.close()
        with self.assertRaisesRegex(ValueError,'indexes'):open_database(self.database)

    def test_health_reports_unavailable_when_database_is_closed(self):
        from serve_places_local import make_handler
        import_database(self.source,self.database)
        dataset=Dataset(database=self.database)
        handler=object.__new__(make_handler(dataset,'https://example.org/places','https://app.example'))
        handler.path='/places/health';replies=[];handler.reply=lambda status,body:replies.append((status,body))
        dataset.db.close();handler.do_GET()
        self.assertEqual(replies,[(503,{'ready':False})])

    def test_two_dated_databases_allow_explicit_restart_rollback(self):
        import_database(self.source,self.database)
        live=Dataset(database=self.database)
        try:
            self.records[0]['properties']['place_name']='Updated cafe';self.save()
            newer=self.root/'next.sqlite';import_database(self.source,newer)
            self.assertEqual(json.loads(live.db.execute("SELECT properties FROM places WHERE gers='0'").fetchone()[0])['place_name'],'Café 0')
        finally:live.db.close()
        for database,expected in [(self.database,'Café 0'),(newer,'Updated cafe'),(self.database,'Café 0')]:
            dataset=Dataset(database=database)
            try:self.assertEqual(json.loads(dataset.db.execute("SELECT properties FROM places WHERE gers='0'").fetchone()[0])['place_name'],expected)
            finally:dataset.db.close()

    def test_config_paths_are_relative_and_configuration_rejects_common_mistakes(self):
        import_database(self.source,self.database)
        (self.root/'cert.pem').write_text('certificate placeholder')
        (self.root/'key.pem').write_text('key placeholder')
        config={'database':'data/places #1.sqlite','public_url':'https://maps.example/places/','origins':['https://app.example/','https://builder.example'],
                'tls':{'cert':'cert.pem','key':'key.pem'}}
        file=self.root/'service.json';file.write_text(json.dumps(config))
        actual=load_config(file)
        self.assertEqual(actual['database'],self.database.resolve())
        self.assertEqual(actual['origins'],['https://app.example','https://builder.example'])
        self.assertEqual(actual['public_url'],'https://maps.example/places')
        for key,value in [('port',True),('port',0),('host','::1'),('origins',[]),('origins',['https://app.example/page']),('public_url','https://maps.example/status'),('public_url','http://maps.example'),('public_url','https://user:secret@maps.example')]:
            invalid={**config,key:value};file.write_text(json.dumps(invalid))
            with self.subTest(key=key,value=value),self.assertRaises(ValueError):load_config(file)
        file.write_text(json.dumps({**config,'unexpected':True}))
        with self.assertRaises(ValueError):load_config(file)


if __name__=='__main__':unittest.main()
