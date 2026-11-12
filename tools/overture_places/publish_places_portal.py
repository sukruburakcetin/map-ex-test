#!/usr/bin/env python3
"""Optional publisher for a PREPARED Places release, using ArcGIS Pro sign-in.

Planning reads Portal/account metadata only. Publishing creates new private items;
it never overwrites/deletes services, edits experience configuration or records a
live app switch. No tokens/passwords are accepted or written to plans/reports.
"""
import argparse
from concurrent.futures import Future
import datetime as dt
import json
import math
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import time
import unicodedata
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote
import uuid

_TOOL_DIRECTORY=Path(__file__).resolve().parent
if str(_TOOL_DIRECTORY) not in sys.path:sys.path.insert(0,str(_TOOL_DIRECTORY))
from places_area import (load_profile, prepared, digest, read_json, save_json_exclusive,
                         source_records, build_portal, utc)
from places_releases import pinned_release
from inspect_places_vtpk import tile_properties, MAX_TILE_BYTES

FIELDS=('gers_id','place_name','category','icon_group','confidence','operating_status','address','website','data_release')
ID=re.compile(r'^[0-9a-f]{32}$',re.I)
RUN=re.compile(r'^\d{8}T\d{6}_[0-9a-f]{12}$')
NAME=re.compile(r'^[A-Za-z][A-Za-z0-9_]{0,110}$')
PRIVILEGES={'portal:user:createItem','portal:publisher:publishFeatures','portal:publisher:publishTiles'}


class PublishingError(ValueError):
    """Only fixed diagnostic text and safe stage/status values belong here."""


class CachePending(PublishingError):pass


def clean_url(value,kind=None):
    if not isinstance(value,str) or any(c.isspace() for c in value):raise PublishingError('Use a credential-free HTTPS Portal/service URL.')
    try:u=urlsplit(value)
    except ValueError:raise PublishingError('Invalid HTTPS Portal/service URL.') from None
    try:port=u.port
    except ValueError:raise PublishingError('Invalid HTTPS URL port.') from None
    if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment:raise PublishingError('Use a credential-free HTTPS Portal/service URL.')
    path=u.path.rstrip('/')
    if kind and kind!='resource' and not re.search({'query':r'/FeatureServer/\d+$','feature':r'/FeatureServer$','tiles':r'/VectorTileServer$'}[kind],path,re.I):raise PublishingError('The published item has an incompatible service URL.')
    if not kind and re.search(r'/(sharing|rest|home|apps)(/|$)|/(FeatureServer|VectorTileServer)(/|$)',path,re.I):raise PublishingError('Use the Portal root URL shown in Pro, not an item, app or service URL.')
    host=u.hostname.lower()
    if ':' in host:host='['+host+']'
    if port and port!=443:host+=':'+str(port)
    return urlunsplit(('https',host,path,'',''))


def _value(obj,key,default=None):
    # SDK Item/User subclass dict but hydrate through attribute access, not dict.get.
    return obj.get(key,default) if type(obj) is dict else getattr(obj,key,default)


def item_id(value):
    if not isinstance(value,str) or not ID.fullmatch(value):raise PublishingError('Portal returned an invalid item identifier.')
    return value


def _json_atomic(path,value):
    path=Path(path)
    with tempfile.TemporaryDirectory(prefix='.places-publish-state-',dir=path.parent) as folder:
        staged=Path(folder)/'state.json';staged.write_text(json.dumps(value,indent=2,ensure_ascii=False),encoding='utf-8');os.replace(staged,path)


def _service_names(area,release,run):
    slug=re.sub('[^a-z0-9]+','_',unicodedata.normalize('NFKD',area).encode('ascii','ignore').decode().lower()).strip('_')[:24] or 'area'
    base='mly_places_'+slug+'_'+release.replace('-','').replace('.','_')+'_'+run.rsplit('_',1)[1]
    return {'folder':base,'query':base+'_query','tiles':base+'_tiles','build':'pp_'+run.rsplit('_',1)[1]}


