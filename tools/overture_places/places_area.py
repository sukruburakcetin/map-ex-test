#!/usr/bin/env python3
"""Save a Places area, discover releases and prepare repeatable regional updates.

Downloads/preparation only; never publishes services or changes a running service.
"""
import argparse
import datetime as dt
import hashlib
import html
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
import uuid

sys.path.insert(0,str(Path(__file__).resolve().parent))
from export_common import parse_bbox
from places_geojson import portal_feature, publish_files, write_features
from places_releases import available_releases, pinned_release, release_key

SCHEMA='mapillary-places-area-v1'
MAX_SOURCE_BYTES=128*1024*1024


def utc():return dt.datetime.now(dt.timezone.utc).isoformat()


def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):h.update(block)
    return h.hexdigest()


def read_json(path,limit=65536):
    path=Path(path)
    if path.stat().st_size>limit:raise ValueError('JSON file exceeds the supported size')
    return json.loads(path.read_text(encoding='utf-8-sig'))


def validate_profile(value):
    fields={'schema','name','bbox','source','release','output_directory','max_features'}
    if not isinstance(value,dict) or set(value)!=fields or value.get('schema')!=SCHEMA:raise ValueError('Use a mapillary-places-area-v1 profile')
    name=value['name']
    if not isinstance(name,str) or not name.strip() or len(name)>80:raise ValueError('Area name must contain 1..80 characters')
    bbox=value['bbox']
    if not isinstance(bbox,list) or len(bbox)!=4 or any(type(n) not in (int,float) or not math.isfinite(n) for n in bbox):raise ValueError('Invalid area rectangle')
    try:bbox=list(parse_bbox(','.join(map(str,bbox))))
    except argparse.ArgumentTypeError as error:raise ValueError(str(error)) from error
    if value['source'] not in ('portal','external'):raise ValueError('Choose portal or external data preparation')
    if value['release']!='latest':pinned_release(value['release'])
    if type(value['max_features']) is not int or not 1<=value['max_features']<=100000:raise ValueError('max_features must be 1..100000')
    directory=value['output_directory']
    if not isinstance(directory,str) or not directory or len(directory)>180 or '\\' in directory or ':' in directory or directory.startswith('/') or any(p in ('.','..','') for p in directory.split('/')):raise ValueError('output_directory must be a portable relative folder without .. or drive letters')
    return {**value,'name':name.strip(),'bbox':bbox}


def load_profile(file):
    file=Path(file).resolve();profile=validate_profile(read_json(file));root=(file.parent/profile['output_directory']).resolve()
    if not root.is_relative_to(file.parent):raise ValueError('Area output folder must stay beside its profile')
    return file,profile,root


def save_json_exclusive(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.places-json-',dir=path.parent) as folder:
        staged=Path(folder)/'value.json';staged.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
        publish_files([(staged,path)])


def boundary_bbox(path):
    value=read_json(path,4*1024*1024)
    if not isinstance(value,dict):raise ValueError('Expected a GeoJSON boundary object')
    if value.get('type')=='FeatureCollection':
        features=value.get('features',[])
        if not isinstance(features,list) or len(features)!=1:raise ValueError('Export one rectangle or boundary feature')
        value=features[0]
    if value.get('type')=='Feature':value=value.get('geometry',{})
    if value.get('type') not in ('Polygon','MultiPolygon'):raise ValueError('Use a WGS84 GeoJSON Polygon or MultiPolygon boundary')
    polygons=[value.get('coordinates')] if value['type']=='Polygon' else value.get('coordinates')
    points=[]
    if not isinstance(polygons,list) or not polygons:raise ValueError('Empty boundary')
    for polygon in polygons:
        if not isinstance(polygon,list) or not polygon:raise ValueError('Invalid polygon boundary')
        for ring in polygon:
            if not isinstance(ring,list) or len(ring)<4 or ring[0]!=ring[-1]:raise ValueError('Boundary rings must be closed')
            previous=None
            for point in ring:
                if not isinstance(point,list) or len(point)<2 or any(type(n) not in (int,float) or not math.isfinite(n) for n in point[:2]):raise ValueError('Invalid boundary coordinate')
                x,y=point[:2]
                if not -180<=x<=180 or not -85.051129<=y<=85.051129:raise ValueError('Boundary coordinates must be WGS84')
                if previous is not None and abs(x-previous)>180:raise ValueError('Split boundaries crossing the date line')
                points.append((x,y));previous=x
                if len(points)>50000:raise ValueError('Simplify the boundary below 50,000 vertices')
    return [min(p[0] for p in points),min(p[1] for p in points),max(p[0] for p in points),max(p[1] for p in points)]


def init_profile(path,name,bbox,source='portal',release='latest',max_features=25000):
    import unicodedata
    slug=re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower()).strip('-')[:60] or 'places-area'
    profile=validate_profile({'schema':SCHEMA,'name':name,'bbox':list(bbox),'source':source,'release':release,'output_directory':'places-data/'+slug+'/'+source,'max_features':max_features})
    save_json_exclusive(path,profile);return profile


