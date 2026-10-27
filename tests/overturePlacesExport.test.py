import argparse
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('places_export', Path(__file__).parents[1] / 'tools/overture_places/export_places.py')
export = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export)

class PlacesExportTest(unittest.TestCase):
    def test_bbox_validation(self):
        self.assertEqual(export.parse_bbox('-86.16,39.75,-86.10,39.80'), (-86.16,39.75,-86.10,39.80))
        for value in ['0,0,0,1', '180,0,-180,1', '0,nan,1,2', '0,86,1,87', '1,2']:
            with self.assertRaises(argparse.ArgumentTypeError): export.parse_bbox(value)
    def test_release_rejects_paths_and_sql(self):
        self.assertEqual(export.release_id('2026-10-21.0'), '2026-10-21.0')
        for value in ['../../secret', '2026-01-01.0/other', "x' OR true", '']:
            with self.assertRaises(ValueError): export.release_id(value)
    def test_atomic_export_bounded_fields_and_deduplication(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'places.geojson'
            row = ('g1','A school','school','education',.99,'Address','https://example.com',29.0,41.0)
            count = export.write_geojson([row,row,('g2',*row[1:]),('g3','B'*200,'hospital','health',.98,'A'*300,'',29.1,41.1)],path,'2026-10-21.0')
            self.assertEqual(count,2)
            data=json.loads(path.read_text());self.assertEqual(data['features'][0]['geometry']['coordinates'],[29.0,41.0])
            self.assertEqual(data['features'][0]['properties']['data_release'],'2026-10-21.0')
            self.assertEqual(len(data['features'][1]['properties']['place_name']),120)
            self.assertEqual(len(data['features'][1]['properties']['address']),180)
            self.assertFalse(path.with_suffix('.geojson.tmp').exists())
    def test_empty_output_is_not_published(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'places.geojson'
            with self.assertRaises(ValueError):export.write_geojson([],path,'2026-10-21.0')
            self.assertFalse(path.exists())
    def test_group_mapping_uses_current_schema(self):
        sql=export.group_sql()
        self.assertIn('basic_category',sql);self.assertIn('taxonomy.hierarchy',sql)
        self.assertNotIn('categories.primary',sql)
        for group in ['health','education','parks','landmarks','services']:self.assertIn("THEN '"+group+"'",sql)

class DuckDBQueryTest(unittest.TestCase):
    def test_actual_sql_with_local_parquet_and_geometry_function_stubs(self):
        try:
            import duckdb
        except ImportError:
            self.skipTest('Optional publishing-environment DuckDB is not installed')
        from unittest.mock import patch
        import struct
        with tempfile.TemporaryDirectory() as folder:
            connection=duckdb.connect()
            connection.create_function('fixture_ST_GeomFromWKB',lambda value:value,['BLOB'],'BLOB')
            connection.create_function('fixture_ST_X',lambda value:struct.unpack('<bIdd',value)[2],['BLOB'],'DOUBLE')
            connection.create_function('fixture_ST_Y',lambda value:struct.unpack('<bIdd',value)[3],['BLOB'],'DOUBLE')
            parquet=Path(folder)/'fixture.parquet'
            geometry=struct.pack('<bIdd',1,1,29.0,41.0)
            connection.sql("SELECT 'gers-1' AS id, struct_pack(\"primary\":='School') AS names, 'school' AS basic_category, struct_pack(hierarchy:=['education'],\"primary\":='school') AS taxonomy, 0.98 AS confidence, ? AS geometry, struct_pack(xmin:=29.0,xmax:=29.0,ymin:=41.0,ymax:=41.0) AS bbox, [struct_pack(freeform:='Main Road')] AS addresses, ['https://example.com'] AS websites",params=[geometry]).write_parquet(str(parquet))
            class LocalConnection:
                def execute(self,sql,*args):
                    if sql.startswith(('INSTALL ','LOAD ')):return self
                    return connection.execute(sql.replace('ST_GeomFromWKB(', 'fixture_ST_GeomFromWKB(').replace('ST_X(', 'fixture_ST_X(').replace('ST_Y(', 'fixture_ST_Y('),*args)
                def read_parquet(self,source):return connection.read_parquet(source)
                def close(self):connection.close()
            output=Path(folder)/'places.geojson'
            with patch.object(duckdb,'connect',return_value=LocalConnection()):
                export.main(['--bbox=28.9,40.9,29.1,41.1','--release','2026-10-21.0','--input-parquet',str(parquet),'--output',str(output)])
            data=json.loads(output.read_text())
            self.assertEqual(len(data['features']),1)
            self.assertEqual(data['features'][0]['properties']['place_group'],'education')
            self.assertEqual(data['features'][0]['geometry']['coordinates'],[29.0,41.0])
            self.assertEqual(json.loads(output.with_suffix('.manifest.json').read_text())['feature_count'],1)

if __name__=='__main__': unittest.main()
