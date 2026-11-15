"""Portal GeoJSON export/conversion, null semantics and exclusive publication."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools/overture_places'))
import convert_places_geojson as convert
import places_geojson as formats
import export_all_places as export


def feature(identifier='one', **properties):
    return {'type':'Feature','geometry':{'type':'Point','coordinates':[29.,41.]},'properties':{
        'gers_id':identifier,'place_name':'Café İstanbul','category':'cafe','confidence':None,
        'operating_status':None,'address':None,'website':None,'data_release':'2026-10-21.0',**properties}}


class PlacesGeojsonTest(unittest.TestCase):
    def test_converter_preserves_identity_nulls_unicode_colocated_records_and_source(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'places.geojsonl';output=root/'places-portal.geojson'
            records=[feature(),feature('two',category=None,place_name=None,confidence=0.,operating_status='permanently_closed')]
            raw=('\ufeff'+ '\r\n\r\n'.join(json.dumps(row,ensure_ascii=False) for row in records)).encode('utf-8')
            source.write_bytes(raw)
            self.assertEqual(convert.main(['--input',str(source),'--output',str(output)]),2)
            collection=json.loads(output.read_text(encoding='utf-8'));self.assertEqual(collection['type'],'FeatureCollection')
            actual=collection['features'];self.assertEqual(len(actual),2)
            self.assertEqual(actual[0]['properties']['icon_group'],'cafe');self.assertEqual(actual[1]['properties']['icon_group'],'other')
            for i,row in enumerate(records):
                for key,value in row['properties'].items():self.assertEqual(actual[i]['properties'][key],value)
                self.assertEqual(actual[i]['geometry'],row['geometry'])
            self.assertEqual(source.read_bytes(),raw)
            with self.assertRaises(ValueError):convert.main(['--input',str(source),'--output',str(output)])
            self.assertEqual(len(json.loads(output.read_text())['features']),2)

    def test_invalid_late_rows_empty_files_and_limits_publish_nothing(self):
        invalid=[feature(confidence=True),feature(confidence=1.1),feature(category=3),feature(gers_id=''),feature('same')]
        invalid[3]['geometry']['coordinates']=[float('inf'),41]
        for bad in invalid:
            with self.subTest(bad=bad),tempfile.TemporaryDirectory() as folder:
                p=Path(folder)/'out.geojson';rows=[feature('same'),bad]
                with self.assertRaises(ValueError):formats.write_features(iter(rows),p,10)
                self.assertEqual(list(Path(folder).iterdir()),[])
        for rows,limit in [([],10),([feature(),feature('two')],1)]:
            with tempfile.TemporaryDirectory() as folder:
                p=Path(folder)/'out.geojson'
                with self.assertRaises(ValueError):formats.write_features(iter(rows),p,limit)
                self.assertFalse(p.exists())

    def test_bad_json_and_featurecollection_inputs_are_explained_and_leave_no_output(self):
        for raw in ['{bad json}',json.dumps({'type':'FeatureCollection','features':[feature()]}),'\n',json.dumps(feature())+'\n'+json.dumps(feature('two',confidence=float('nan')))]:
            with self.subTest(raw=raw),tempfile.TemporaryDirectory() as folder:
                source=Path(folder)/'in.geojsonl';output=Path(folder)/'out.geojson';source.write_text(raw)
                with self.assertRaisesRegex(ValueError,'line|No places'):
                    convert.main(['--input',str(source),'--output',str(output)])
                self.assertFalse(output.exists());self.assertFalse(list(Path(folder).glob('*.tmp')))

    def test_both_export_formats_use_same_normalized_properties_and_stream_batches(self):
        class Cursor:
            def __init__(self):self.calls=[];self.used=False
            def fetchmany(self,n):
                self.calls.append(n)
                if self.used:return []
                self.used=True
                return [('one','Café İstanbul','cafe',None,None,None,None,29.,41.),('two',None,None,0.,'permanently_closed',None,None,29.,41.)]
        with tempfile.TemporaryDirectory() as folder:
            actual=[]
            for fmt in ['geojson','geojsonl']:
                cursor=Cursor();output=Path(folder)/('places.'+fmt)
                self.assertEqual(export.write_sequence(cursor,output,'2026-10-21.0',2,fmt),2)
                self.assertEqual(cursor.calls,[512,512])
                actual.append(json.loads(output.read_text())['features'] if fmt=='geojson' else [json.loads(line) for line in output.read_text().splitlines()])
            self.assertEqual(actual[0],actual[1]);self.assertIsNone(actual[0][0]['properties']['confidence'])

    def test_publication_conflict_does_not_overwrite_or_leave_an_unpaired_export(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);staged=root/'staged';staged.write_text('new data');manifest=root/'manifest';manifest.write_text('new manifest')
            output=root/'places.geojson';existing=root/'places.manifest.json';existing.write_text('existing release')
            with self.assertRaises(FileExistsError):formats.publish_files([(staged,output),(manifest,existing)])
            self.assertFalse(output.exists());self.assertEqual(existing.read_text(),'existing release')
            output.write_text('existing output')
            with self.assertRaises(FileExistsError):formats.publish_files([(staged,output)])
            self.assertEqual(output.read_text(),'existing output')

    def test_invalid_format_is_rejected_before_duckdb_or_network_access(self):
        for args in [['--format','geojson','--output','bad.geojsonl'],['--output','bad.txt']]:
            with self.assertRaises(SystemExit):export.main(['--bbox=28.9,40.9,29.1,41.1','--release','2026-10-21.0',*args])


if __name__=='__main__':unittest.main()