def source_records(path,expected_release=None):
    path=Path(path)
    if path.stat().st_size>MAX_SOURCE_BYTES:raise ValueError('Source snapshot exceeds 128 MiB')
    with path.open(encoding='utf-8-sig') as stream:
        if path.suffix=='.geojson':
            value=json.load(stream)
            if value.get('type')!='FeatureCollection':raise ValueError('Expected source FeatureCollection')
            features=value.get('features',[])
        else:features=(json.loads(line) for line in stream if line.strip())
        result={}
        for f in features:
            normalized=portal_feature(f);p=normalized['properties'];identifier=p['gers_id']
            if expected_release is not None and p.get('data_release')!=expected_release:raise ValueError('Source records do not match the pinned release')
            if identifier in result or len(result)>=100000:raise ValueError('Duplicate source ID or regional record limit exceeded')
            result[identifier]={'coordinates':normalized['geometry']['coordinates'][:2],'properties':{k:v for k,v in p.items() if k!='data_release'}}
    return result


def change_report(old,new,baseline,release):
    added=sorted(new.keys()-old.keys());removed=sorted(old.keys()-new.keys());changed=[];field_counts={}
    for identifier in sorted(old.keys()&new.keys()):
        a,b=old[identifier],new[identifier];fields=[]
        if a['coordinates']!=b['coordinates']:fields.append('location')
        for key in sorted(a['properties'].keys()|b['properties'].keys()):
            if a['properties'].get(key)!=b['properties'].get(key):fields.append(key)
        if fields:
            changed.append({'id':identifier,'fields':fields})
            for field in fields:field_counts[field]=field_counts.get(field,0)+1
    examples={kind:[{'id':i,'before':old.get(i),'after':new.get(i)} for i in ids[:100]] for kind,ids in [('added',added),('removed',removed),('changed',[p['id'] for p in changed])]}
    return {'schema':'mapillary-places-changes-v1','baseline_release':baseline,'release':release,'initial_snapshot':baseline is None,
        'summary':{'added':len(added),'removed':len(removed),'changed':len(changed),'unchanged':len(old.keys()&new.keys())-len(changed)},
        'changed_fields':field_counts,'added_ids':added,'removed_ids':removed,'changed_ids':changed,'examples':examples,'example_limit_per_kind':100}


