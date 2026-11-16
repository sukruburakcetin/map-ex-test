import { categoryStyleFilter, type MapCategoryFilter } from './categorySelection';
import { objectNameMap } from '../../utils/mapillaryObjectNameMap';

export const DETECTION_GLYPHS = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf';
export const DETECTION_LABEL_ZOOM = 18;
export function shortDetectionLabel(code: string, kind: 'signs' | 'objects'): string {
  if (kind === 'objects') return objectNameMap[code] || '';
  const parts = code.split('--');
  if (parts.length < 2) return '';
  const name = parts.slice(1).filter(part => !/^g\d+$/i.test(part)).join(' ').replace(/-/g,' ').trim();
  return name ? name[0].toUpperCase() + name.slice(1) : '';
}
/** Use a native minzoom label layer: no zoom-dependent text-field evaluation. */
export function detectionLabelStyle(style: any, iconId: string, kind: 'signs' | 'objects', codes: Iterable<string>, selected: MapCategoryFilter, all: string, enabled: boolean): any {
  const labelId = `${iconId}-labels`;
  const layers = style.layers.filter((layer:any)=>layer.id!==labelId).map((layer:any)=>{
    if (layer.id !== iconId) return layer;
    const layout = {...layer.layout}, paint = {...layer.paint};
    // Remove text from the previous combined icon/text implementation.
    for (const key of Object.keys(layout)) if (key.startsWith('text-')) delete layout[key];
    for (const key of Object.keys(paint)) if (key.startsWith('text-')) delete paint[key];
    return {...layer,layout,paint};
  });
  const next = {...style, layers};
  const icon = layers.find((layer:any)=>layer.id===iconId);
  if (enabled && icon) {
    const groups = new Map<string,string[]>();
    for (const code of codes) { const label = shortDetectionLabel(code,kind); if (label) groups.set(label,[...(groups.get(label)||[]),code]); }
    const match:unknown[] = ['match',['get','value']];
    for (const [label,values] of groups) match.push(values.length===1?values[0]:values,label);
    match.push('');
    const filter = categoryStyleFilter(selected,all);
    const label:any = {
      id:labelId,type:'symbol',source:icon.source,'source-layer':icon['source-layer'],
      minzoom:Math.max(DETECTION_LABEL_ZOOM, icon.minzoom || 0),
      layout:{'text-field':groups.size?match:'','text-font':['Arial Unicode MS Regular'],
        'text-size':11,'text-anchor':'top','text-offset':[0,1.1],'text-max-width':12,'text-padding':3,
        'text-allow-overlap':false,'text-ignore-placement':false},
      paint:{'text-color':'#16382a','text-halo-color':'#ffffff','text-halo-width':1.4,'text-halo-blur':.3},
    };
    if (filter) label.filter=filter;
    if (icon.maxzoom !== undefined) label.maxzoom=icon.maxzoom;
    if (icon.layout?.visibility) label.layout.visibility=icon.layout.visibility;
    layers.push(label);
    next.glyphs = next.glyphs || DETECTION_GLYPHS;
  } else if (next.glyphs === DETECTION_GLYPHS && !layers.some((layer:any)=>layer.layout?.['text-field']!==undefined)) delete next.glyphs;
  return next;
}
