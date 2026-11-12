"""Exact histogram/filter aggregation and point ownership regression checks."""
from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/overture_places'))
from prepare_places_portal import count_properties,cluster_layer,tile_index,new_bundle
from inspect_places_vtpk import tile_properties


def record(group,score,closed=False):
    return {'properties':{'icon_group':group,'confidence':score,'operating_status':'permanently_closed' if closed else None}}


class Clusters(unittest.TestCase):
    def test_exact_confidence_and_open_histograms(self):
        scores=[i/10000 for i in range(100)]
        records=[record('cafe' if i%2 else 'shop',score,i%3==0) for i,score in enumerate(scores)]+[record('cafe',None)]
        props=count_properties(records,{v:i for i,v in enumerate(scores)})
        for minimum in [None,0,.00011,.0032,.00321,.0099,1]:
            for family in ['all','cafe','shop','health']:
                for hide in [False,True]:
                    expected=sum((family=='all' or f['properties']['icon_group']==family) and
                        (minimum is None or f['properties']['confidence'] is not None and f['properties']['confidence']>=minimum) and
                        (not hide or f['properties']['operating_status']!='permanently_closed') for f in records)
                    if minimum is None:keys=[('o_' if hide else 'n_')+family]
                    else:
                        start=next((i for i,s in enumerate(scores) if s>=minimum),len(scores));keys=[]
                        while start<len(scores) and start%32:
                            keys.append(('j_' if hide else 'h_')+family+'_'+str(start));start+=1
                        while start<len(scores):
                            keys.append(('q_' if hide else 'b_')+family+'_'+str(start//32));start+=32
                    self.assertEqual(sum(props.get(k,0) for k in keys),expected)
    def test_index_keeps_parent_data_available_past_native_cache_levels(self):
        index=tile_index([(2,1,1),(3,2,2)])['index']
        # The cached level-three tile is a leaf (1), so deeper requests reuse it.
        self.assertEqual(index[0][3][0],1)
    def test_binary_readback_retains_all_counts_and_grid_identity(self):
        points=[record('cafe',0),record('cafe',None),record('shop',.8,True)]
        rows=list(tile_properties(cluster_layer({(2,3):points},{0:0,.8:1},14,100,200)))
        self.assertEqual(len(rows),1);name,props=rows[0]
        self.assertEqual(name,'places_clusters');self.assertEqual(props['n_all'],3)
        self.assertEqual(props['o_all'],2);self.assertEqual(props['n_cafe'],2)
        self.assertEqual((props['tile_z'],props['tile_y'],props['tile_x'],props['cell_x'],props['cell_y']),(14,100,200,2,3))

if __name__=='__main__':unittest.main()
