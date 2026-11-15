import { portalTileProperties } from './portalTileProperties';
import { portalPlacesUrl } from './placesSource';
import { isTileCategory } from './tileCategories';
import type { PlaceBbox } from './placesModel';
export class PortalPlacesConfigurationError extends Error { constructor(message:string) { super(message); this.name='PortalPlacesConfigurationError'; } }
/** Fixed stage/status diagnostics only. SDK URLs, tokens and raw messages are not displayed. */
export function portalPlacesFailure(stage: string, error: any): PortalPlacesConfigurationError {
  if (error instanceof PortalPlacesConfigurationError) return error;
  const candidates=[error?.code,error?.error?.code,error?.details?.raw?.code,error?.details?.raw?.error?.code,
    error?.details?.httpStatus,error?.httpStatus,error?.response?.status,error?.status];
  const codes=candidates.map(Number).filter(n=>Number.isInteger(n)&&n>=400&&n<=599);
  const code=codes.find(n=>[401,403,498,499].includes(n)) ?? codes[0];
  if ([401,403,498,499].includes(code) || String(error?.name||'').startsWith('identity-manager:')) {
    return new PortalPlacesConfigurationError(`${stage}: Portal authentication or access failed${code?' ('+code+')':''}. Sign in through the application with access to both Places layers.`);
  }
  if(code===404)return new PortalPlacesConfigurationError(`${stage}: resource not found (404). Check the actual published service and its resources.`);
  if(code===400)return new PortalPlacesConfigurationError(`${stage}: request rejected (400). Check the published layer schema and query capabilities.`);
  if(code>=500)return new PortalPlacesConfigurationError(`${stage}: service error (${code}). Check service availability and publishing status.`);
  return new PortalPlacesConfigurationError(`${stage}: request could not complete. Check application sign-in, HTTPS and access from the app origin (CORS).`);
}
export type PortalRequest = (url: string, options: any) => Promise<{ data: any }>;
export interface PortalPlaceFilters { family: string; minimum: number | null; hideClosed: boolean }
export const PORTAL_PLACE_FIELDS = ['gers_id','place_name','category','icon_group','confidence','operating_status','address','website','data_release'] as const;
export const PORTAL_TILE_FIELDS = ['gers_id','place_name','icon_group','confidence','operating_status'] as const;
export const PORTAL_DEFAULT_FILTERS: PortalPlaceFilters = { family: 'all', minimum: null, hideClosed: false };
function checkFilters(filters: PortalPlaceFilters): void {
  if (!isTileCategory(filters.family) || filters.minimum !== null && (!Number.isFinite(filters.minimum) || filters.minimum < 0 || filters.minimum > 1)) throw new PortalPlacesConfigurationError('Invalid Places filters');
}
/** Histogram keys used by both map expressions and bounded cluster picking. */
export function portalClusterCountKeys(cluster: any, filters: PortalPlaceFilters): string[] {
  checkFilters(filters);
  const group = filters.family;
  if (filters.minimum === null) return [(filters.hideClosed ? 'o_' : 'n_') + group];
  const scores: number[] = cluster.scores;
  let start = scores.findIndex(score => score >= filters.minimum!);
  if (start < 0) return [];
  const keys: string[] = [];
  while (start < scores.length && start % 32 !== 0) keys.push((filters.hideClosed ? 'j_' : 'h_') + group + '_' + start++);
  while (start < scores.length) { keys.push((filters.hideClosed ? 'q_' : 'b_') + group + '_' + Math.floor(start / 32)); start += 32; }
  return keys;
}
export function portalClusterCount(cluster: any, filters: PortalPlaceFilters, properties: any): number {
  return portalClusterCountKeys(cluster, filters).reduce((sum,key) => sum + (Number.isSafeInteger(properties[key]) && properties[key] >= 0 ? properties[key] : 0), 0);
}
function clusterDefinition(style: any): any | null {
  const value=style?.metadata?.['mly:places']?.clusters;
  if (value === undefined) return null;
  if (value?.version!==1 || value.layer!=='places_clusters' || value.cells!==8 || value.scoreBlockSize!==32 ||
      !Number.isInteger(value.minzoom) || !Number.isInteger(value.cachedMaxZoom) || value.minzoom<0 || value.cachedMaxZoom>19 || value.cachedMaxZoom<value.minzoom || value.maxzoom!==value.cachedMaxZoom+1 ||
      !Array.isArray(value.scores) || value.scores.length>8192 || value.scores.some((n:any,i:number) => typeof n!=='number' || !Number.isFinite(n) || n<0 || n>1 || i>0 && n<=value.scores[i-1])) {
    throw new PortalPlacesConfigurationError('Unsupported Places cluster metadata');
  }
  const layers=style.layers.filter((l:any)=>l['source-layer']===value.layer);
  if(layers.length!==2 || !layers.some((l:any)=>l.id==='mly-place-clusters' && l.type==='circle') || !layers.some((l:any)=>l.id==='mly-place-cluster-counts' && l.type==='symbol'))throw new PortalPlacesConfigurationError('Places cluster style layers are missing');
  return value;
}
export function portalPlacesWhere(filters: PortalPlaceFilters, text = ''): string {
  checkFilters(filters);
  const terms = ['1=1'];
  if (filters.family !== 'all') terms.push(`icon_group = '${filters.family}'`);
  if (filters.minimum !== null) terms.push(`confidence >= ${filters.minimum}`);
  if (filters.hideClosed) terms.push("(operating_status IS NULL OR operating_status <> 'permanently_closed')");
  text = text.trim().slice(0, 120);
  if (text) {
    // Normalize category search text in the client: Portal standardized SQL
    // does not support REPLACE. Escape LIKE metacharacters after normalization.
    const literal = (value: string) => value.toUpperCase().replace(/'/g, "''").replace(/[\\%_]/g, value => '\\' + value);
    const clauses = ['place_name','category','address','gers_id'].map(field =>
      `UPPER(${field}) LIKE '%${literal(text)}%' ESCAPE '\\'`);
    const categoryText = text.replace(/ /g, '_');
    if (categoryText !== text) clauses.push(`UPPER(category) LIKE '%${literal(categoryText)}%' ESCAPE '\\'`);
    terms.push('(' + clauses.join(' OR ') + ')');
  }
  return terms.join(' AND ');
}
export function portalPlacesStyleFilter(filters: PortalPlaceFilters): any[] {
  checkFilters(filters); const clauses: any[] = ['all'];
  if (filters.family !== 'all') clauses.push(['==','icon_group',filters.family]);
  if (filters.minimum !== null) clauses.push(['has','confidence'],['>=','confidence',filters.minimum]);
  if (filters.hideClosed) clauses.push(['!=','operating_status','permanently_closed']);
  return clauses;
}
export function validatePortalPlacesLayer(data: any): { bbox: PlaceBbox; objectId: string } {
  const fail = (message: string): never => { throw new PortalPlacesConfigurationError(message); };
  if (!data || data.error || data.geometryType !== 'esriGeometryPoint' || !String(data.capabilities || '').toLowerCase().split(',').map((s: string) => s.trim()).includes('query')) fail('Query service must be a queryable point layer');
  const fields = new Map<string, string>((data.fields || []).map((f: any) => [f.name, f.type]));
  for (const name of PORTAL_PLACE_FIELDS) {
    const type = fields.get(name);
    if (!type || (name === 'confidence' ? !['esriFieldTypeDouble','esriFieldTypeSingle'].includes(type) : type !== 'esriFieldTypeString')) fail('Missing or incompatible Places field: ' + name);
  }
  const objectId = data.objectIdField;
  if (typeof objectId !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(objectId) || fields.get(objectId) !== 'esriFieldTypeOID') fail('A valid object ID field is required');
  if (data.advancedQueryCapabilities?.supportsPagination !== true || data.advancedQueryCapabilities?.supportsOrderBy !== true || data.maxRecordCount < 200 || !Number.isFinite(data.maxRecordCount)) fail('Query service must support ordered pagination with at least 200 records');
  const e = data.extent, wkid = e?.spatialReference?.latestWkid || e?.spatialReference?.wkid;
  let bbox: PlaceBbox;
  if (wkid === 4326) bbox = [e.xmin,e.ymin,e.xmax,e.ymax];
  else if ([3857,102100,102113].includes(wkid)) {
    const lon = (x: number) => x / 20037508.342789244 * 180;
    const lat = (y: number) => (2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2) * 180 / Math.PI;
    bbox = [lon(e.xmin),lat(e.ymin),lon(e.xmax),lat(e.ymax)];
  } else fail('Query extent must use WGS84 or Web Mercator');
  if (!bbox!.every(Number.isFinite) || bbox![0] >= bbox![2] || bbox![1] >= bbox![3] || bbox![0] < -180.000001 || bbox![2] > 180.000001 || bbox![1] < -85.051129 || bbox![3] > 85.051129) fail('Invalid Places query extent');
  return { bbox: bbox!, objectId };
}
/** Records only: never instantiates or adds a FeatureLayer. esri/request owns Portal authentication. */
export class PortalPlacesSource {
  readonly tilesUrl: string;
  readonly queryUrl: string;
  get coverageExtent(): PlaceBbox | null { return this.info?.bbox || null; }
  filters: PortalPlaceFilters = { ...PORTAL_DEFAULT_FILTERS };
  private verified = false;
  private clusters: any | null = null;
  private clusterTiles = new Map<string, {rows:Record<string, unknown>[];bytes:number}>();
  private clusterTileBytes=0;
  private tileServiceInfo: any = null;
  private request: PortalRequest;
  private info: ReturnType<typeof validatePortalPlacesLayer> | null = null;
  constructor(tiles: string, query: string, request: PortalRequest | { default?: PortalRequest }) {
    const t = portalPlacesUrl(tiles,'tiles'), q = portalPlacesUrl(query,'query');
    if (!t || !q) throw new PortalPlacesConfigurationError('Use a VectorTileServer URL and a FeatureServer layer URL without credentials or URL parameters');
    const callable=typeof request==='function'?request:request?.default;
    if(typeof callable!=='function')throw new PortalPlacesConfigurationError('ArcGIS request module is unavailable; rebuild/reload the widget');
    this.request=callable;
    this.tilesUrl = t; this.queryUrl = q;
  }
  private async read(url: string, query: any, signal: AbortSignal, method: 'get' | 'post' = 'get'): Promise<any> {
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
    const stage=url===this.queryUrl?'Query-layer metadata':url===this.queryUrl+'/query'?(query.returnCountOnly?'Query-layer record count':'Query-layer query'):'Vector tile service metadata';
    let result:any;
    try{result=(await this.request(url,{query:{f:'json',...query},responseType:'json',method,signal,timeout:10000,authMode:'auto'})).data;}
    catch(error){if(signal.aborted)throw error;throw portalPlacesFailure(stage,error);}
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
    if (!result || result.error) throw portalPlacesFailure(stage,result?.error || {});
    return result;
  }
  private async tileMetadata(signal: AbortSignal): Promise<any> {
    if(this.tileServiceInfo)return this.tileServiceInfo;
    const service=await this.read(this.tilesUrl,{},signal);
    if(!service.tileInfo || !Array.isArray(service.tileInfo.lods))throw new PortalPlacesConfigurationError('Vector tile service metadata is incomplete: tileInfo is missing. Confirm publishing/cache import has completed; if it persists, check or republish the hosted tile layer.');
    this.tileServiceInfo=service;return service;
  }
  async metadata(signal: AbortSignal): Promise<{ bbox: PlaceBbox; count: null; release: string }> {
    this.info = validatePortalPlacesLayer(await this.read(this.queryUrl, {}, signal));
    return { bbox: this.info.bbox, count: null, release: '' };
  }
  /** Package metadata declares the matching query dataset and attributes retained in tiles. */
  validateStyle(style: any): { sourceLayers: string[]; release: string; sourceFeatureCount: number | null } {
    const contract = style?.metadata?.['mly:places'];
    if (style?.version !== 8 || contract?.version !== 1 || portalPlacesUrl(contract.queryUrl,'query') !== this.queryUrl || !Array.isArray(contract.fields) || PORTAL_TILE_FIELDS.some(name => !contract.fields.includes(name))) throw new PortalPlacesConfigurationError('Vector tile style needs the Places contract and matching query URL; see the Portal administrator guide');
    const sourceLayers = contract.sourceLayers;
    if (!Array.isArray(sourceLayers) || !sourceLayers.length || sourceLayers.some((name: unknown) => typeof name !== 'string' || !name || !style.layers?.some((l: any) => l['source-layer'] === name && ['symbol','circle'].includes(l.type)))) throw new PortalPlacesConfigurationError('Places source layers are missing from the vector tile style');
    const clusters=clusterDefinition(style);
    if (style.layers.some((l: any) => l['source-layer'] && !sourceLayers.includes(l['source-layer']) && l['source-layer']!==clusters?.layer)) throw new PortalPlacesConfigurationError('Use a dedicated Places vector tile layer');
    if (contract.sourceFeatureCount!==undefined && (!Number.isSafeInteger(contract.sourceFeatureCount) || contract.sourceFeatureCount<1)) throw new PortalPlacesConfigurationError('Invalid source feature count in Places style');
    return { sourceLayers, release: typeof contract.release === 'string' ? contract.release.slice(0,80) : '', sourceFeatureCount:contract.sourceFeatureCount ?? null };
  }
  async configureLayer(layer: any, filters: PortalPlaceFilters, signal: AbortSignal): Promise<void> {
    checkFilters(filters);
    await Promise.all([this.info ? Promise.resolve(this.info) : this.metadata(signal), this.tileMetadata(signal)]);
    if(signal.aborted)throw new DOMException('Aborted','AbortError');
    try{await layer.load({signal});}catch(error){if(signal.aborted)throw error;throw portalPlacesFailure('Vector tile style/resources',error);}
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
    const style = layer.currentStyleInfo?.style, contract = this.validateStyle(style);
    if (!this.verified) await this.verifyTileAttributes(contract.sourceLayers,contract.release,contract.sourceFeatureCount,signal);
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
    this.clusters=clusterDefinition(style);
    // Override an inherited service display cutoff; cached source levels are
    // separately bounded by the prepared package for native overzooming.
    layer.maxScale=0;
    const filter = portalPlacesStyleFilter(filters);
    const replacements:any[]=[];
    const update=(value:any)=>replacements.push(value);
    for (const original of style.layers) {
      if (this.clusters && original['source-layer']===this.clusters.layer) {
        const keys=portalClusterCountKeys(this.clusters,filters);
        const values=keys.map(key=>['case',['has',key],['to-number',['get',key]],0]);
        const count:any=values.length>1?['+',...values]:values[0] ?? 0;
        update({...original, filter:filters.minimum===null?['>',keys[0],0]:['>',count,0],
          ...(original.type==='symbol'?{layout:{...original.layout,'text-field':filters.minimum===null?'{'+keys[0]+'}':['to-string',count]}}:{})});
        continue;
      }
      if (!contract.sourceLayers.includes(original['source-layer'])) continue;
      if (typeof layer.setStyleLayer !== 'function') throw new PortalPlacesConfigurationError('ArcGIS SDK does not support Places style filtering');
      // Each replacement layer starts from its published filter; filters never accumulate.
      const layout = { ...original.layout };
      // Names remain in the selection panel. Text-only layers must be hidden,
      // not merely made transparent, so they no longer reserve collision space.
      if (original.type === 'symbol' && layout['text-field'] !== undefined) {
        if (layout['icon-image'] === undefined) layout.visibility = 'none';
        else {
          delete layout['text-field'];
          layout['icon-optional'] = true;
        }
      }
      update({ ...original, layout, filter: original.filter ? ['all', original.filter, filter] : filter });
    }
    if(typeof layer.loadStyle==='function'){
      const byId=new Map(replacements.map(value=>[value.id,value]));
      const next={...style,jsonUrl:layer.currentStyleInfo?.styleUrl || this.tilesUrl+'/resources/styles/root.json',layers:style.layers.map((value:any)=>byId.get(value.id)||value)};
      try{await layer.loadStyle(next,{signal});}catch(error){if(signal.aborted)throw error;throw portalPlacesFailure('Places filtered style',error);}
      layer.maxScale=0;
    }else for(const replacement of replacements)layer.setStyleLayer(replacement);
  }
  private async verifyTileAttributes(sourceLayers: string[], release: string, sourceFeatureCount: number | null, signal: AbortSignal): Promise<void> {
    if(sourceFeatureCount!==null){
      const total=await this.read(this.queryUrl+'/query',{where:'1=1',returnCountOnly:true},signal,'post');
      if(!Number.isSafeInteger(total.count)||total.count!==sourceFeatureCount)throw new PortalPlacesConfigurationError('Tile source and query layer have different place counts; rebuild the full matching dataset');
    }
    const bbox=this.info!.bbox;
    const sample=await this.query({xmin:bbox[0],ymin:bbox[1],xmax:bbox[2],ymax:bbox[3],spatialReference:{wkid:4326}},signal,1,0,'',{...PORTAL_DEFAULT_FILTERS});
    const feature=sample.features[0];
    if(!feature)throw new PortalPlacesConfigurationError('The Places dataset is empty; publish at least one place before testing');
    if(release && feature.attributes.data_release!==release)throw new PortalPlacesConfigurationError('Tile style and query layer identify different Places releases');
    const service=await this.tileMetadata(signal);
    const info=service.tileInfo, sr=info?.spatialReference?.latestWkid||info?.spatialReference?.wkid;
    const maximum=Number.isInteger(service.maxLOD)?Math.min(19,service.maxLOD):19;
    const lods=info?.lods?.filter((lod:any)=>Number.isInteger(lod.level)&&lod.level>=0&&lod.level<=maximum);
    if(![3857,102100,102113].includes(sr)||info?.cols!==512||info?.rows!==512||!lods?.length||Math.abs(info.origin?.x+20037508.342789244)>1||Math.abs(info.origin?.y-20037508.342789244)>1)throw new PortalPlacesConfigurationError('Places tiles must use the standard 512-pixel Web Mercator vector tile scheme');
    const z=Math.max(...lods.map((lod:any)=>lod.level)),n=2**z;
    const lon=feature.geometry.x,lat=feature.geometry.y*Math.PI/180;
    const x=Math.max(0,Math.min(n-1,Math.floor((lon+180)/360*n))),y=Math.max(0,Math.min(n-1,Math.floor((1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*n)));
    let response:{data:any};
    try{response=await this.request(`${this.tilesUrl}/tile/${z}/${y}/${x}.pbf`,{responseType:'array-buffer',signal,timeout:10000,authMode:'auto'});}
    catch(error){if(signal.aborted)throw error;throw portalPlacesFailure('Sample vector tile',error);}
    if(signal.aborted)throw new DOMException('Aborted','AbortError');
    let rows:Record<string,unknown>[];
    try{rows=portalTileProperties(response.data,sourceLayers);}catch{throw new PortalPlacesConfigurationError('Could not inspect the sample Places tile; check the tile package and its size');}
    const attributes=rows.find(row=>row.gers_id===feature.attributes.gers_id);
    if(!attributes)throw new PortalPlacesConfigurationError('Sample place ID was not retained in its vector tile; rebuild the package with the Places attribute contract');
    for(const key of PORTAL_TILE_FIELDS){
      const expected=feature.attributes[key],actual=attributes[key];
      if(expected===null||expected===undefined||expected===''){if(actual!==null&&actual!==undefined&&actual!=='')throw new PortalPlacesConfigurationError('Tile/query attributes differ: '+key);continue;}
      if(key==='confidence'?typeof actual!=='number'||Math.abs(actual-expected)>0.000001:actual!==expected)throw new PortalPlacesConfigurationError('Tile/query attributes differ or are missing: '+key);
    }
    this.verified=true;
  }

  private async query(geometry: any, signal: AbortSignal, limit: number, offset = 0, text = '', filters = this.filters): Promise<any> {
    if (!this.info) await this.metadata(signal);
    const result = await this.read(this.queryUrl + '/query', {
      where: portalPlacesWhere(filters,text), geometry: JSON.stringify(geometry), geometryType:'esriGeometryEnvelope',
      inSR: JSON.stringify(geometry.spatialReference || { wkid:4326 }), spatialRel:'esriSpatialRelIntersects',
      outFields: PORTAL_PLACE_FIELDS.join(','), returnGeometry:true, outSR:4326,
      resultRecordCount:limit, resultOffset:offset, orderByFields:this.info!.objectId + ' ASC', returnZ:false, returnM:false
    }, signal, 'post');
    if (!Array.isArray(result.features) || result.features.length > limit) throw new PortalPlacesConfigurationError('Portal query exceeded the requested record limit');
    if (result.geometryType && result.geometryType !== 'esriGeometryPoint') throw new PortalPlacesConfigurationError('Expected point results');
    if (result.spatialReference && result.spatialReference.wkid !== 4326) throw new PortalPlacesConfigurationError('Expected WGS84 query results');
    for (const feature of result.features) {
      const p = feature.geometry;
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x)>180 || Math.abs(p.y)>85.051129 || typeof feature.attributes?.gers_id !== 'string' || !feature.attributes.gers_id) throw new PortalPlacesConfigurationError('Invalid Places query record');
      const a=feature.attributes;
      if (typeof a.icon_group!=='string' || a.icon_group==='all' || !isTileCategory(a.icon_group) || (a.confidence!==null && (typeof a.confidence!=='number' || !Number.isFinite(a.confidence) || a.confidence<0 || a.confidence>1))) throw new PortalPlacesConfigurationError('Invalid category family or confidence in Places query record');
      feature.geometry = { ...p, spatialReference:{ wkid:4326 } };
    }
    return result;
  }
  async queryPick(geometry: any, signal: AbortSignal, view?: any): Promise<any> {
    const cluster=this.clusters;
    if(!cluster || !view)return this.query(geometry,signal,32);
    const service=this.tileServiceInfo, first=service?.tileInfo?.lods?.find((l:any)=>l.level===0);
    // Native 512-pixel LODs differ by one level from common 256-pixel map zooms.
    const level=Number.isFinite(view.scale) && first?.scale>0 ? Math.log2(first.scale/view.scale) : Number(view.zoom)-1;
    if(!Number.isFinite(level) || level>=cluster.maxzoom)return this.query(geometry,signal,32);
    if(level<cluster.minzoom)return {features:[],exceededTransferLimit:false};
    const z=Math.min(cluster.cachedMaxZoom,Math.floor(level+1e-8)), scale=2**z;
    const wkid=geometry.spatialReference?.latestWkid ?? geometry.spatialReference?.wkid;
    const project=(x:number,y:number):number[] => wkid===4326 ? [(x+180)/360,(1-Math.asinh(Math.tan(y*Math.PI/180))/Math.PI)/2] : [x/40075016.68557849+.5,.5-y/40075016.68557849];
    if(![4326,3857,102100,102113].includes(wkid))throw new PortalPlacesConfigurationError('Cluster picking requires WGS84 or Web Mercator');
    const [west,north]=project(geometry.xmin,geometry.ymax),[east,south]=project(geometry.xmax,geometry.ymin);
    const xmin=Math.max(0,Math.floor(west*scale)),xmax=Math.min(scale-1,Math.floor(east*scale));
    const ymin=Math.max(0,Math.floor(north*scale)),ymax=Math.min(scale-1,Math.floor(south*scale));
    if((xmax-xmin+1)*(ymax-ymin+1)>4)throw new PortalPlacesConfigurationError('Zoom closer to select a cluster');
    const features:any[]=[];
    for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
      const key=z+'/'+y+'/'+x;
      const cached=this.clusterTiles.get(key);
      let rows=cached?.rows;
      if(cached){this.clusterTiles.delete(key);this.clusterTiles.set(key,cached);}
      if(!rows){
        let response:any;
        try{response=await this.request(this.tilesUrl+'/tile/'+key+'.pbf',{query:{},responseType:'array-buffer',authMode:'auto',signal});}
        catch(error:any){if(signal.aborted)throw error;if([error?.code,error?.httpStatus,error?.response?.status].some(code=>Number(code)===404))continue;throw portalPlacesFailure('Cluster vector tile',error);}
        if(signal.aborted)throw new DOMException('Aborted','AbortError');
        rows=portalTileProperties(response.data,[cluster.layer]);
        if(rows.length>64)throw new PortalPlacesConfigurationError('Invalid cluster tile');
        const bytes=JSON.stringify(rows).length*2;
        if(bytes<=512*1024){
          this.clusterTiles.set(key,{rows,bytes});this.clusterTileBytes+=bytes;
          while(this.clusterTiles.size>16 || this.clusterTileBytes>512*1024){const oldest=this.clusterTiles.keys().next().value!;this.clusterTileBytes-=this.clusterTiles.get(oldest)!.bytes;this.clusterTiles.delete(oldest);}
        }
      }
      for(const row of rows){
        const cx=Number(row.cell_x),cy=Number(row.cell_y);
        if(!Number.isInteger(cx)||!Number.isInteger(cy)||cx<0||cy<0||cx>=8||cy>=8||row.tile_z!==z||row.tile_x!==x||row.tile_y!==y)throw new PortalPlacesConfigurationError('Invalid cluster grid record');
        const px=(x+(cx+.5)/8)/scale,py=(y+(cy+.5)/8)/scale;
        if(px<west||px>east||py<north||py>south)continue;
        const count=portalClusterCount(cluster,this.filters,row);
        if(count>0)features.push({attributes:{gers_id:'cluster:'+key+':'+cx+':'+cy,cluster_count:count},geometry:{x:px*360-180,y:Math.atan(Math.sinh(Math.PI*(1-2*py)))*180/Math.PI,spatialReference:{wkid:4326}}});
      }
    }
    return {features:features.slice(0,32),exceededTransferLimit:features.length>32};
  }
  async queryArea(bbox: readonly number[], signal: AbortSignal, _origin?: unknown, offset = 0, text = ''): Promise<{ features: any[]; limited: boolean; offset: number }> {
    if (bbox.length!==4 || !bbox.every(Number.isFinite) || bbox[0]>=bbox[2] || bbox[1]>=bbox[3] || bbox[0]<-180 || bbox[2]>180 || bbox[1]<-85.051129 || bbox[3]>85.051129) throw new PortalPlacesConfigurationError('Invalid Places search bounds');
    if (!Number.isSafeInteger(offset) || offset<0 || offset>100000 || offset%200) throw new PortalPlacesConfigurationError('Invalid page offset');
    const result = await this.query({ xmin:bbox[0],ymin:bbox[1],xmax:bbox[2],ymax:bbox[3],spatialReference:{wkid:4326} },signal,200,offset,text);
    return { features:result.features, limited:result.exceededTransferLimit===true, offset };
  }
  /** Test a real text/quality query as well as metadata and native style loading. */
  async test(layer: any, signal: AbortSignal): Promise<{ bbox: PlaceBbox; count: null; release: string }> {
    const metadata = await this.metadata(signal);
    await this.configureLayer(layer,{...PORTAL_DEFAULT_FILTERS},signal);
    await this.query({xmin:metadata.bbox[0],ymin:metadata.bbox[1],xmax:metadata.bbox[2],ymax:metadata.bbox[3],spatialReference:{wkid:4326}},signal,1,0,'mly-connection-probe',{family:'cafe',minimum:0,hideClosed:true});
    return {...metadata, release:this.validateStyle(layer.currentStyleInfo.style).release};
  }
}
