#!/usr/bin/env node
'use strict';
/**
 * Places imagery choice clarity v6.58. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "imagery choice clarity 1",
              "before": "import { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryCaptureLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n",
              "after": "import { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryChoiceMeta } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n"
            },
            {
              "label": "imagery choice clarity 2",
              "before": "    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.className = 'mly-place-open mly-place-open-primary'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'mly-place-meta'; content.appendChild(status);\n    const alternatives = document.createElement('div'); content.appendChild(alternatives);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n",
              "after": "    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.className = 'mly-place-open mly-place-open-primary'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.className = 'mly-place-meta'; content.appendChild(status);\n    const alternatives = document.createElement('div'); content.appendChild(alternatives);\n    const visibility = document.createElement('p'); visibility.className = 'mly-place-choice-note'; visibility.textContent = 'Direction is estimated. Visibility isn’t confirmed.'; visibility.hidden = true; content.appendChild(visibility);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n"
            },
            {
              "label": "imagery choice clarity 3",
              "before": "      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found.length) {\n          candidate = found[0]; button.textContent = `Open imagery · about ${Math.ceil(candidate.distance)} m away`;\n          status.textContent = `${placeImageryDirectionLabel(candidate)} · ${placeImageryCaptureLabel(candidate)}. Visibility is not confirmed.`;\n          for (const [index, image] of found.slice(1, 3).entries()) {\n            const option = document.createElement('button'); option.type = 'button'; option.textContent = `Open option ${index + 2} · about ${Math.ceil(image.distance)} m away`;\n            option.className = 'mly-place-open';\n            option.onclick = () => { if (active()) this.host.openImagery(image); };\n            const detail = document.createElement('p'); detail.textContent = `${placeImageryDirectionLabel(image)} · ${placeImageryCaptureLabel(image)}`; detail.className = 'mly-place-meta';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther · within 250 m';\n",
              "after": "      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found.length) {\n          candidate = found[0]; button.textContent = `Suggested view · ${placeImageryDirectionLabel(candidate)}`;\n          button.setAttribute('aria-label', `Open suggested view: ${placeImageryDirectionLabel(candidate)}. ${placeImageryChoiceMeta(candidate)}`);\n          status.textContent = placeImageryChoiceMeta(candidate); status.className = 'mly-place-meta mly-place-choice-meta'; visibility.hidden = false;\n          for (const image of found.slice(1, 3)) {\n            const option = document.createElement('button'); option.type = 'button'; option.textContent = `Open view · ${placeImageryDirectionLabel(image)}`;\n            option.setAttribute('aria-label', `Open view: ${placeImageryDirectionLabel(image)}. ${placeImageryChoiceMeta(image)}`);\n            option.className = 'mly-place-open';\n            option.onclick = () => { if (active()) this.host.openImagery(image); };\n            const detail = document.createElement('p'); detail.textContent = placeImageryChoiceMeta(image); detail.className = 'mly-place-meta mly-place-choice-meta';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther · within 250 m';\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "imagery choice clarity 1",
              "before": "  return 'Captured ' + new Date(image.capturedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360° panorama · can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n}\n/** One local viewer read; the loaded SDK cameraType is authoritative, not Graph's is_pano flag. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (!Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n",
              "after": "  return 'Captured ' + new Date(image.capturedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing the place' : image.direction === 'panorama' ? 'Panorama' : image.direction === 'sideways' ? 'Side view' : image.direction === 'away' ? 'Facing away' : 'Direction unknown';\n}\n/** Straight-line distance and UTC capture day from the existing candidate only. */\nexport function placeImageryChoiceMeta(image: PlaceImagery): string {\n  const distance = Number.isFinite(image.distance) && image.distance >= 0 ? `About ${Math.ceil(image.distance)} m away` : 'Distance unknown';\n  return `${placeImageryCaptureLabel(image)} · ${distance}`;\n}\n/** One local viewer read; the loaded SDK cameraType is authoritative, not Graph's is_pano flag. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (!Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/placePopupStyles.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "imagery choice clarity 1",
              "before": "/** Style only imagery buttons; the popup shell and all other content use SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n`;\n",
              "after": "/** Neutral imagery controls and their metadata; the popup shell uses SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n`;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "imagery choice clarity 1",
              "before": " const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery · about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open option'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n",
              "after": " const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Suggested view · Direction unknown');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open view'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);assert.equal(options[0].textContent,'Open view · Panorama');assert.equal(view.popup.content.children.filter(x=>x.className==='mly-place-choice-note'&&!x.hidden).length,1);assert.match(view.popup.content.children.find(x=>x.className==='mly-place-meta mly-place-choice-meta').textContent,/Capture date unknown · About 32 m away/);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n"
            },
            {
              "label": "imagery choice clarity 2",
              "before": " const place={lon:0,lat:0},base={sequence:'s',geometry:{coordinates:[0,-.0004]},compass_angle:180};\n const computed={...base,id:'computed',computed_geometry:{coordinates:[0,.0004]},computed_compass_angle:180};assert.equal(nearby.choosePlaceImagery(place,[computed],75,distance).direction,'facing');\n const pano={...base,id:'pano',is_pano:true};assert.equal(nearby.choosePlaceImagery(place,[base,pano],75,distance).direction,'panorama');\n const closer={...base,id:'close',compass_angle:10,geometry:{coordinates:[0,-.0002]}};const farther={...base,id:'far',compass_angle:5};assert.equal(nearby.choosePlaceImagery(place,[farther,closer],75,distance).id,'close');\n assert.match(nearby.placeImageryDirectionLabel({direction:'facing'}),/Facing toward/);assert.match(nearby.placeImageryDirectionLabel({}),/unknown/);\n});\ntest('panorama orientation uses the opened camera position and never rotates stale or flat imagery',async()=>{\n let centered=null,reads=0;const image={id:'pano',direction:'panorama',placeLon:1,placeLat:0};const viewer={getImage:async()=>{reads++;return{id:'pano',cameraType:'spherical',originalCompassAngle:0,compassAngle:0,originalLngLat:{lng:0,lat:0}};},setCenter:p=>centered=p};\n const bearing=await nearby.facePlaceInPanorama(viewer,image,()=>true);assert.equal(bearing,90);assert.deepEqual(centered,[.75,.5]);centered=null;\n",
              "after": " const place={lon:0,lat:0},base={sequence:'s',geometry:{coordinates:[0,-.0004]},compass_angle:180};\n const computed={...base,id:'computed',computed_geometry:{coordinates:[0,.0004]},computed_compass_angle:180};assert.equal(nearby.choosePlaceImagery(place,[computed],75,distance).direction,'facing');\n const pano={...base,id:'pano',is_pano:true};assert.equal(nearby.choosePlaceImagery(place,[base,pano],75,distance).direction,'panorama');\n const closer={...base,id:'close',compass_angle:10,geometry:{coordinates:[0,-.0002]}};const farther={...base,id:'far',compass_angle:5};assert.equal(nearby.choosePlaceImagery(place,[farther,closer],75,distance).id,'close');\n assert.match(nearby.placeImageryDirectionLabel({direction:'facing'}),/Facing the place/);assert.match(nearby.placeImageryDirectionLabel({}),/unknown/);\n});\ntest('panorama orientation uses the opened camera position and never rotates stale or flat imagery',async()=>{\n let centered=null,reads=0;const image={id:'pano',direction:'panorama',placeLon:1,placeLat:0};const viewer={getImage:async()=>{reads++;return{id:'pano',cameraType:'spherical',originalCompassAngle:0,compassAngle:0,originalLngLat:{lng:0,lat:0}};},setCenter:p=>centered=p};\n const bearing=await nearby.facePlaceInPanorama(viewer,image,()=>true);assert.equal(bearing,90);assert.deepEqual(centered,[.75,.5]);centered=null;\n"
            },
            {
              "label": "imagery choice clarity 3",
              "before": "\ntest('changing a category after cache age still filters the displayed records locally',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'})]);await f.advance(120001);f.controller.setGroup('health');assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,1);assert.equal(f.displays.at(-1).places[0].group,'health');f.controller.dispose();\n});\n",
              "after": "\ntest('changing a category after cache age still filters the displayed records locally',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'})]);await f.advance(120001);f.controller.setGroup('health');assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,1);assert.equal(f.displays.at(-1).places[0].group,'health');f.controller.dispose();\n});\n\ntest('imagery choice labels preserve uncertain directions and compact existing metadata',()=>{\n for(const [direction,label] of [['facing','Facing the place'],['panorama','Panorama'],['sideways','Side view'],['away','Facing away'],['unknown','Direction unknown'],[undefined,'Direction unknown']]) assert.equal(nearby.placeImageryDirectionLabel({direction}),label);\n assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'Capture date unknown · About 33 m away');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^Captured .*2024 · About 0 m away$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Capture date unknown · Distance unknown');\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/OVERTURE-PLACES.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "imagery choice clarity 1",
              "before": "\n## v6.57 · Loaded category filters\n\nAll/Health/Education quick buttons and a compact category dropdown filter the same bounded, all-category viewport result locally. Counts describe loaded records (maximum 200), never service totals. Category changes do not query the service, restart pending work, or clear the selected place. Normal viewport refresh, cache expiry and retry retain existing idle/busy gates. A filtered subset may be empty even when the server has more matching records; zoom closer when the loaded result is limited. The published pilot groups remain unchanged; no Food or Shops data is implied.\n",
              "after": "\n## v6.57 · Loaded category filters\n\nAll/Health/Education quick buttons and a compact category dropdown filter the same bounded, all-category viewport result locally. Counts describe loaded records (maximum 200), never service totals. Category changes do not query the service, restart pending work, or clear the selected place. Normal viewport refresh, cache expiry and retry retain existing idle/busy gates. A filtered subset may be empty even when the server has more matching records; zoom closer when the loaded result is limited. The published pilot groups remain unchanged; no Food or Shops data is implied.\n\n## v6.58 · Clearer imagery choices\n\nThe first existing ranked image is labeled Suggested view; each button shows Facing the place, Panorama, Side view, Facing away or Direction unknown. A compact line underneath gives capture date and approximate straight-line distance. One shared note explains that direction is estimated and visibility is not confirmed. Neutral button styling and the SDK popup shell remain. Ranking, radius choices, explicit navigation, pending-click guards and stale-response cleanup are unchanged. No thumbnail, request, timer or background work is introduced.\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-imagery-choice-clarity-v6-58-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.58 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-imagery-choice-clarity-v6-58' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.58 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.58 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.58 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-imagery-choice-clarity-v6-58.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places imagery choice clarity v6.58 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'places-imagery-choice-clarity-v6-58', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Places imagery choice clarity v6.58 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