def write_change_html(path,report,name):
    escape=lambda value:html.escape(str(value),quote=True)
    sections=[]
    changed_fields={p['id']:p['fields'] for p in report['changed_ids']}
    for kind,examples in report['examples'].items():
        rows=[]
        for sample in examples:
            before=sample['before'];after=sample['after'];old=before['properties'].get('place_name') if before else '';new=after['properties'].get('place_name') if after else ''
            rows.append('<tr><td>'+escape(sample['id'])+'</td><td>'+escape(old or '')+'</td><td>'+escape(new or '')+'</td><td>'+escape(', '.join(changed_fields.get(sample['id'],[])))+'</td></tr>')
        sections.append('<details><summary>'+escape(kind.title())+' examples (up to 100)</summary><table><thead><tr><th>ID</th><th>Before</th><th>After</th><th>Changed fields</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></details>')
    title=escape(name+' · '+report['release'])
    text='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+title+'</title><style>body{font:16px system-ui;max-width:1000px;margin:24px auto;padding:16px;background:#142d23;color:#e7f2e8}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #496455;text-align:left;overflow-wrap:anywhere}details{margin:16px 0}a{color:#a7e3bf}</style><h1>'+title+'</h1><p>Prepared locally. Publishing and switching the experience remain separate steps.</p><p>Baseline: '+escape(report['baseline_release'] or 'First snapshot')+'</p><p>'+' · '.join(escape(k.title())+': '+str(v) for k,v in report['summary'].items())+'</p><p>Examples are limited to 100 per type. <a href="changes.json">All changed IDs and fields (JSON)</a></p>'+''.join(sections)
    Path(path).write_text(text,encoding='utf-8')


def prepared(root,release,profile):
    release=pinned_release(release);folder=(root/'releases'/release).resolve()
    if not folder.is_relative_to(root):raise ValueError('Release folder escapes the area folder')
    report=read_json(folder/'preparation.json')
    if report.get('schema')!='mapillary-places-prepared-v1' or report.get('release')!=release or report.get('area',{}).get('bbox')!=profile['bbox'] or report.get('source_mode')!=profile['source']:raise ValueError('Prepared snapshot does not match this area/source profile')
    source=report.get('source_file')
    if source not in ('places.geojson','places.geojsonl'):raise ValueError('Invalid prepared source filename')
    if digest(folder/source)!=report.get('source_sha256'):raise ValueError('Prepared source was modified; retain the original snapshot')
    if profile['source']=='external' and digest(folder/'places.sqlite')!=report.get('database_sha256'):raise ValueError('Prepared database was modified')
    return folder,report


def published_release(root):
    path=root/'published.json'
    return pinned_release(read_json(path)['release']) if path.exists() else None


def check(profile_file,catalog_file=None):
    _,profile,root=load_profile(profile_file);releases=available_releases(catalog_file);current=published_release(root)
    if current:prepared(root,current,profile)
    ready=sorted([p.name for p in (root/'releases').glob('*') if p.is_dir() and (p/'preparation.json').is_file() and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+',p.name)],key=release_key,reverse=True)
    return {'area':profile['name'],'published_release':current,'prepared_releases':ready,'latest_available':releases[0],'newer_than_published':current is None or release_key(releases[0])>release_key(current),'available_releases':releases}


def prepare(profile_file,release=None,*,catalog_file=None,input_parquet=None,compare_to=None,exporter=None,importer=None):
    _,profile,root=load_profile(profile_file);requested=release or profile['release'];selected=available_releases(catalog_file)[0] if requested=='latest' else pinned_release(requested)
    current=published_release(root)
    if requested=='latest' and current and release_key(selected)<release_key(current):raise ValueError('The catalog is older than the recorded publication; use an explicit dated release for a deliberate rollback')
    root.mkdir(parents=True,exist_ok=True);releases=root/'releases';releases.mkdir(exist_ok=True);target=releases/selected
    if target.exists():
        _,report=prepared(root,selected,profile)
        if compare_to and report.get('baseline_release')!=compare_to:raise ValueError('This immutable snapshot already has a different comparison baseline; keep its existing report')
        return {**report,'status':'already_prepared','already_prepared':True,'publication_recorded':published_release(root)==selected,'folder':str(target),'source_path':str(target/report['source_file']),'changes_report':str(target/'changes.html')}
    baseline=pinned_release(compare_to) if compare_to else published_release(root)
    if baseline is None:
        candidates=[p.name for p in releases.iterdir() if p.is_dir() and (p/'preparation.json').exists() and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+',p.name)]
        baseline=max(candidates,key=release_key) if candidates else None
    old={}
    if baseline:
        folder,report=prepared(root,baseline,profile);old=source_records(folder/report['source_file'],baseline)
    if exporter is None:
        from export_all_places import main as export_snapshot
        def exporter(arguments):
            # The exporter writes into staging. Only this wrapper knows the final
            # publication path, so suppress its standalone upload instruction.
            return export_snapshot(arguments,quiet=True)
    suffix='geojson' if profile['source']=='portal' else 'geojsonl'
    with tempfile.TemporaryDirectory(prefix='.places-refresh-',dir=root) as folder:
        stage=Path(folder);source=stage/('places.'+suffix)
        arguments=['--release',selected,'--bbox='+','.join(map(str,profile['bbox'])),'--output',str(source),'--max-features',str(profile['max_features'])]
        if input_parquet:arguments+=['--input-parquet',str(Path(input_parquet).resolve())]
        try:exporter(arguments)
        except ModuleNotFoundError as error:
            if error.name=='duckdb':raise ValueError('Install the downloader requirements: python -m pip install -r tools/overture_places/requirements.txt') from error
            raise
        records=source_records(source,selected)
        if not records:raise ValueError('The selected rectangle contains no places; choose another area')
        if any(not profile['bbox'][0]<=f['coordinates'][0]<=profile['bbox'][2] or not profile['bbox'][1]<=f['coordinates'][1]<=profile['bbox'][3] for f in records.values()):raise ValueError('Source records fall outside the saved rectangle')
        manifest=read_json(source.with_suffix('.manifest.json'))
        if manifest.get('release')!=selected or manifest.get('feature_count')!=len(records) or manifest.get('bbox')!=profile['bbox']:raise ValueError('Exporter manifest does not match the requested snapshot')
        report=change_report(old,records,baseline,selected);save_json_exclusive(stage/'changes.json',report);write_change_html(stage/'changes.html',report,profile['name'])
        if profile['source']=='external':
            if importer is None:
                from places_store import import_database as importer
            metadata=importer(source,stage/'places.sqlite')
            if metadata.get('count')!=len(records):raise ValueError('Prepared database count mismatch')
        result={'schema':'mapillary-places-prepared-v1','status':'prepared_not_published','release':selected,'prepared_utc':utc(),'area':{'name':profile['name'],'bbox':profile['bbox']},'source_mode':profile['source'],'source_file':source.name,'source_sha256':digest(source),'feature_count':len(records),'baseline_release':baseline,'changes':report['summary'],'database':'places.sqlite' if profile['source']=='external' else None,'database_sha256':digest(stage/'places.sqlite') if profile['source']=='external' else None}
        save_json_exclusive(stage/'preparation.json',result)
        target.mkdir()  # Exclusive release reservation; never replace an older release.
        pairs=[(p,target/p.name) for p in stage.iterdir() if p.name!='preparation.json']+[(stage/'preparation.json',target/'preparation.json')]
        try:publish_files(pairs)
        except Exception:
            try:target.rmdir()
            except OSError:pass
            raise
    return {**result,'folder':str(target),'source_path':str(target/result['source_file']),'changes_report':str(target/'changes.html')}


def adopt(profile_file,source_file,manifest_file,*,published=False):
    _,profile,root=load_profile(profile_file);manifest=read_json(manifest_file)
    if manifest.get('schema') not in ('overture-places-all-pilot-v1','overture-places-portal-v1'):raise ValueError('Use the original full-area export manifest')
    release=pinned_release(manifest.get('release'))
    records=source_records(source_file,release)
    if manifest.get('bbox')!=profile['bbox'] or manifest.get('feature_count')!=len(records):raise ValueError('Existing snapshot/manifest must match the exact saved rectangle and record count')
    if any(manifest.get(k) is not None for k in ('category_filter','confidence_filter','operating_status_filter')) or manifest.get('deduplication') is True:raise ValueError('Adopt a complete unfiltered snapshot')
    if (root/'releases'/release).exists():
        existing_folder,existing=prepared(root,release,profile)
        if source_records(existing_folder/existing['source_file'],release)!=records:raise ValueError('This release already contains a different snapshot; nothing was replaced')
    def local_export(arguments):
        args=argparse.Namespace()
        parser=argparse.ArgumentParser();parser.add_argument('--output');parser.add_argument('--max-features',type=int);parser.add_argument('--release');parser.add_argument('--bbox');args=parser.parse_args(arguments)
        output=Path(args.output)
        features=({'type':'Feature','geometry':{'type':'Point','coordinates':value['coordinates']},'properties':{**value['properties'],'data_release':release}} for value in records.values())
        write_features(features,output,args.max_features,output.suffix[1:])
        output.with_suffix('.manifest.json').write_text(json.dumps({**manifest,'schema':'overture-places-all-pilot-v1' if output.suffix=='.geojsonl' else 'overture-places-portal-v1','format':output.suffix[1:],'adopted_local_snapshot':True}),encoding='utf-8')
    result=prepare(profile_file,release,exporter=local_export)
    if published:result={**result,'status':'registered_existing_publication','publication':mark_published(profile_file,release,existing_deployment=True)}
    return result


def mark_published(profile_file,release,*,existing_deployment=False):
    _,profile,root=load_profile(profile_file);_,report=prepared(root,release,profile)
    if profile['source']=='portal' and not existing_deployment:
        valid=False
        for marker in (root/'releases'/release).glob('*/portal-preparation.json'):
            package=read_json(marker)
            if package.get('release')==release and package.get('feature_count')==report['feature_count'] and package.get('package')=='places-portal-overview.vtpk' and digest(marker.parent/package['package'])==package.get('package_sha256'):valid=True;break
        if not valid:raise ValueError('Build the matching Portal package before recording publication')
    previous=published_release(root);record={'schema':'mapillary-places-publication-v1','release':release,'previous_release':previous,'recorded_utc':utc(),'declared_by_administrator':True,'existing_deployment':existing_deployment}
    history=root/'publications';history.mkdir(exist_ok=True)
    save_json_exclusive(history/(dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S')+'-'+uuid.uuid4().hex[:8]+'.json'),record)
    with tempfile.TemporaryDirectory(prefix='.places-state-',dir=root) as folder:
        temp=Path(folder)/'published.json';temp.write_text(json.dumps(record,indent=2),encoding='utf-8');os.replace(temp,root/'published.json')
    return record


def build_portal(profile_file,release,query_url,*,project='CURRENT',build_name='portal-build',builder=None,styler=None,clusterer=None):
    _,profile,root=load_profile(profile_file)
    if profile['source']!='portal':raise ValueError('Use a Portal area profile')
    folder,report=prepared(root,release,profile)
    if not re.fullmatch('[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}',build_name):raise ValueError('Use a simple build name without paths')
    output=folder/build_name
    if output.exists():raise ValueError('Build folder exists; use a new --build-name, such as portal-build-2')
    from restore_places_vtpk import query_layer_url
    if not query_layer_url(query_url):raise ValueError('Supply the new matching query-layer URL')
    if builder is None:
        import importlib
        for name in ('pro_places_package','style_places_vtpk','prepare_places_portal'):
            loaded=sys.modules.get(name)
            if loaded is not None:
                if Path(getattr(loaded,'__file__','')).resolve()!=Path(__file__).resolve().parent/(name+'.py'):raise ValueError('Places helpers are loaded from another tool folder; reopen the Pro Python session')
                importlib.reload(loaded)
        try:import arcpy
        except ImportError as error:raise ValueError('Run build-portal in ArcGIS Pro Python or its Python environment') from error
        from pro_places_package import build_portal_package as builder
    if styler is None:
        from style_places_vtpk import style_package as styler
    if clusterer is None:
        from prepare_places_portal import prepare as clusterer
    builder(folder/report['source_file'],output,query_url=query_url,project=project,fresh_output=False)
    styler(output/'places-portal.vtpk',output/'places-portal-icons.vtpk')
    clusterer(output/'places-portal-icons.vtpk',output/'places-package-source.geojson',output/'places-portal-overview.vtpk')
    result={'schema':'mapillary-places-portal-preparation-v1','release':release,'feature_count':report['feature_count'],'package':'places-portal-overview.vtpk','package_sha256':digest(output/'places-portal-overview.vtpk'),'portal_publishing_tested':False}
    save_json_exclusive(output/'portal-preparation.json',result);return {**result,'folder':str(output)}


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__);commands=parser.add_subparsers(dest='command',required=True)
    init=commands.add_parser('init',help='Save an area profile from a rectangle or a GeoJSON boundary')
    init.add_argument('--profile',required=True);init.add_argument('--name',required=True);geometry=init.add_mutually_exclusive_group(required=True)
    geometry.add_argument('--bbox',type=parse_bbox);geometry.add_argument('--boundary',type=Path);geometry.add_argument('--manifest',type=Path);init.add_argument('--source',choices=['portal','external'],default='portal');init.add_argument('--release',default='latest');init.add_argument('--max-features',type=int,default=25000)
    adoption=commands.add_parser('adopt',help='Register an existing complete snapshot as the refresh baseline')
    adoption.add_argument('--profile',required=True);adoption.add_argument('--input',required=True);adoption.add_argument('--manifest',required=True);adoption.add_argument('--published',action='store_true',help='Record that this exact snapshot is already deployed; no service is changed')
    releases=commands.add_parser('releases',help='List official available releases');releases.add_argument('--catalog',type=Path)
    checker=commands.add_parser('check',help='Compare official releases with locally recorded publication');checker.add_argument('--profile',required=True);checker.add_argument('--catalog',type=Path)
    download=commands.add_parser('prepare',aliases=['refresh'],help='Download the saved area and prepare a versioned snapshot/change report')
    download.add_argument('--profile',required=True);download.add_argument('--release');download.add_argument('--catalog',type=Path);download.add_argument('--input-parquet',type=Path);download.add_argument('--compare-to')
    portal=commands.add_parser('build-portal',help='Pro: build, restore, style and prepare the full Portal package')
    portal.add_argument('--profile',required=True);portal.add_argument('--release',required=True);portal.add_argument('--query-url',required=True);portal.add_argument('--project',default='CURRENT');portal.add_argument('--build-name',default='portal-build')
    publish=commands.add_parser('mark-published',help='Record your completed publication locally; does not publish anything');publish.add_argument('--profile',required=True);publish.add_argument('--release',required=True)
    args=parser.parse_args(argv)
    if args.command=='init':result=init_profile(args.profile,args.name,args.bbox if args.bbox else boundary_bbox(args.boundary) if args.boundary else read_json(args.manifest)['bbox'],args.source,args.release,args.max_features)
    elif args.command=='adopt':result=adopt(args.profile,args.input,args.manifest,published=args.published)
    elif args.command=='releases':result={'available_releases':available_releases(args.catalog)}
    elif args.command=='check':result=check(args.profile,args.catalog)
    elif args.command in ('prepare','refresh'):result=prepare(args.profile,args.release,catalog_file=args.catalog,input_parquet=args.input_parquet,compare_to=args.compare_to)
    elif args.command=='build-portal':result=build_portal(args.profile,args.release,args.query_url,project=args.project,build_name=args.build_name)
    else:result=mark_published(args.profile,args.release)
    print(json.dumps(result,ensure_ascii=False,indent=2));return result


if __name__=='__main__':
    try:main()
    except Exception as error:
        print('Places area: '+str(error),file=sys.stderr);sys.exit(1)