class ProPortal:
    """Supported ArcGIS Python API surface; SDK owns authentication and federation."""
    def __init__(self,portal_url):
        self.portal_url=clean_url(portal_url)
        try:
            import arcpy
            from arcgis.gis import GIS,ItemProperties,ItemTypeEnum,Folder,Item
        except ImportError:raise PublishingError('Use ArcGIS Pro Python with ArcGIS API for Python 2.4 or later. The manual workflow remains available.') from None
        self.arcpy=arcpy;self.ItemProperties=ItemProperties;self.ItemTypeEnum=ItemTypeEnum
        try:arcpy.mp.ArcGISProject('CURRENT')
        except Exception:raise PublishingError('Open a project in ArcGIS Pro and run this optional script from its Python window.') from None
        try:
            if clean_url(arcpy.GetActivePortalURL())!=self.portal_url:raise PublishingError('The requested Portal is not the active Portal in ArcGIS Pro. Switch/sign in to the intended Portal first.')
            self.gis=GIS('pro',verify_cert=True,set_active=False)
            if clean_url(self.gis.url)!=self.portal_url:raise PublishingError('The Pro GIS session does not match the requested Portal.')
            user=self.gis.users.me
            if user is None:raise PublishingError('Sign in to the intended Portal in ArcGIS Pro first.')
            self.username=str(user.username)
            if not self.username or len(self.username)>255 or any(ord(c)<32 for c in self.username):raise PublishingError('Portal returned an invalid account name.')
            privileges=_value(user,'privileges')
            if _value(user,'role')!='org_admin' and isinstance(privileges,(list,tuple)) and not PRIVILEGES.issubset(set(privileges)):raise PublishingError('The signed-in account needs item creation, hosted feature publishing and hosted tile publishing privileges.')
            self.permission_check='checked' if isinstance(privileges,(list,tuple)) or _value(user,'role')=='org_admin' else 'not_advertised'
            if not callable(getattr(self.gis.content.folders,'create',None)) or not callable(getattr(self.gis.session,'get',None)) or not callable(getattr(Folder,'add',None)) or not hasattr(Item,'sharing'):raise PublishingError('This optional publisher needs the ArcGIS Python API folders/session interfaces from version 2.4 or later.')
        except PublishingError:raise
        except Exception:raise PublishingError('Pro Portal connection failed. Check Pro sign-in, publishing permissions, network and certificate trust; no items were created.') from None
    def ensure_context(self):
        try:current=clean_url(self.arcpy.GetActivePortalURL())
        except Exception:raise PublishingError('The Pro Portal session is unavailable. Reopen/sign in to the intended Portal before retrying.') from None
        if current!=self.portal_url:raise PublishingError('The active Pro Portal changed. Publication stopped; keep the original session for this run.')
    def query_name_available(self,name):
        self.ensure_context()
        try:return self.gis.content.is_service_name_available(name,'featureService') is True
        except Exception:raise PublishingError('Portal service-name preflight failed; check publishing access and service availability.') from None
    def create_folder(self,name):
        self.ensure_context();return self.gis.content.folders.create(name,owner=self.username,exist_ok=False)
    def upload(self,folder,path,title,kind,release,on_id):
        self.ensure_context()
        properties=self.ItemProperties(title=title,item_type=self.ItemTypeEnum.GEOJSON if kind=='geojson' else self.ItemTypeEnum.VECTOR_TILE_PACKAGE,
            tags=['Overture Places','Mapillary Explorer',release],snippet='Prepared Places '+release,
            access_information='Overture Maps Foundation',license_info='https://docs.overturemaps.org/attribution/')
        job=folder.add(item_properties=properties,file=str(path),stream=True)
        pending=getattr(job,'itemid',None)
        if pending:on_id(pending)
        result=job.result() if callable(getattr(job,'result',None)) else job
        on_id(_value(result,'id'));return result
    def publish(self,item,name,kind):
        self.ensure_context()
        parameters={'name':name,'maxRecordCount':2000}
        if kind=='feature':parameters.update(hasStaticData=True,layerInfo={'capabilities':'Query'})
        job=item.publish(publish_parameters=parameters,overwrite=False,future=True,
                         output_type='VectorTiles' if kind=='tiles' else None,build_initial_cache=kind=='tiles')
        return job.result(timeout=1800) if isinstance(job,Future) else job
    def make_private(self,item):
        self.ensure_context()
        if str(_value(item,'owner','')).casefold()!=self.username.casefold():raise PublishingError('A returned item is not owned by the planned publishing account.')
        item.sharing.sharing_level='PRIVATE'
        shared=item.sharing.shared_with
        level=_value(shared['level'],'value',shared['level'])
        if str(level).upper()!='PRIVATE' or shared.get('groups') or str(_value(item,'access','')).lower()!='private':raise PublishingError('The new item could not be verified as private. Inspect Portal sharing before continuing.')
    def move(self,item,folder):
        self.ensure_context()
        result=item.move(folder)
        if not isinstance(result,dict) or result.get('success') is not True:raise PublishingError('The new service could not be moved into its publication folder.')
    def _read(self,url,params,limit):
        self.ensure_context();clean_url(url,'resource')
        # URLs are validated by the caller; never persist request/response objects.
        try:
            with self.gis.session.get(url,params=params,stream=True,timeout=(15,60)) as response:
                status=response.status_code
                if status>=500 or status in (404,429):raise CachePending('Published service is not ready yet.')
                if status>=400:raise PublishingError('Published service access failed. Check Pro sign-in and ownership.')
                chunks=[];size=0
                for chunk in response.iter_content(chunk_size=65536):
                    size+=len(chunk)
                    if size>limit:raise PublishingError('Published service response exceeded its validation budget.')
                    chunks.append(chunk)
                return b''.join(chunks)
        except PublishingError:raise
        except Exception:raise PublishingError('Published service request failed. Check Portal/service availability and certificate trust.') from None
    def read_json(self,url,params=None):
        raw=self._read(url,{'f':'json',**(params or {})},2*1024*1024)
        try:value=json.loads(raw)
        except (ValueError,UnicodeError):raise PublishingError('Published service returned invalid JSON.') from None
        if not isinstance(value,dict):raise PublishingError('Published service returned an invalid response.')
        if value.get('error'):
            code=value['error'].get('code')
            if code in (404,429,500,502,503,504):raise CachePending('Published service is still processing.')
            if code in (401,403,498,499):raise PublishingError('Published service authentication/access failed. Sign in to the same Portal with access to the new items.')
            raise PublishingError('Published service rejected the validation request.')
        return value
    def read_binary(self,url):return self._read(url,{},MAX_TILE_BYTES)


