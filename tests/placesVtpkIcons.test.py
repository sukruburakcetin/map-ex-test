"""Category sprite contract and refusal checks."""
from copy import deepcopy
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/overture_places'))
from style_places_vtpk import category_style, RestorationError
from places_sprite import make_sprite

class Icons(unittest.TestCase):
    def fixture(self):
        return {'version':8,'sprite':'../sprites/sprite','metadata':{'mly:places':{'version':1,'sourceLayers':['places'],'queryUrl':'https://example.com/FeatureServer/0'}},'layers':[
            {'id':'places/cafe','type':'circle','source':'esri','source-layer':'places','filter':['==','_symbol',4],'minzoom':14,'paint':{'circle-radius':2}},
            {'id':'labels','type':'symbol','source':'esri','source-layer':'places','layout':{'text-field':'{_name}'}}]}
    def test_icons_resolve_at_both_pixel_ratios_without_changing_filters_labels_or_pairing(self):
        source=self.fixture();original=deepcopy(source);result,count=category_style(source)
        self.assertEqual(source,original);self.assertEqual(count,1)
        self.assertEqual(result['layers'][0]['filter'],source['layers'][0]['filter'])
        self.assertEqual(result['layers'][1],source['layers'][1]);self.assertEqual(result['metadata'],source['metadata'])
        for scale in (1,2):
            png,metadata=make_sprite(scale)
            self.assertTrue(png.startswith(b'\x89PNG'));self.assertIn(result['layers'][0]['layout']['icon-image'],metadata)
            self.assertEqual(metadata['cafe']['pixelRatio'],scale)
    def test_refuse_unsupported_and_repeated_styles(self):
        for mutate in (lambda s:s.update(sprite='https://example.com/sprite'),lambda s:s['metadata'].clear(),lambda s:s['layers'][0].update(id='places/unknown')):
            source=self.fixture();mutate(source)
            with self.assertRaises(RestorationError):category_style(source)
        result,_=category_style(self.fixture())
        with self.assertRaises(RestorationError):category_style(result)

if __name__=='__main__':unittest.main()
