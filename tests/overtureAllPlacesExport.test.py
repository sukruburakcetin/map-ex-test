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
    def test_shared_bbox_validation_preserves_wgs84_and_webmercator_bounds(self):
        import argparse
        from export_common import parse_bbox
        self.assertEqual(parse_bbox('-86.16,39.75,-86.10,39.80'), (-86.16,39.75,-86.10,39.80))
        for invalid in ['1,2,3', '3,2,1,4', '0,-90,1,1', '0,0,nan,1', '170,0,-170,1']:
            with self.subTest(invalid=invalid), self.assertRaises(argparse.ArgumentTypeError):
                parse_bbox(invalid)

    def test_shared_release_resolution_retains_pinning_and_validates_latest_response(self):
        from export_common import release_id
        from unittest.mock import patch
        import io
        self.assertEqual(release_id('2026-10-21.0'), '2026-10-21.0')
        with patch('export_common.urllib.request.urlopen', return_value=io.BytesIO(b'{"latest":"2026-10-21.0"}')):
            self.assertEqual(release_id('latest'), '2026-10-21.0')
        for invalid in ['2026-10', 'https://example.org/release', '../release']:
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                release_id(invalid)

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
                def close(self): pass
            try:
                for fmt in ['geojsonl', 'geojson']:
                    output = folder / ('places-' + fmt + '.' + fmt)
                    with patch.object(duckdb, 'connect', return_value=LocalConnection()):
                        export.main(['--bbox=28.9,40.9,29.1,41.1','--release','2026-10-21.0','--input-parquet',str(parquet),'--format',fmt,'--output',str(output)])
                    features = json.loads(output.read_text())['features'] if fmt == 'geojson' else [json.loads(line) for line in output.read_text().splitlines()]
                    self.assertEqual({f['properties']['gers_id'] for f in features}, {'unknown','closed','low'})
                    self.assertEqual(next(f for f in features if f['properties']['gers_id']=='low')['properties']['icon_group'],'cafe')
                    manifest = json.loads(output.with_suffix('.manifest.json').read_text())
                    self.assertEqual(manifest['feature_count'],3)
                    self.assertEqual(manifest['format'],fmt)
                    self.assertIsNone(manifest['confidence_filter'])
                    self.assertIsNone(manifest['category_filter'])
            finally:
                connection.close()


if __name__ == '__main__':
    unittest.main()
