"""Restoration format, identity, preservation and publication regression checks."""
import gzip
import hashlib
import json
import math
import runpy
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools/overture_places'))
import restore_places_vtpk as repair
from inspect_places_vtpk import _bundle_tiles, _fields, tile_properties
import pro_places_package as pro


def record(identifier='a',lon=29.,**properties):
    return {'type':'Feature','geometry':{'type':'Point','coordinates':[lon,41.]},'properties':{
        'gers_id':identifier,'place_name':'Café İstanbul '+identifier,'category':'cafe','icon_group':'cafe',
        'confidence':.75,'operating_status':'open','address':None,'website':'https://example.org/','data_release':'2026-10-21.0',**properties}}


def varint(n):
    out=bytearray()
    while n>127:out.append((n&127)|128);n>>=7
    out.append(n);return bytes(out)


def field(n,value):
    return varint(n*8)+varint(value) if isinstance(value,int) else varint(n*8+2)+varint(len(value))+value


def fixture_package(path,records,*,extra=None,kind=1,multipoint=False,standard=False,scheme_cols=512,native_ids=True,native_attributes=None):
    z,extent=15,4096;n=2**z
    def project(f):
        lon,lat=f['geometry']['coordinates'];return (lon+180)/360*n*extent,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n*extent
    x0,y0=project(records[0]);col,row=math.floor(x0/extent),math.floor(y0/extent)
    groups=sorted({repair.portal_feature(f)['properties']['icon_group'] for f in records})
    features=[];keys=[];values=[]
    for i,f in enumerate(records):
        p=f['properties'];x,y=project(f);x,y=math.floor(x-col*extent),math.floor(y-row*extent)
        props={'_symbol':groups.index(repair.portal_feature(f)['properties']['icon_group']),'_name':p['place_name'] or '',**(extra or {}),**((native_attributes or [{} for _ in records])[i])}
        tags=[]
        for key,value in props.items():
            if key not in keys:keys.append(key)
            encoded=field(1,value.encode()) if isinstance(value,str) else field(7,int(value)) if type(value)is bool else field(5,value) if type(value)is int else b'\x19'+struct.pack('<d',value)
            tags.extend([keys.index(key),len(values)]);values.append(encoded)
        zig=lambda v:(v<<1)^(v>>31)
        geometry=varint(17 if multipoint else 9)+varint(zig(x))+varint(zig(y))+(varint(2)+varint(2) if multipoint else b'')
        features.append((field(1,i+1) if native_ids else b'')+field(2,b''.join(varint(t) for t in tags))+field(3,kind)+field(4,geometry))
    layer=field(15,2)+field(1,b'places')+b''.join(field(2,f) for f in features)
    layer+=b''.join(field(3,k.encode()) for k in keys)+b''.join(field(4,v) for v in values)+field(5,extent)
    tile=gzip.compress(field(3,layer),mtime=0);start=64+131072
    header=struct.pack('<4I3Q6I',3,16384 if standard else 1,len(tile) if standard else max(131092,len(tile)),5,0,start+4+len(tile),40,131092,3,16 if standard else 0,16384,5,131072)
    index=bytearray(131072);slot=(row%128)*128+col%128
    struct.pack_into('<Q',index,slot*8,(len(tile)<<40)|(start+4))
    style={'version':8,'sources':{'esri':{'url':'../../'}},'layers':[
        {'id':'places/'+g,'type':'circle','source':'esri','source-layer':'places','filter':['==','_symbol',i]} for i,g in enumerate(groups)]}
    style['layers'].append({'id':'names','type':'symbol','source':'esri','source-layer':'places','layout':{'text-field':'{_name}'}})
    cache={'tileInfo':{'rows':512,'cols':scheme_cols,'spatialReference':{'wkid':3857},'origin':{'x':-20037508.342789244,'y':20037508.342789244},'lods':[{'level':z,'resolution':78271.51696402048/2**z}]},'maxLOD':15,'resourceInfo':{'cacheInfo':{'storageInfo':{'storageFormat':'compactV2','packetSize':128}}}}
    with zipfile.ZipFile(path,'w') as archive:
        archive.comment=b'Native package comment'
        archive.writestr('p12/root.json',json.dumps(cache))
        archive.writestr('p12/resources/styles/root.json',json.dumps(style))
        archive.writestr('p12/resources/sprites/sprite.png',b'unchanged sprite fixture')
        archive.writestr('p12/resources/fonts/Arial/0-255.pbf',b'unchanged glyph fixture')
        archive.writestr(f'p12/tile/L{z:02d}/R{row//128*128:04x}C{col//128*128:04x}.bundle',header+index+struct.pack('<I',len(tile))+tile)