def _context(profile_file,release):
    profile_path,profile,root=load_profile(profile_file);release=pinned_release(release)
    if profile['source']!='portal':raise PublishingError('This optional script is only for Portal area profiles.')
    folder,report=prepared(root,release,profile)
    if report['source_file']!='places.geojson':raise PublishingError('Prepare the Portal GeoJSON snapshot first.')
    return profile_path,profile,folder,report


def _backend(portal_url,value):return value if value is not None else ProPortal(portal_url)


def _check_backend(backend,portal_url,owner=None):
    if clean_url(backend.portal_url)!=portal_url:raise PublishingError('The publishing session is connected to another Portal.')
    if owner is not None and backend.username.casefold()!=owner.casefold():raise PublishingError('Use the same Pro Portal account that created this plan.')
    backend.ensure_context()


def create_plan(profile_file,release,*,portal_url,_backend_instance=None):
    """Read-only Portal preflight; writes a local plan, never Portal content."""
    portal_url=clean_url(portal_url);profile_path,profile,folder,snapshot=_context(profile_file,release)
    backend=_backend(portal_url,_backend_instance);_check_backend(backend,portal_url)
    run=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S')+'_'+uuid.uuid4().hex[:12]
    names=_service_names(profile['name'],release,run)
    try:available=backend.query_name_available(names['query'])
    except Exception:raise PublishingError('Portal service-name preflight failed; no content was created.') from None
    if not available:raise PublishingError('The planned query name is already in use. Create a fresh plan.')
    directory=folder/'publishing'/run;directory.mkdir(parents=True)
    plan={'schema':'mapillary-places-publish-plan-v1','created_utc':utc(),'run_id':run,'profile_path':str(profile_path),
          'profile_sha256':digest(profile_path),'release':release,'source_sha256':snapshot['source_sha256'],
          'feature_count':snapshot['feature_count'],'portal_url':portal_url,'owner':backend.username,
          'permission_precheck':backend.permission_check,'names':names,'sharing':'private',
          'experience_change':'none','existing_services':'retain','pro_project':'CURRENT'}
    path=directory/'publication-plan.json';save_json_exclusive(path,plan)
    print('Plan saved:',path)
    print('Portal:',portal_url,'| Account:',backend.username)
    print('Planned: new private data/query/package/tile items; existing services and the experience stay unchanged.')
    return {**plan,'plan_path':str(path)}


