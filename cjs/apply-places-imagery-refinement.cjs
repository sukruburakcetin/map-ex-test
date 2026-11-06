#!/usr/bin/env node
'use strict';
/**
 * Places imagery refinement. Compatible current v6 sources.
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
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Places imagery refinement 1",
              "before": "    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;\n    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat, cameraLon: computed[0], cameraLat: computed[1] };\n    if (typeof row.captured_at === 'number' && row.captured_at > 0 && Number.isFinite(new Date(row.captured_at).getTime())) candidate.capturedAt = row.captured_at;\n    candidates.push({ image: candidate, rank });\n  }\n  candidates.sort((a, b) => a.rank - b.rank || a.image.distance - b.image.distance || (b.image.capturedAt || 0) - (a.image.capturedAt || 0) || a.image.id.localeCompare(b.image.id));\n  const unique = new Set<string>();\n  const ranked = candidates.filter(candidate => { if (unique.has(candidate.image.id)) return false; unique.add(candidate.image.id); return true; });\n  if (!ranked.length) return [];\n  const grade = (rank: number) => rank <= 2 ? 0 : rank - 2;\n  const bestGrade = grade(ranked[0].rank), selected = [ranked[0].image];\n  const distinct = (image: PlaceImagery) => selected.every(previous => image.sequence !== previous.sequence ||\n    distance(image.cameraLat ?? image.lat, image.cameraLon ?? image.lon, previous.cameraLat ?? previous.lat, previous.cameraLon ?? previous.lon) >= 15 ||\n    (image.capturedAt != null && previous.capturedAt != null && Math.abs(image.capturedAt - previous.capturedAt) >= 86400000));\n",
              "after": "    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;\n    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat, cameraLon: computed[0], cameraLat: computed[1] };\n    if (typeof row.captured_at === 'number' && row.captured_at > 0 && Number.isFinite(new Date(row.captured_at).getTime())) candidate.capturedAt = row.captured_at;\n    candidates.push({ image: candidate, rank });\n  }\n  // Fixed 5m distance bands keep freshness a deterministic close-tie preference.\n  // Avoid a pairwise 'within 5m' comparator: it can produce non-transitive ordering.\n  candidates.sort((a, b) => a.rank - b.rank || Math.floor(a.image.distance / 5) - Math.floor(b.image.distance / 5) ||\n    (b.image.capturedAt || 0) - (a.image.capturedAt || 0) || a.image.distance - b.image.distance || a.image.id.localeCompare(b.image.id));\n  const unique = new Set<string>();\n  const ranked = candidates.filter(candidate => { if (unique.has(candidate.image.id)) return false; unique.add(candidate.image.id); return true; });\n  if (!ranked.length) return [];\n  const grade = (rank: number) => rank <= 2 ? 0 : rank - 2;\n  const bestGrade = grade(ranked[0].rank), selected = [ranked[0].image];\n  const distinct = (image: PlaceImagery) => selected.every(previous => image.sequence !== previous.sequence ||\n    distance(image.cameraLat ?? image.lat, image.cameraLon ?? image.lon, previous.cameraLat ?? previous.lat, previous.cameraLon ?? previous.lon) >= 15 ||\n    (image.capturedAt != null && previous.capturedAt != null && Math.abs(image.capturedAt - previous.capturedAt) >= 86400000));\n"
            },
            {
              "label": "Places imagery refinement 2",
              "before": "  return selected;\n}\n/** Compatibility helper for callers that only need the first result. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  return rankPlaceImagery(place, rows, radius, distance)[0] || null;\n}\nexport function placeImageryCaptureLabel(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  if (!image.capturedAt || !Number.isFinite(image.capturedAt) || !Number.isFinite(new Date(image.capturedAt).getTime())) return l10n.text(\"Capture date unknown\");\n  return l10n.text(\"Captured\") + \" \" + l10n.date(new Date(image.capturedAt),{ year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  return image.direction === 'facing' ? l10n.text(\"Facing the place\") : image.direction === 'panorama' ? l10n.text(\"Panorama\") : image.direction === 'sideways' ? l10n.text(\"Side view\") : image.direction === 'away' ? l10n.text(\"Facing away\") : l10n.text(\"Direction unknown\");\n}\n/** Straight-line distance and UTC capture day from the existing candidate only. */\nexport function placeImageryChoiceMeta(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  const distance = Number.isFinite(image.distance) && image.distance >= 0 ? l10n.text(\"About {value0} m away\",{value0:String(Math.ceil(image.distance))}) : l10n.text(\"Distance unknown\");\n  return `${placeImageryCaptureLabel(image, l10n)} \u00b7 ${distance}`;\n}\n/** One local viewer read; the loaded SDK cameraType is authoritative, not Graph's is_pano flag. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (!Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n  const opened = await viewer.getImage();\n  if (!current() || String(opened?.id) !== image.id || opened?.cameraType !== 'spherical') return null;\n  // SDK lngLat prefers computedLngLat, matching the reconstruction used by the viewer.\n  const valid = (point: any) => point && Number.isFinite(point.lng) && Number.isFinite(point.lat) && Math.abs(point.lng) <= 180 && Math.abs(point.lat) <= 90;\n",
              "after": "  return selected;\n}\n/** Compatibility helper for callers that only need the first result. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  return rankPlaceImagery(place, rows, radius, distance)[0] || null;\n}\nexport function placeImageryCaptureLabel(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  if (!image.capturedAt || !Number.isFinite(image.capturedAt) || !Number.isFinite(new Date(image.capturedAt).getTime())) return l10n.text(\"Capture date unknown\");\n  return l10n.text(\"Captured\") + \" \" + l10n.date(new Date(image.capturedAt),{ year: 'numeric', month: 'short', timeZone: 'UTC' });\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  return image.direction === 'facing' ? l10n.text(\"Facing the place\") : image.direction === 'panorama' ? l10n.text(\"Panorama\") : image.direction === 'sideways' ? l10n.text(\"Side view\") : image.direction === 'away' ? l10n.text(\"Facing away\") : l10n.text(\"Direction unknown\");\n}\n/** Straight-line distance and UTC capture day from the existing candidate only. */\nexport function placeImageryChoiceMeta(image: PlaceImagery, l10n: Presentation = englishPresentation): string {\n  const distance = Number.isFinite(image.distance) && image.distance >= 0 ? l10n.text(\"About {value0} m away\",{value0:l10n.number(Math.ceil(image.distance))}) : l10n.text(\"Distance unknown\");\n  return `${distance} \u00b7 ${placeImageryCaptureLabel(image, l10n)}`;\n}\n/** One local viewer read; the loaded SDK cameraType is authoritative, not Graph's is_pano flag. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (!Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n  const opened = await viewer.getImage();\n  if (!current() || String(opened?.id) !== image.id || opened?.cameraType !== 'spherical') return null;\n  // SDK lngLat prefers computedLngLat, matching the reconstruction used by the viewer.\n  const valid = (point: any) => point && Number.isFinite(point.lng) && Number.isFinite(point.lat) && Math.abs(point.lng) <= 180 && Math.abs(point.lat) <= 90;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Places imagery refinement 1",
              "before": "      if (!active() || button.disabled) return;\n      if (candidate) { this.host.openImagery(candidate); return; }\n      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;\n      button.disabled = true; this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"Looking within {value0} m\u2026\",{value0:String(radius)}));\n      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found.length) {\n          const suggested=found[0];candidate = suggested; this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Suggested view \u00b7 {value0}\",{value0:String(placeImageryDirectionLabel(suggested, this.l10n))}));\n          this.l10n.bindAttribute(button,'aria-label',()=>this.l10n.text(\"Open suggested view: {value0}. {value1}\",{value0:String(placeImageryDirectionLabel(suggested, this.l10n)),value1:String(placeImageryChoiceMeta(suggested, this.l10n))}));\n          this.l10n.bind(status,\"textContent\",()=>placeImageryChoiceMeta(suggested, this.l10n)); status.className = 'mly-place-meta mly-place-choice-meta'; visibility.hidden = false;\n          for (const image of found.slice(1, 3)) {\n            const option = document.createElement('button'); option.type = 'button'; this.l10n.bind(option,\"textContent\",()=>this.l10n.text(\"Open view \u00b7 {value0}\",{value0:String(placeImageryDirectionLabel(image, this.l10n))}));\n            this.l10n.bindAttribute(option,'aria-label',()=>this.l10n.text(\"Open view: {value0}. {value1}\",{value0:String(placeImageryDirectionLabel(image, this.l10n)),value1:String(placeImageryChoiceMeta(image, this.l10n))}));\n            option.className = 'mly-place-open';\n            option.onclick = () => { if (active()) this.host.openImagery(image); };\n            const detail = document.createElement('p'); this.l10n.bind(detail,\"textContent\",()=>placeImageryChoiceMeta(image, this.l10n)); detail.className = 'mly-place-meta mly-place-choice-meta';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Search within 250 m\"));\n          this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"No nearby imagery found within 75 m. Search a wider area if you\u2019d like.\"));\n        } else {\n          this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Search again \u00b7 within 250 m\")); this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"No suitable imagery found within 250 m. Try another place or search again later.\"));\n        }\n",
              "after": "      if (!active() || button.disabled) return;\n      if (candidate) { this.host.openImagery(candidate); return; }\n      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;\n      button.disabled = true; this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"Looking within {value0} m\u2026\",{value0:String(radius)}));\n      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found.length) {\n          const suggested=found[0];candidate = suggested; this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Suggested view \u00b7 {value0}\",{value0:String(placeImageryDirectionLabel(suggested, this.l10n))}).replace(\" \u00b7 \",\"\\n\"));\n          this.l10n.bindAttribute(button,'aria-label',()=>this.l10n.text(\"Open suggested view: {value0}. {value1}\",{value0:String(placeImageryDirectionLabel(suggested, this.l10n)),value1:String(placeImageryChoiceMeta(suggested, this.l10n))}));\n          this.l10n.bind(status,\"textContent\",()=>placeImageryChoiceMeta(suggested, this.l10n)); status.className = 'mly-place-meta mly-place-choice-meta'; this.l10n.bind(status,'title',()=>this.l10n.text('Approximate straight-line distance, not walking distance or visibility')); visibility.hidden = false;\n          for (const image of found.slice(1, 3)) {\n            const option = document.createElement('button'); option.type = 'button'; this.l10n.bind(option,\"textContent\",()=>this.l10n.text(\"Open view \u00b7 {value0}\",{value0:String(placeImageryDirectionLabel(image, this.l10n))}).replace(\" \u00b7 \",\"\\n\"));\n            this.l10n.bindAttribute(option,'aria-label',()=>this.l10n.text(\"Open view: {value0}. {value1}\",{value0:String(placeImageryDirectionLabel(image, this.l10n)),value1:String(placeImageryChoiceMeta(image, this.l10n))}));\n            option.className = 'mly-place-open';\n            option.onclick = () => { if (active()) this.host.openImagery(image); };\n            const detail = document.createElement('p'); this.l10n.bind(detail,\"textContent\",()=>placeImageryChoiceMeta(image, this.l10n)); detail.className = 'mly-place-meta mly-place-choice-meta'; this.l10n.bind(detail,'title',()=>this.l10n.text('Approximate straight-line distance, not walking distance or visibility'));\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Search within 250 m\"));\n          this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"No nearby imagery found within 75 m. Search a wider area if you\u2019d like.\"));\n        } else {\n          this.l10n.bind(button,\"textContent\",()=>this.l10n.text(\"Search again \u00b7 within 250 m\")); this.l10n.bind(status,\"textContent\",()=>this.l10n.text(\"No suitable imagery found within 250 m. Try another place or search again later.\"));\n        }\n"
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
              "label": "Places imagery refinement 1",
              "before": "/** Neutral imagery controls, overlap rows and their metadata; the popup shell uses SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup button.mly-place-group-row{display:flex;align-items:center;gap:8px;min-height:46px;margin-top:6px;padding:7px 9px}\n.mly-place-popup .mly-place-group-row img{flex-shrink:0}\n",
              "after": "/** Neutral imagery controls, overlap rows and their metadata; the popup shell uses SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:pre-line;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup button.mly-place-group-row{display:flex;align-items:center;gap:8px;min-height:46px;margin-top:6px;padding:7px 9px}\n.mly-place-popup .mly-place-group-row img{flex-shrink:0}\n"
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
              "label": "Places imagery refinement 1",
              "before": " class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);assert.equal(owner.hoverLabel(listed[0]),'<img onerror=evil()> \u00b7 school');const originalSymbol=layers[0].items[0].symbol;owner.setHover('gers-1');assert.notEqual(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Suggested view \u00b7 Direction unknown');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open view'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);assert.equal(options[0].textContent,'Open view \u00b7 Panorama');assert.equal(view.popup.content.children.filter(x=>x.className==='mly-place-choice-note'&&!x.hidden).length,1);assert.match(view.popup.content.children.find(x=>x.className==='mly-place-meta mly-place-choice-meta').textContent,/Capture date unknown \u00b7 About 32 m away/);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n global.window={requestIdleCallback(work,options){captured={work,options};return 42;},cancelIdleCallback(id){cancelled=id;}};global.document={addEventListener(){},removeEventListener(){}};\n let owner;try{owner=new ArcGISPlaces({id:'deadline',url:'https://host/FeatureServer/0',modules:{},view:()=>null,geographic:x=>x,busy:()=>false,status(){},explore(){}});let ran=false;const handle=owner.controller.host.idle(()=>ran=true);assert.equal(captured.options.timeout,1500);assert.equal(ran,false);owner.controller.host.cancelIdle(handle);assert.equal(cancelled,42);}finally{owner?.dispose();global.window=oldWindow;global.document=oldDocument;}\n});\n",
              "after": " class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);assert.equal(owner.hoverLabel(listed[0]),'<img onerror=evil()> \u00b7 school');const originalSymbol=layers[0].items[0].symbol;owner.setHover('gers-1');assert.notEqual(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Suggested view\\nDirection unknown');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open view'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);assert.equal(options[0].textContent,'Open view\\nPanorama');assert.equal(view.popup.content.children.filter(x=>x.className==='mly-place-choice-note'&&!x.hidden).length,1);assert.match(view.popup.content.children.find(x=>x.className==='mly-place-meta mly-place-choice-meta').textContent,/About 32 m away \u00b7 Capture date unknown/);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n global.window={requestIdleCallback(work,options){captured={work,options};return 42;},cancelIdleCallback(id){cancelled=id;}};global.document={addEventListener(){},removeEventListener(){}};\n let owner;try{owner=new ArcGISPlaces({id:'deadline',url:'https://host/FeatureServer/0',modules:{},view:()=>null,geographic:x=>x,busy:()=>false,status(){},explore(){}});let ran=false;const handle=owner.controller.host.idle(()=>ran=true);assert.equal(captured.options.timeout,1500);assert.equal(ran,false);owner.controller.host.cancelIdle(handle);assert.equal(cancelled,42);}finally{owner?.dispose();global.window=oldWindow;global.document=oldDocument;}\n});\n"
            },
            {
              "label": "Places imagery refinement 2",
              "before": "});\n\ntest('changing a category after cache age still filters the displayed records locally',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'})]);await f.advance(120001);f.controller.setGroup('health');assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,1);assert.equal(f.displays.at(-1).places[0].group,'health');f.controller.dispose();\n});\n\ntest('imagery choice labels preserve uncertain directions and compact existing metadata',()=>{\n for(const [direction,label] of [['facing','Facing the place'],['panorama','Panorama'],['sideways','Side view'],['away','Facing away'],['unknown','Direction unknown'],[undefined,'Direction unknown']]) assert.equal(nearby.placeImageryDirectionLabel({direction}),label);\n assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'Capture date unknown \u00b7 About 33 m away');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^Captured .*2024 \u00b7 About 0 m away$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Capture date unknown \u00b7 Distance unknown');\n});\n\ntest('Back to place centers either map mode without touching imagery or selection',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToSelectedPlace').getText(sf);const Runtime=new Function(compile('class Runtime{'+member+'}\\nreturn Runtime;'))();\n for(const type of ['2d','3d']) {\n  const w=new Runtime(),place={id:'poi',lon:-86.13,lat:39.78},view={ready:true,destroyed:false,type,zoom:13};let calls=0;\n  w.state=Object.freeze({placesActive:true,selectedPlace:place,jimuMapView:{view}});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};\n  w.setState=()=>{throw Error('must retain state')};w.openPlaceImagery=()=>{throw Error('must not navigate imagery')};\n",
              "after": "});\n\ntest('changing a category after cache age still filters the displayed records locally',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'})]);await f.advance(120001);f.controller.setGroup('health');assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,1);assert.equal(f.displays.at(-1).places[0].group,'health');f.controller.dispose();\n});\n\ntest('imagery choice labels preserve uncertain directions and compact existing metadata',()=>{\n for(const [direction,label] of [['facing','Facing the place'],['panorama','Panorama'],['sideways','Side view'],['away','Facing away'],['unknown','Direction unknown'],[undefined,'Direction unknown']]) assert.equal(nearby.placeImageryDirectionLabel({direction}),label);\n assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'About 33 m away \u00b7 Capture date unknown');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^About 0 m away \u00b7 Captured .*2024$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Distance unknown \u00b7 Capture date unknown');\n});\n\ntest('Back to place centers either map mode without touching imagery or selection',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToSelectedPlace').getText(sf);const Runtime=new Function(compile('class Runtime{'+member+'}\\nreturn Runtime;'))();\n for(const type of ['2d','3d']) {\n  const w=new Runtime(),place={id:'poi',lon:-86.13,lat:39.78},view={ready:true,destroyed:false,type,zoom:13};let calls=0;\n  w.state=Object.freeze({placesActive:true,selectedPlace:place,jimuMapView:{view}});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};\n  w.setState=()=>{throw Error('must retain state')};w.openPlaceImagery=()=>{throw Error('must not navigate imagery')};\n"
            },
            {
              "label": "Places imagery refinement 3",
              "before": " focus.open(view,{content},null,()=>started++);focus.cancel();resolve();await flush();assert.equal(started,1);\n});\ntest('place drafts preserve mapped position and title and publish only after an explicit shared save',()=>{\n const {FieldNoteDraft}=load('src/features/field-notes/FieldNoteDraft.ts');let state={fieldNotes:[],imageId:'unrelated-image',pendingFieldNote:null},saved=0,published=0;\n const d=new FieldNoteDraft({readState:()=>state,setState:(p,done)=>{Object.assign(state,typeof p==='function'?p(state):p);done?.();},drawRipple(){},drawPending(){},clearPending(){},persist(){saved++;},drawMapNotes(){},updateViewerNotes(){},publish(){published++;},notify(){},now:()=>1,random:()=>.2});\n const place={id:'p',name:'School',lon:2,lat:3};d.openPlace(place,'local','Overture ID: p');assert.equal(saved,0);assert.equal(state.pendingFieldNote.imageId,null);assert.equal(state.pendingFieldNote.initialDescription,'Overture ID: p');d.submit('Other','Overture ID: p');assert.equal(published,0);assert.equal(saved,1);assert.equal(state.fieldNotes[0].title,'School');assert.equal(state.fieldNotes[0].lon,2);assert.equal(state.fieldNotes[0].lat,3);assert.equal(state.fieldNotes[0].source,'manual');assert.equal(state.fieldNotes[0].imageId,null);\n d.openPlace(place,'enterprise','Overture ID: p');assert.equal(published,0);d.submit('Other','Overture ID: p',true);assert.equal(published,1);\n});\n",
              "after": " focus.open(view,{content},null,()=>started++);focus.cancel();resolve();await flush();assert.equal(started,1);\n});\ntest('place drafts preserve mapped position and title and publish only after an explicit shared save',()=>{\n const {FieldNoteDraft}=load('src/features/field-notes/FieldNoteDraft.ts');let state={fieldNotes:[],imageId:'unrelated-image',pendingFieldNote:null},saved=0,published=0;\n const d=new FieldNoteDraft({readState:()=>state,setState:(p,done)=>{Object.assign(state,typeof p==='function'?p(state):p);done?.();},drawRipple(){},drawPending(){},clearPending(){},persist(){saved++;},drawMapNotes(){},updateViewerNotes(){},publish(){published++;},notify(){},now:()=>1,random:()=>.2});\n const place={id:'p',name:'School',lon:2,lat:3};d.openPlace(place,'local','Overture ID: p');assert.equal(saved,0);assert.equal(state.pendingFieldNote.imageId,null);assert.equal(state.pendingFieldNote.initialDescription,'Overture ID: p');d.submit('Other','Overture ID: p');assert.equal(published,0);assert.equal(saved,1);assert.equal(state.fieldNotes[0].title,'School');assert.equal(state.fieldNotes[0].lon,2);assert.equal(state.fieldNotes[0].lat,3);assert.equal(state.fieldNotes[0].source,'manual');assert.equal(state.fieldNotes[0].imageId,null);\n d.openPlace(place,'enterprise','Overture ID: p');assert.equal(published,0);d.submit('Other','Overture ID: p',true);assert.equal(published,1);\n});\ntest('freshness breaks only similar-direction and fixed 5m distance-band ties',()=>{\n const place={lon:0,lat:0},row=(id,m,heading,date)=>({id,sequence:id,geometry:{coordinates:[0,-m/111195]},compass_angle:heading,captured_at:date});\n const old=1704067200000,recent=1735689600000;\n assert.equal(nearby.choosePlaceImagery(place,[row('old-near',21,0,old),row('new-near',23,0,recent)],75,distance).id,'new-near');\n assert.equal(nearby.choosePlaceImagery(place,[row('old-close',16,0,old),row('new-far',24,0,recent)],75,distance).id,'old-close');\n assert.equal(nearby.choosePlaceImagery(place,[row('old-facing',50,0,old),row('new-away',5,180,recent)],75,distance).id,'old-facing');\n assert.equal(nearby.choosePlaceImagery(place,[row('known',23,0,recent),row('undated',21,0,null)],75,distance).id,'known');\n const rows=[row('a',21,0,old),row('b',23,0,recent),row('c',24,0,null),row('d',30,0,recent)];\n const expected=nearby.rankPlaceImagery(place,rows,75,distance).map(i=>i.id);assert.deepEqual(nearby.rankPlaceImagery(place,[...rows].reverse(),75,distance).map(i=>i.id),expected);\n});\ntest('suggestion metadata is distance-first, compact and uses locale number formatting',()=>{\n const base=load('src/i18n/PresentationText.ts').englishPresentation;\n const l10n={...base,number:value=>'n'+value};\n const text=nearby.placeImageryChoiceMeta({distance:24.2,capturedAt:1735689600000},l10n);\n assert.equal(text,'About n25 m away \u00b7 Captured Jan 2025');assert(!text.includes('Jan 1,'));\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/placesImagerySuggestions.browser.cjs",
      "content": "/** Actual popup DOM and CSS at mobile/desktop widths; ArcGIS popup shell is controlled. */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst root=path.resolve(__dirname,'../src'),modules={};\nfunction bundle(rel){if(modules[rel])return;const code=ts.transpileModule(fs.readFileSync(path.join(root,rel),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;modules[rel]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(!id.startsWith('.'))throw Error(id);const base=path.posix.normalize(path.posix.join(path.posix.dirname(rel),id));const target=base+'.ts';modules[rel].deps[id]=target;bundle(target);}}\nbundle('features/places/ArcGISPlaces.ts');\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [240,393,800]){const page=await browser.newPage({viewport:{width,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<style>body{margin:0;font:12px Arial}#popup{box-sizing:border-box;width:min(300px,100%);padding:10px}</style><main id=\"popup\"></main>');await page.evaluate(modules=>{\n const cache={};function load(name){if(cache[name])return cache[name];const m={exports:{}};cache[name]=m.exports;const def=modules[name];new Function('require','module','exports',def.code)(id=>load(def.deps[id]),m,m.exports);return m.exports;}\n class Value{constructor(p){Object.assign(this,p);}}class Layer extends Value{constructor(p){super(p);this.visible=true;}removeAll(){this.items=[];}addMany(items){this.items=items;this.graphics={toArray:()=>this.items};}destroy(){}}\n window.calls=[];window.searches=0;window.view={ready:true,type:'2d',zoom:17,stationary:true,toScreen:()=>({x:30,y:30}),map:{add(){},remove(){}},ui:{add(){},remove(){}},watch(){return{remove(){}};},openPopup(options){this.popup={...options,visible:true};document.getElementById('popup').replaceChildren(options.content);},closePopup(){this.popup=null;document.getElementById('popup').replaceChildren();}};\n const {ArcGISPlaces}=load('features/places/ArcGISPlaces.ts');window.owner=new ArcGISPlaces({id:'test',url:'https://example.com/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>false,status(){},explore:async()=>{searches++;return[{id:'first',sequence:'s1',lon:0,lat:0,distance:24,capturedAt:1735689600000,direction:'facing',radius:75},{id:'second',sequence:'s2',lon:0,lat:0,distance:38,direction:'panorama',radius:75},{id:'third',sequence:'s3',lon:0,lat:0,distance:45,direction:'unknown',radius:75}]},openImagery:image=>calls.push(image.id)});\n owner.controller.host.display([{id:'p1',name:'Library',category:'library',group:'education',lon:0,lat:0,address:'Main Street',website:'',release:''}],view);owner.open([],'p1',true,'card');\n },modules);\n await page.getByRole('button',{name:/Open suggested view:/}).waitFor();assert.equal(await page.evaluate(()=>searches),1);checks++;\n const first=page.locator('.mly-place-open-primary');assert.equal(await first.innerText(),'Suggested view\\nFacing the place');assert.equal(await page.locator('.mly-place-choice-meta').first().innerText(),'About 24 m away \u00b7 Captured Jan 2025');assert.match(await page.locator('.mly-place-choice-meta').first().getAttribute('title'),/straight-line/i);checks++;\n assert(await page.getByText('Direction is estimated. Visibility isn\u2019t confirmed.',{exact:true}).isVisible());assert.match(await page.getByRole('button',{name:/Open view: Panorama/}).getAttribute('aria-label'),/Capture date unknown/);assert.match(await page.getByRole('button',{name:/Open view: Direction unknown/}).innerText(),/Direction unknown/);checks++;\n assert.equal(await page.locator('.mly-place-popup').evaluate(e=>e.scrollWidth<=e.clientWidth),true);assert.equal(await first.evaluate(e=>getComputedStyle(e).whiteSpace),'pre-line');checks++;\n await first.click();await page.getByRole('button',{name:/Open view: Panorama/}).click();assert.deepEqual(await page.evaluate(()=>calls),['first','second']);assert.equal(await page.evaluate(()=>searches),1);checks++;\n await page.evaluate(()=>{window.oldOption=document.querySelectorAll('.mly-place-open')[1];view.popup={content:document.createElement('div')};oldOption.click();owner.dispose();});assert.deepEqual(await page.evaluate(()=>calls),['first','second']);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' imagery suggestion Chromium checks passed at 240, 393 and 800px.');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-imagery-refinement-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-imagery-refinement' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-imagery-refinement.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places imagery refinement is already installed. No files changed.');
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
  const manifest = { installer: 'places-imagery-refinement', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places imagery refinement ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