def read_tiles(path):
    result={}
    with zipfile.ZipFile(path) as archive:
        for member in archive.infolist():
            if member.filename.endswith('.bundle'):
                for slot,payload in _bundle_tiles(archive,member,16384):result[(member.filename,slot)]=payload
    return result


def geometry(payload):
    data=gzip.decompress(payload);out=[]
    for n,w,v in _fields(data):
        if n==3 and w==2:
            for fn,fw,fv in _fields(v):
                if fn==2 and fw==2:out.append([(n,w,v) for n,w,v in _fields(fv) if n!=2])
    return out


class RestorationTest(unittest.TestCase):
    def setup_case(self,folder,records,**kwargs):
        root=Path(folder);source=root/'source.geojson';package=root/'native.vtpk';output=root/'restored.vtpk'
        source.write_text(json.dumps({'type':'FeatureCollection','features':records},ensure_ascii=False),encoding='utf-8')
        fixture_package(package,records,**kwargs)
        return source,package,output

    def test_roundtrip_preserves_geometry_assets_ids_null_scores_status_unicode_and_metadata(self):
        records=[record(),record('b',29.001,confidence=None,operating_status=None),record('c',29.002,confidence=0.,operating_status='permanently_closed')]
        for standard in [False,True]:
            with self.subTest(standard=standard),tempfile.TemporaryDirectory() as folder:
                source,native,output=self.setup_case(folder,records,standard=standard)
                original=native.read_bytes();source_bytes=source.read_bytes()
                report=repair.restore_package(native,source,output,query_url='https://portal.example/FeatureServer/0')
                self.assertEqual(report['uniquePlacesRestored'],3);self.assertTrue(report['completeSourceCoverageVerified']);self.assertTrue(report['geometryPreserved']);self.assertFalse(report['portalPublishingTested'])
                before,after=read_tiles(native),read_tiles(output);self.assertEqual(set(before),set(after))
                for tile,payload in after.items():
                    self.assertEqual(geometry(before[tile]),geometry(payload))
                    props=[p for _,p in tile_properties(payload)]
                    for p,r in zip(props,records):
                        for key in repair.PLACE_FIELDS:self.assertEqual(p.get(key),r['properties'][key])
                        self.assertEqual(p['_name'],r['properties']['place_name'])
                    self.assertNotIn('confidence',props[1]);self.assertEqual(props[2]['confidence'],0.)
                with zipfile.ZipFile(native) as a,zipfile.ZipFile(output) as b:
                    self.assertEqual(a.comment,b.comment)
                    for name in a.namelist():
                        if not name.endswith('.bundle') and name!='p12/resources/styles/root.json':self.assertEqual(a.read(name),b.read(name))
                    contract=json.loads(b.read('p12/resources/styles/root.json'))['metadata']['mly:places']
                    self.assertEqual(contract['sourceFeatureCount'],3);self.assertEqual(contract['queryUrl'],'https://portal.example/FeatureServer/0')
                self.assertEqual(native.read_bytes(),original);self.assertEqual(source.read_bytes(),source_bytes)
                second=Path(folder)/'second.vtpk';repair.restore_package(output,source,second,query_url='https://portal.example/FeatureServer/0')
                self.assertEqual(read_tiles(output),read_tiles(second))
                self.assertNotIn('Café',output.with_suffix('.restoration.json').read_text())
                self.assertNotIn('portal.example',output.with_suffix('.restoration.json').read_text())

    def test_local_and_central_zip_metadata_are_preserved_separately(self):
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,[record()])
            # Native Pro stores NTFS timestamps centrally, not in local headers.
            # Create a deterministic specimen with distinct valid local/central extras.
            central=struct.pack('<HH',0x000a,4)+b'\x00'*4
            copy_path=Path(folder)/'native-layout.vtpk'
            with zipfile.ZipFile(native) as original,zipfile.ZipFile(copy_path,'w') as rewritten:
                rewritten.comment=original.comment
                for member in original.infolist():
                    member.extra=b''
                    rewritten.writestr(member,original.read(member))
                    member.extra=central
            native=copy_path
            with zipfile.ZipFile(native) as z:
                extras=repair._local_zip_extra_fields(native,z.infolist())
                self.assertTrue(all(v==b'' for v in extras.values()))
                self.assertTrue(all(m.extra==central for m in z.infolist()))
            repair.restore_package(native,source,output)
            with zipfile.ZipFile(output) as z:
                self.assertEqual(repair._local_zip_extra_fields(output,z.infolist()),extras)
                self.assertTrue(all(m.extra==central for m in z.infolist()))
            # Control: without edits, the production member writer must reproduce
            # the same native container byte-for-byte, not merely readable ZIP data.
            untouched=Path(folder)/'untouched-copy.vtpk'
            with zipfile.ZipFile(native) as z,zipfile.ZipFile(untouched,'w') as out:
                out.comment=z.comment
                for member in z.infolist():repair._write_native_zip_member(z,out,member,extras[member.filename])
            self.assertEqual(native.read_bytes(),untouched.read_bytes())

    def test_growing_tiles_update_the_bundle_maximum_record_size(self):
        # Many unique source strings compress poorly enough to cross the Pro
        # index-record floor, while original renderer-only tiles stay small.
        records=[]
        for i in range(800):
            text=''.join(hashlib.sha256(f'{i}:{j}'.encode()).hexdigest() for j in range(10))
            records.append(record(str(i),29.+i*.000003,address=text))
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,records)
            repair.restore_package(native,source,output)
            with zipfile.ZipFile(output) as archive:
                member=next(m for m in archive.infolist() if m.filename.endswith('.bundle'))
                with archive.open(member) as stream:header=stream.read(64)
                sizes=[len(payload) for _,payload in _bundle_tiles(archive,member,16384)]
                self.assertGreater(max(sizes),131092)
                self.assertGreaterEqual(struct.unpack_from('<I',header,8)[0],max(sizes))
                # The stricter reader must reject an otherwise intact cache with
                # the old stale maximum-size value.
                broken=bytearray(archive.read(member));struct.pack_into('<I',broken,8,131092)
            broken_path=Path(folder)/'stale-maximum.vtpk'
            with zipfile.ZipFile(broken_path,'w') as archive:archive.writestr(member.filename,broken)
            with zipfile.ZipFile(broken_path) as archive:
                with self.assertRaisesRegex(ValueError,'declared maximum record size'):
                    list(_bundle_tiles(archive,archive.getinfo(member.filename),16384))

    def test_ambiguous_unmatched_and_missing_source_ids_fail_without_outputs(self):
        for mode in ['ambiguous','unmatched','missing']:
            with self.subTest(mode=mode),tempfile.TemporaryDirectory() as folder:
                source,native,output=self.setup_case(folder,[record()])
                data=[record()]
                if mode=='ambiguous':data.append(record('b',place_name=record()['properties']['place_name']))
                elif mode=='unmatched':data[0]['properties']['place_name']='Different name'
                else:data.append(record('b',29.01))
                source.write_text(json.dumps({'type':'FeatureCollection','features':data}))
                with self.assertRaisesRegex(repair.RestorationError,'Ambiguous|Coincident|no exact|absent'):repair.restore_package(native,source,output)
                self.assertFalse(output.exists());self.assertFalse(output.with_suffix('.restoration.json').exists());self.assertFalse(list(Path(folder).glob('.places-restore-*')))

    def test_conflicting_existing_attributes_unsupported_geometry_and_scheme_fail_closed(self):
        for options in [{'extra':{'gers_id':'wrong'}},{'extra':{'confidence':False}},{'kind':2},{'multipoint':True},{'scheme_cols':256}]:
            with self.subTest(options=options),tempfile.TemporaryDirectory() as folder:
                source,native,output=self.setup_case(folder,[record(confidence=0.)],**options)
                with self.assertRaises((repair.RestorationError,ValueError)):repair.restore_package(native,source,output)
                self.assertFalse(output.exists())

    def test_distinct_colocated_places_with_distinct_names_keep_their_ids(self):
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,[record(),record('b',confidence=.1)])
            result=repair.restore_package(native,source,output)
            self.assertEqual(result['uniquePlacesRestored'],2)

    def test_identical_coincident_records_are_restored_as_complete_distinct_objects(self):
        records=[record('z',confidence=.1,operating_status='open'),record('a',place_name='Café İstanbul z',confidence=.9,operating_status='permanently_closed')]
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,records,native_ids=False)
            report=repair.restore_package(native,source,output)
            self.assertEqual(report['uniquePlacesRestored'],2)
            self.assertEqual(report['coincidentGroupsRestored'],1)
            self.assertEqual(report['coincidentFeatureInstancesRestored'],2)
            self.assertEqual(report['distinctCoincidentPlacesRestored'],2)
            self.assertEqual(report['geometryCommandsSha256'],report['originalGeometryCommandsSha256'])
            before,after=read_tiles(native),read_tiles(output)
            for key,payload in after.items():
                self.assertEqual(geometry(before[key]),geometry(payload))
                rows=[p for _,p in tile_properties(payload)]
                self.assertEqual(len(rows),2)
                wanted={f['properties']['gers_id']:f['properties'] for f in records}
                for row in rows:
                    for field in repair.PLACE_FIELDS:self.assertEqual(row.get(field),wanted[row['gers_id']][field])
            second=Path(folder)/'repeated.vtpk';repair.restore_package(output,source,second)
            self.assertEqual(read_tiles(output),read_tiles(second))

    def test_coincident_cases_with_native_ids_metadata_differences_or_wrong_counts_are_refused(self):
        records=[record(),record('b',place_name=record()['properties']['place_name'])]
        for options in [{},{'native_ids':False,'native_attributes':[{'_extra':1},{'_extra':2}]}]:
            with self.subTest(options=options),tempfile.TemporaryDirectory() as folder:
                source,native,output=self.setup_case(folder,records,**options)
                with self.assertRaisesRegex(repair.RestorationError,'Coincident'):repair.restore_package(native,source,output)
                self.assertFalse(output.exists())
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,records[:1],native_ids=False)
            source.write_text(json.dumps({'type':'FeatureCollection','features':records}))
            with self.assertRaisesRegex(repair.RestorationError,'record counts differ'):repair.restore_package(native,source,output)
            self.assertFalse(output.exists())

    def test_distinct_nearby_positions_are_not_resolved_by_nearest_distance(self):
        records=[record(),record('b',29.0000001,place_name=record()['properties']['place_name'])]
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,records,native_ids=False)
            with self.assertRaisesRegex(repair.RestorationError,'distinct source positions'):repair.restore_package(native,source,output)
            self.assertFalse(output.exists())

    def test_projection_rounding_allowance_is_metre_bounded_and_does_not_admit_larger_errors(self):
        records=[record()];index=repair.SourceIndex(records);extent,z=4096,15
        nx,ny,_=index.projected[0];x=nx*2**z*extent;y=ny*2**z*extent
        extra=repair.PROJECTED_ROUNDING_METERS*2**z*extent/repair.WEB_MERCATOR_WORLD_METERS
        name=records[0]['properties']['place_name']
        self.assertEqual(index.match(name,'cafe',z,extent,x-1-extra*.5,y)['gers_id'],'a')
        with self.assertRaisesRegex(repair.RestorationError,'no exact'):index.match(name,'cafe',z,extent,x-1-extra*2,y)

    def test_null_names_and_unknown_categories_remain_valid(self):
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,[record(place_name=None,category=None,icon_group='other')])
            repair.restore_package(native,source,output)
            attrs=list(tile_properties(next(iter(read_tiles(output).values()))))[0][1]
            self.assertNotIn('place_name',attrs);self.assertEqual(attrs['icon_group'],'other')

    def test_source_validation_urls_and_existing_outputs_make_no_changes(self):
        for value in ['http://example.org/FeatureServer/0','https://u:p@example.org/FeatureServer/0','https://example.org/FeatureServer/0?token=secret','https://example.org/FeatureServer']:
            with self.subTest(value=value),self.assertRaises(ValueError):repair.query_layer_url(value)
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,[record()]);output.write_bytes(b'keep')
            with self.assertRaises(ValueError):repair.restore_package(native,source,output)
            self.assertEqual(output.read_bytes(),b'keep')
            output.unlink();source.write_text(json.dumps({'type':'FeatureCollection','features':[record(data_release=None)]}))
            with self.assertRaisesRegex(ValueError,'pinned'):repair.restore_package(native,source,output)
            self.assertFalse(output.exists())

    def test_late_publication_conflict_restores_the_absent_output_and_preserves_report(self):
        with tempfile.TemporaryDirectory() as folder:
            source,native,output=self.setup_case(folder,[record()]);report=output.with_suffix('.restoration.json');publish=repair.publish_files
            def raced(pairs):
                report.write_text('concurrent report');return publish(pairs)
            with patch.object(repair,'publish_files',side_effect=raced),self.assertRaises(FileExistsError):repair.restore_package(native,source,output)
            self.assertFalse(output.exists());self.assertEqual(report.read_text(),'concurrent report')

    def test_pro_runpy_refreshes_its_cached_inspector_and_restoration_helpers(self):
        import inspect_places_vtpk as inspector
        old=inspector.inspect_package
        try:
            sentinel=lambda *args,**kwargs:None
            inspector.inspect_package=sentinel
            namespace=runpy.run_path(str(ROOT/'tools/overture_places/pro_places_package.py'))
            self.assertIsNot(inspector.inspect_package,sentinel)
            self.assertIs(namespace['inspect_package'],inspector.inspect_package)
            self.assertTrue(callable(namespace['build_portal_package']))
        finally:
            inspector.inspect_package=old

    def test_full_build_entry_uses_full_native_source_then_restores_without_publication(self):
        with tempfile.TemporaryDirectory() as folder:
            source,native,_=self.setup_case(folder,[record(),record('b',29.001)])
            root=Path(folder);(root/'places-native.vtpk').write_bytes(native.read_bytes());(root/'places-package-source.geojson').write_bytes(source.read_bytes())
            with patch.object(pro,'_build_native',return_value=({},root)) as build:
                result=pro.build_portal_package(source,root,query_url='https://portal.example/FeatureServer/0')
            self.assertTrue(build.call_args.kwargs['full_dataset']);self.assertEqual(result['uniquePlacesRestored'],2)
            self.assertTrue((root/'places-portal.vtpk').is_file());self.assertFalse(result['portalPublishingTested'])


if __name__=='__main__':unittest.main()