def _load_plan(path):
    path=Path(path).resolve();plan=read_json(path)
    keys={'schema','created_utc','run_id','profile_path','profile_sha256','release','source_sha256','feature_count','portal_url','owner','permission_precheck','names','sharing','experience_change','existing_services','pro_project'}
    if not isinstance(plan,dict) or set(plan)!=keys or plan.get('schema')!='mapillary-places-publish-plan-v1' or not RUN.fullmatch(str(plan.get('run_id',''))):raise PublishingError('Use an unchanged publication plan created by this script.')
    portal=clean_url(plan['portal_url']);profile_path,profile,folder,snapshot=_context(plan['profile_path'],plan['release'])
    if path!=folder/'publishing'/plan['run_id']/'publication-plan.json':raise PublishingError('Keep the publication plan in its original snapshot folder.')
    if digest(profile_path)!=plan['profile_sha256'] or snapshot['source_sha256']!=plan['source_sha256'] or snapshot['feature_count']!=plan['feature_count']:raise PublishingError('The profile or prepared snapshot changed. Create a new plan before publishing.')
    if plan['names']!=_service_names(profile['name'],plan['release'],plan['run_id']) or any(not NAME.fullmatch(plan['names'][key]) for key in ('query','tiles','build')):raise PublishingError('Publication names changed; create a new plan.')
    if plan['sharing']!='private' or plan['experience_change']!='none' or plan['existing_services']!='retain' or plan['pro_project']!='CURRENT':raise PublishingError('Publication plan policies changed; create a new plan.')
    if not isinstance(plan['owner'],str) or not plan['owner'] or len(plan['owner'])>255:raise PublishingError('Invalid publication account.')
    return path,plan,profile,folder,snapshot,portal


def _matching(attributes,expected):
    for key in FIELDS:
        a,b=attributes.get(key),expected.get(key)
        if b in (None,''):
            if a not in (None,''):raise PublishingError('Published attributes differ from the prepared source: '+key)
        elif key=='confidence':
            if type(a) not in (int,float) or not math.isfinite(a) or abs(a-b)>0.000001:raise PublishingError('Published confidence differs from the prepared source.')
        elif a!=b:raise PublishingError('Published attributes differ from the prepared source: '+key)


