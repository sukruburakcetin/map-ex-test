import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools/overture_places'))
import export_all_places as export

class Cursor:
    def __init__(self, rows): self.rows = iter(rows)
    def fetchmany(self, limit):
        import itertools
        return list(itertools.islice(self.rows, limit))

class AllPlacesExportTest(unittest.TestCase):
    def test_preserves_low_null_confidence_unnamed_uncategorized_closed_and_colocated(self):
        rows = [('a', None, None, None, None, None, None, 29., 41.),
                ('b', 'Closed', 'restaurant', 0., 'permanently_closed', '', '', 29., 41.),
                ('c', 'Cafe', 'cafe', .1, 'open', '', '', 29., 41.)]
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder) / 'places.geojsonl'
            self.assertEqual(export.write_sequence(Cursor(rows), output, '2026-10-21.0', 3), 3)
            records = [json.loads(line) for line in output.read_text().splitlines()]
            self.assertIsNone(records[0]['properties']['confidence'])
            self.assertIsNone(records[0]['properties']['place_name'])
            self.assertIsNone(records[0]['properties']['category'])
            self.assertEqual(records[1]['properties']['operating_status'], 'permanently_closed')
            self.assertEqual(records[2]['properties']['confidence'], .1)
            self.assertFalse(output.with_suffix('.geojsonl.tmp').exists())

    def test_limit_or_invalid_source_does_not_replace_existing_output(self):
        row = ('a', 'A', 'cafe', .1, None, None, None, 29., 41.)
        for rows in [[row, row], [(None, *row[1:])], [(*row[:-2], float('nan'), 41.)], []]:
            with self.subTest(rows=rows), tempfile.TemporaryDirectory() as folder:
                output = Path(folder) / 'places.geojsonl'
                output.write_text('previous snapshot')
                with self.assertRaises(ValueError): export.write_sequence(Cursor(rows), output, '2026-10-21.0', 1)
                self.assertEqual(output.read_text(), 'previous snapshot')
                self.assertFalse(output.with_suffix('.geojsonl.tmp').exists())


class AllPlacesQueryTest(unittest.TestCase):
    def test_real_duckdb_query_retains_all_categories_and_confidence(self):
        try:
            import duckdb
        except ImportError:
            self.skipTest('Install the offline publishing requirements to exercise DuckDB')
        import struct
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            connection = duckdb.connect()
            connection.create_function('fixture_ST_GeomFromWKB', lambda value: value, ['BLOB'], 'BLOB')
            connection.create_function('fixture_ST_X', lambda value: struct.unpack('<bIdd', value)[2], ['BLOB'], 'DOUBLE')
            connection.create_function('fixture_ST_Y', lambda value: struct.unpack('<bIdd', value)[3], ['BLOB'], 'DOUBLE')
            connection.execute('CREATE TABLE fixture (id VARCHAR, names STRUCT("primary" VARCHAR), basic_category VARCHAR, confidence DOUBLE, operating_status VARCHAR, geometry BLOB, bbox STRUCT(xmin DOUBLE,xmax DOUBLE,ymin DOUBLE,ymax DOUBLE))')
            for identifier, name, category, confidence, status, lon in [
                ('unknown', None, None, None, None, 29.),
                ('closed', 'Closed', 'restaurant', 0., 'permanently_closed', 29.),
                ('low', 'Low', 'cafe', .1, 'open', 29.),
                ('outside', 'Outside', 'cafe', .99, 'open', 35.)]:
                connection.execute('INSERT INTO fixture VALUES (?, {"primary":?}, ?, ?, ?, ?, {xmin:?, xmax:?, ymin:41., ymax:41.})', [identifier, name, category, confidence, status, struct.pack('<bIdd',1,1,lon,41.), lon, lon])
            parquet = folder / 'source.parquet'
            connection.table('fixture').write_parquet(str(parquet))
            class LocalConnection:
                def execute(self, sql, *args):
                    if sql.startswith(('INSTALL ', 'LOAD ')): return self
                    return connection.execute(sql.replace('ST_GeomFromWKB(', 'fixture_ST_GeomFromWKB(').replace('ST_X(', 'fixture_ST_X(').replace('ST_Y(', 'fixture_ST_Y('), *args)
                def read_parquet(self, source): return connection.read_parquet(source)
                def close(self): connection.close()
            output = folder / 'places.geojsonl'
            with patch.object(duckdb, 'connect', return_value=LocalConnection()):
                export.main(['--bbox=28.9,40.9,29.1,41.1','--release','2026-10-21.0','--input-parquet',str(parquet),'--output',str(output)])
            features = [json.loads(line) for line in output.read_text().splitlines()]
            self.assertEqual({f['properties']['gers_id'] for f in features}, {'unknown','closed','low'})
            manifest = json.loads(output.with_suffix('.manifest.json').read_text())
            self.assertEqual(manifest['feature_count'],3)
            self.assertIsNone(manifest['confidence_filter'])
            self.assertIsNone(manifest['category_filter'])



class ArcGISImportTest(unittest.TestCase):
    def test_nullable_values_survive_import_and_count_mismatch_rolls_back(self):
        import prepare_all_places_arcpy as prepare
        from types import SimpleNamespace
        for expected_count in [1, 2]:
            with self.subTest(count=expected_count), tempfile.TemporaryDirectory() as folder:
                folder = Path(folder)
                source = folder / 'places.geojsonl'
                export.write_sequence(Cursor([('a', None, None, None, None, None, None, 29., 41.)]), source, '2026-10-21.0', 10)
                source.with_suffix('.manifest.json').write_text(json.dumps({'schema':'overture-places-all-pilot-v1','format':'geojsonl','release':'2026-10-21.0','feature_count':expected_count}))
                inserted, events, fields = [], [], []
                class InsertCursor:
                    def __enter__(self): return self
                    def __exit__(self, *args): return False
                    def insertRow(self, row): inserted.append(row)
                management = SimpleNamespace(
                    CreateFileGDB=lambda *args: None, CreateFeatureclass=lambda *args, **kwargs: None,
                    AddField=lambda destination, name, kind, **kwargs: fields.append((name,kind,kwargs)),
                    AddIndex=lambda *args: events.append('index'), AddSpatialIndex=lambda *args: events.append('spatial'),
                    Delete=lambda *args: events.append('delete'))
                arcpy = SimpleNamespace(Exists=lambda path: False, SpatialReference=lambda wkid: wkid,
                    management=management, da=SimpleNamespace(InsertCursor=lambda *args: InsertCursor()))
                if expected_count == 2:
                    with self.assertRaisesRegex(ValueError,'count'):
                        prepare.import_snapshot(source, folder/'test.gdb', 'places', arcpy)
                    self.assertEqual(events,['delete'])
                else:
                    destination, count = prepare.import_snapshot(source, folder/'test.gdb', 'places', arcpy)
                    self.assertEqual(count,1)
                    self.assertEqual(inserted[0][1],'a')
                    self.assertIsNone(inserted[0][4])
                    self.assertIn(('confidence','DOUBLE',{'field_is_nullable':'NULLABLE'}),fields)
                    self.assertEqual(events,['index','spatial'])

if __name__ == '__main__': unittest.main()