def validate_query(backend,service_url,snapshot,records,release):
    root=backend.read_json(service_url)
    if not isinstance(root.get('layers'),list):raise CachePending('The new query service is still starting.')
    if len(root['layers'])!=1 or root.get('tables'):raise PublishingError('Publish a dedicated single-layer Places query service.')
    number=root['layers'][0].get('id')
    if type(number) is not int or number<0:raise PublishingError('Invalid published query layer identifier.')
    query=clean_url(service_url+'/'+str(number),'query');metadata=backend.read_json(query)
    if not isinstance(metadata.get('fields'),list):raise CachePending('Published query metadata is not ready.')
    fields={f.get('name'):f.get('type') for f in metadata['fields']}
    for name in FIELDS:
        if fields.get(name) not in (('esriFieldTypeDouble','esriFieldTypeSingle') if name=='confidence' else ('esriFieldTypeString',)):raise PublishingError('Published query field needs its expected Places type: '+name)
    oid=metadata.get('objectIdField');capabilities=metadata.get('advancedQueryCapabilities',{})
    if metadata.get('geometryType')!='esriGeometryPoint' or 'query' not in [s.strip().lower() for s in metadata.get('capabilities','').split(',')]:raise PublishingError('Published query layer must expose queryable points.')
    if not isinstance(oid,str) or not re.fullmatch('[A-Za-z_][A-Za-z0-9_]*',oid) or fields.get(oid)!='esriFieldTypeOID':raise PublishingError('Published query layer needs an object ID.')
    if capabilities.get('supportsPagination') is not True or capabilities.get('supportsOrderBy') is not True or type(metadata.get('maxRecordCount')) not in (int,float) or not math.isfinite(metadata['maxRecordCount']) or metadata['maxRecordCount']<200:raise PublishingError('Published query service needs ordered paging of at least 200 records.')
    extent=metadata.get('extent',{});reference=extent.get('spatialReference',{});wkid=reference.get('latestWkid') or reference.get('wkid')
    coords=[extent.get(k) for k in ('xmin','ymin','xmax','ymax')]
    if wkid not in (4326,3857,102100,102113) or any(type(n) not in (int,float) or not math.isfinite(n) for n in coords) or coords[0]>=coords[2] or coords[1]>=coords[3]:raise PublishingError('Published query extent is invalid.')
    if wkid==4326:bounds=coords
    else:bounds=[coords[0]/20037508.342789244*180,(2*math.atan(math.exp(coords[1]/6378137))-math.pi/2)*180/math.pi,coords[2]/20037508.342789244*180,(2*math.atan(math.exp(coords[3]/6378137))-math.pi/2)*180/math.pi]
    if bounds[0]<-180.000001 or bounds[2]>180.000001 or bounds[1]<-85.051129 or bounds[3]>85.051129:raise PublishingError('Published query extent is outside the supported world bounds.')
    total=backend.read_json(query+'/query',{'where':'1=1','returnCountOnly':'true'})
    if total.get('count')!=snapshot['feature_count']:raise PublishingError('Published query count does not match the full prepared source.')
    mixed=backend.read_json(query+'/query',{'where':"data_release IS NULL OR data_release <> '"+release+"'",'returnCountOnly':'true'})
    if mixed.get('count')!=0:raise PublishingError('Published query contains a different or mixed data release.')
    sample=backend.read_json(query+'/query',{'where':'1=1','outFields':','.join(FIELDS),'returnGeometry':'true','outSR':4326,'resultRecordCount':1,'resultOffset':0,'orderByFields':oid+' ASC'})
    if not isinstance(sample.get('features'),list) or len(sample['features'])!=1:raise PublishingError('Published query sample is missing or unbounded.')
    feature=sample['features'][0];attributes=feature.get('attributes',{});source=records.get(attributes.get('gers_id'))
    if source is None:raise PublishingError('Published query sample is not in the prepared source.')
    expected={**source['properties'],'data_release':release};_matching(attributes,expected)
    geometry=feature.get('geometry',{});x,y=geometry.get('x'),geometry.get('y')
    if any(type(n) not in (int,float) or not math.isfinite(n) for n in (x,y)) or abs(x-source['coordinates'][0])>0.000001 or abs(y-source['coordinates'][1])>0.000001:raise PublishingError('Published query location differs from its source.')
    return query,expected,(x,y)


def validate_tiles(backend,tiles_url,query_url,snapshot,release,sample):
    service=backend.read_json(tiles_url);info=service.get('tileInfo')
    if not isinstance(info,dict) or not info.get('lods'):raise CachePending('The vector cache import is still incomplete (tileInfo is missing).')
    if info.get('rows')!=512 or info.get('cols')!=512:raise PublishingError('Published tiles do not use the supported 512-pixel scheme.')
    sr=info.get('spatialReference',{});wkid=sr.get('latestWkid') or sr.get('wkid')
    if wkid not in (3857,102100,102113):raise PublishingError('Published tiles need Web Mercator.')
    default=service.get('defaultStyles')
    if isinstance(default,dict):style=default
    elif isinstance(default,str):
        url=urljoin(tiles_url+'/',default.rstrip('/')+'/root.json');u=urlsplit(url);base=urlsplit(tiles_url)
        if u.scheme!='https' or u.netloc!=base.netloc or u.query or u.fragment or not u.path.startswith(base.path+'/'):raise PublishingError('Published style is outside the dedicated tile service.')
        style=backend.read_json(url)
    else:raise CachePending('Published default style is not ready.')
    contract=style.get('metadata',{}).get('mly:places',{})
    if style.get('version')!=8 or contract.get('version')!=1 or contract.get('queryUrl')!=query_url or contract.get('release')!=release or contract.get('sourceFeatureCount')!=snapshot['feature_count'] or contract.get('sourceLayers')!=['places'] or any(k not in contract.get('fields',[]) for k in FIELDS):raise PublishingError('Published tile contract does not match the new query release.')
    cluster=contract.get('clusters',{})
    if cluster.get('version')!=1 or cluster.get('layer')!='places_clusters' or cluster.get('cells')!=8 or cluster.get('scoreBlockSize')!=32:raise PublishingError('Published overview cluster metadata is missing or unsupported.')
    scores=cluster.get('scores');minimum=cluster.get('minzoom');maximum_cached=cluster.get('cachedMaxZoom')
    if type(minimum) is not int or type(maximum_cached) is not int or not 0<=minimum<=maximum_cached<=19 or cluster.get('maxzoom')!=maximum_cached+1 or not isinstance(scores,list) or len(scores)>8192 or any(type(n) not in (int,float) or not math.isfinite(n) or not 0<=n<=1 or i>0 and n<=scores[i-1] for i,n in enumerate(scores)):raise PublishingError('Published cluster ranges or score histograms are invalid.')
    layers=style.get('layers',[])
    if any(l.get('source-layer') and l['source-layer'] not in ('places','places_clusters') for l in layers):raise PublishingError('Use a dedicated Places vector tile source.')
    if not any(l.get('source-layer')=='places' and l.get('type')=='symbol' and l.get('layout',{}).get('icon-image') for l in layers) or not any(l.get('id')=='mly-place-cluster-counts' and l.get('source-layer')=='places_clusters' and l.get('type')=='symbol' for l in layers):raise PublishingError('Published tile icons or cluster counts are missing.')
    if not isinstance(style.get('sprite'),str):raise PublishingError('Published icon sprite is missing.')
    sprite_url=urljoin(tiles_url+'/resources/styles/root.json',style['sprite'])
    if not sprite_url.startswith(tiles_url+'/') or '?' in sprite_url or '#' in sprite_url:raise PublishingError('Published sprite is outside the tile service.')
    sprite=backend.read_json(sprite_url+'.json')
    if not backend.read_binary(sprite_url+'.png').startswith(b'\x89PNG\r\n\x1a\n'):raise PublishingError('Published icon atlas image is missing or invalid.')
    if sample[0]['icon_group'] not in sprite:raise PublishingError('Published sprite does not include the sample category icon.')
    lods=[lod['level'] for lod in info['lods'] if type(lod.get('level')) is int]
    maximum=service.get('maxLOD',max(lods) if lods else -1)
    if type(maximum) is not int or not 0<=maximum<=22 or maximum not in lods:raise PublishingError('Published cached tile levels are invalid.')
    lon,lat=sample[1];n=2**maximum;x=min(n-1,max(0,int((lon+180)/360*n)));y=min(n-1,max(0,int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)))
    payload=backend.read_binary(tiles_url+f'/tile/{maximum}/{y}/{x}.pbf')
    rows=[p for name,p in tile_properties(payload) if name=='places' and p.get('gers_id')==sample[0]['gers_id']]
    if len(rows)!=1:raise PublishingError('The published sample tile does not contain the matching place identity.')
    _matching(rows[0],sample[0])
    return {'query_count_verified':snapshot['feature_count'],'release_verified':release,'tile_attributes_verified':True,'cluster_contract_verified':True,'sample_cached_level':maximum,'widget_rendering_tested':False}


def _wait(check,timeout):
    deadline=time.monotonic()+timeout
    while True:
        try:return check()
        except CachePending:
            if time.monotonic()>=deadline:raise PublishingError('Hosted service/cache validation timed out. Inspect the new Portal jobs/items before retrying.') from None
            time.sleep(min(3,max(0,deadline-time.monotonic())))


def publish_plan(plan_path,*,validation_timeout=600,_backend_instance=None,_build=None):
    """Explicit write action: new private services only; preserves live app/services."""
    path,plan,profile,folder,snapshot,portal=_load_plan(plan_path)
    if type(validation_timeout) not in (int,float) or not 0<=validation_timeout<=3600:raise PublishingError('validation_timeout must be 0..3600 seconds.')
    backend=_backend(portal,_backend_instance);_check_backend(backend,portal,plan['owner'])
    report_path=path.parent/'publication-report.json';lock_path=path.parent/'publication-started.json'
    if lock_path.exists() or report_path.exists():raise PublishingError('This plan was already started. Inspect its report and retained Portal content; create a new plan for another attempt.')
    if not backend.query_name_available(plan['names']['query']):raise PublishingError('The planned query name is no longer available. Create a fresh plan.')
    save_json_exclusive(lock_path,{'started_utc':utc(),'plan_sha256':digest(path)})
    report={'schema':'mapillary-places-publish-report-v1','run_id':plan['run_id'],'release':plan['release'],'portal_url':portal,'owner':plan['owner'],'status':'running','stage':'start','started_utc':utc(),'created_items':{},'experience_changed':False,'publication_recorded':False,'automatic_deletion':False}
    _json_atomic(report_path,report)
    def stage(name):
        report['stage']=name;_json_atomic(report_path,report);print('[Places publisher]',name);backend.ensure_context()
    def remember(key,value):
        identifier=item_id(value)
        report['created_items'][key]={'id':identifier,'new_item_verified':False};_json_atomic(report_path,report)
    def private_item(key,item):
        remember(key,_value(item,'id'));backend.make_private(item);report['created_items'][key]['new_item_verified']=True;_json_atomic(report_path,report)
    def service_url(item,kind,name):
        url=clean_url(_value(item,'url'),kind)
        if unquote(urlsplit(url).path).split('/')[-2]!=name:raise PublishingError('Portal returned an unexpected service name; no existing service was selected.')
        return url
    try:
        stage('verify-upload-snapshot')
        upload_source=path.parent/'source-upload.geojson'
        with (folder/snapshot['source_file']).open('rb') as source,upload_source.open('xb') as destination:shutil.copyfileobj(source,destination,1024*1024)
        if digest(upload_source)!=plan['source_sha256']:raise PublishingError('The source changed before upload. Create a fresh plan from an unchanged snapshot.')
        records=source_records(upload_source,plan['release'])
        stage('create-private-content-folder');content_folder=backend.create_folder(plan['names']['folder'])
        report['folder_id']=item_id(_value(_value(content_folder,'properties',{}),'id'));_json_atomic(report_path,report)
        stage('upload-prepared-query-data')
        data=backend.upload(content_folder,upload_source,plan['names']['query']+'_source','geojson',plan['release'],lambda identifier:remember('query_source',identifier));private_item('query_source',data)
        stage('publish-new-query-service');query_item=backend.publish(data,plan['names']['query'],'feature');remember('query_service',_value(query_item,'id'))
        feature_url=service_url(query_item,'feature',plan['names']['query']);private_item('query_service',query_item);backend.move(query_item,content_folder)
        stage('validate-new-query-service')
        query_url,attributes,point=_wait(lambda:validate_query(backend,feature_url,snapshot,records,plan['release']),validation_timeout)
        report['query_url']=query_url;_json_atomic(report_path,report)
        stage('build-restore-style-and-cluster-package')
        builder=_build or build_portal
        built=builder(plan['profile_path'],plan['release'],query_url,project='CURRENT',build_name=plan['names']['build'])
        build_folder=Path(built['folder']).resolve();expected=(folder/plan['names']['build']).resolve()
        if build_folder!=expected:raise PublishingError('The local build returned an unexpected output folder.')
        package=build_folder/'places-portal-overview.vtpk'
        if digest(package)!=built['package_sha256']:raise PublishingError('The prepared vector tile package changed before upload.')
        report['package_sha256']=built['package_sha256'];_json_atomic(report_path,report)
        upload_package=path.parent/'package-upload.vtpk'
        with package.open('rb') as source,upload_package.open('xb') as destination:shutil.copyfileobj(source,destination,1024*1024)
        if digest(upload_package)!=built['package_sha256']:raise PublishingError('The package changed before upload.')
        stage('upload-vector-tile-package')
        package_item=backend.upload(content_folder,upload_package,plan['names']['tiles']+'_package','vtpk',plan['release'],lambda identifier:remember('tile_package',identifier));private_item('tile_package',package_item)
        stage('publish-new-vector-tile-service');tiles_item=backend.publish(package_item,plan['names']['tiles'],'tiles');remember('tile_service',_value(tiles_item,'id'))
        tiles_url=service_url(tiles_item,'tiles',plan['names']['tiles']);private_item('tile_service',tiles_item);backend.move(tiles_item,content_folder)
        report['tiles_url']=tiles_url;_json_atomic(report_path,report)
        stage('validate-hosted-vector-cache')
        report['validation']=_wait(lambda:validate_tiles(backend,tiles_url,query_url,snapshot,plan['release'],(attributes,point)),validation_timeout)
        connection={'placesSource':'portal','placesPortalTilesUrl':tiles_url,'placesPortalQueryUrl':query_url}
        connection_path=path.parent/'connection.json';save_json_exclusive(connection_path,connection)
        report.update(status='ready_for_review',stage='complete',completed_utc=utc(),sharing='private',connection_file=str(connection_path),next_step='Review/test the pair, share both service items with the intended audience, then update the experience and run mark-published. Existing services were retained.')
        _json_atomic(report_path,report);print('Ready for review. Connection URLs:',connection_path)
        return {**report,'report_path':str(report_path)}
    except (Exception,KeyboardInterrupt) as error:
        report.update(status='interrupted' if isinstance(error,KeyboardInterrupt) else 'failed',failure_type=type(error).__name__,failed_utc=utc(),server_work_may_continue=report['stage'].startswith(('upload','publish')),next_step='Inspect the retained new items and Portal jobs using their IDs/planned names. No automatic retry, deletion, sharing expansion or live experience switch was performed.')
        _json_atomic(report_path,report)
        if isinstance(error,PublishingError):message=str(error)
        else:message='This stage failed. Inspect the retained local build/report and new Portal items; raw SDK errors are not copied to reports.'
        raise PublishingError(report['stage']+': '+message+' Report: '+str(report_path)) from None


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);commands=p.add_subparsers(dest='command',required=True)
    planning=commands.add_parser('plan',help='Read-only Portal preflight and local publication plan');planning.add_argument('--profile',required=True);planning.add_argument('--release',required=True);planning.add_argument('--portal',required=True)
    publishing=commands.add_parser('publish',help='Publish the explicit plan as a NEW PRIVATE service pair');publishing.add_argument('--plan',required=True);publishing.add_argument('--validation-timeout',type=float,default=600)
    args=p.parse_args(argv)
    result=create_plan(args.profile,args.release,portal_url=args.portal) if args.command=='plan' else publish_plan(args.plan,validation_timeout=args.validation_timeout)
    print(json.dumps(result,indent=2));return result


if __name__=='__main__':
    try:main()
    except PublishingError as error:print('Places publisher:',str(error),file=sys.stderr);sys.exit(1)
    except Exception:print('Places publisher: preflight failed; check the local profile/snapshot and Pro environment. No raw SDK diagnostic was printed.',file=sys.stderr);sys.exit(1)
