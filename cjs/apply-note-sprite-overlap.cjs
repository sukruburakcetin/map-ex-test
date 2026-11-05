#!/usr/bin/env node
'use strict';
/**
 * Note sprite overlap confirmation. Compatible current v6 sources.
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
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note sprite overlap 1",
              "before": "import { PointCloudViewerRenderer } from '../features/point-cloud/PointCloudViewerRenderer';\nimport type { PointCloudResult, PointCloudPoint } from \"../utils/pointCloudUtils\";\nimport { decodeAndNormalizeGeometry, getDetectionColor } from \"../utils/mapillaryDetections\";\nimport { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';\nimport { DetectionNoteAction } from '../features/detections/DetectionNoteAction';\nimport { attachmentMetadata, captureDetectionCrop, storeDetectionCrop, readDetectionCrop, deleteDetectionCrop } from '../features/detections/detectionImageAttachment';\nimport { validDetectionNoteLocation, mappedDetectionLocation } from '../features/detections/detectionNote';\nimport type { DetectionNoteSelection, DetectionNoteDestination, DetectionContributionSeed } from '../features/detections/detectionNote';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport { defaultDetectionExplorer, detectionGroup, showDetection } from '../features/detections/detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from '../features/detections/detectionExploration';\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\n",
              "after": "import { PointCloudViewerRenderer } from '../features/point-cloud/PointCloudViewerRenderer';\nimport type { PointCloudResult, PointCloudPoint } from \"../utils/pointCloudUtils\";\nimport { decodeAndNormalizeGeometry, getDetectionColor } from \"../utils/mapillaryDetections\";\nimport { createYearBasedRenderer, YEAR_COLOR_PALETTE } from \"../utils/mapillaryRenderers\";\nimport { loadImage, cropSpriteImage, processInChunks } from \"../utils/spriteUtils\";\nimport { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';\nimport { DetectionNoteAction } from '../features/detections/DetectionNoteAction';\nimport { createNoteObjectChoice, deferNoteObjectPopup } from '../features/detections/NoteObjectChoice';\nimport { attachmentMetadata, captureDetectionCrop, storeDetectionCrop, readDetectionCrop, deleteDetectionCrop } from '../features/detections/detectionImageAttachment';\nimport { validDetectionNoteLocation, mappedDetectionLocation } from '../features/detections/detectionNote';\nimport type { DetectionNoteSelection, DetectionNoteDestination, DetectionContributionSeed } from '../features/detections/detectionNote';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport { defaultDetectionExplorer, detectionGroup, showDetection } from '../features/detections/detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from '../features/detections/detectionExploration';\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\n"
            },
            {
              "label": "Note sprite overlap 2",
              "before": "    layer.visible = true;\n    const code = this._mapFeatureFilterCodes.get(kind);\n    if (code) { if (signs) this.filterTrafficSignsVTLayer(code); else this.filterObjectsVTLayer(code); }\n    void this.applyMapFeatureSpriteScale(kind);\n    this.enforceMapillaryLayerOrder(view);\n  }\n\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {\n    const stationary = () => view.stationary !== false;\n    // SceneView can report 13.99999 for a settled zoom-14 target.\n    if (view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;\n    const radius = 12;\n    const ground = view.toMap(screen) as __esri.Point;\n    if (!ground) return null;\n    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));\n",
              "after": "    layer.visible = true;\n    const code = this._mapFeatureFilterCodes.get(kind);\n    if (code) { if (signs) this.filterTrafficSignsVTLayer(code); else this.filterObjectsVTLayer(code); }\n    void this.applyMapFeatureSpriteScale(kind);\n    this.enforceMapillaryLayerOrder(view);\n  }\n\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private openPickedMapDetection(feature:any) {\n    this._selectedMapFeature=feature;\n    const attrs=feature.graphic.attributes,featureId=attrs.id||attrs.value;\n    const geoPt=webMercatorUtils.webMercatorToGeographic(feature.graphic.geometry) as __esri.Point;\n    this.drawPoint(geoPt.longitude,geoPt.latitude);\n    void this.fetchAlternateImages(featureId,geoPt.latitude,geoPt.longitude);\n  }\n  private offerNoteObjectChoice(view:__esri.MapView|__esri.SceneView,graphic:__esri.Graphic,openNote:()=>void,current:()=>boolean):boolean {\n    if(!(this.state.trafficSignsActive||this.state.objectsActive))return false;\n    let content:HTMLElement;\n    const choiceCurrent=()=>current()&&(!view.popup||(view.popup.visible&&view.popup.content===content));\n    content=createNoteObjectChoice(document,source=>this._owned(source),()=>{if(!choiceCurrent())return;view.closePopup();openNote();},async()=>{\n      if(!choiceCurrent()||!(this.state.trafficSignsActive||this.state.objectsActive))return false;\n      const screen=view.toScreen(graphic.geometry as __esri.Point);\n      if(!screen||!Number.isFinite(screen.x)||!Number.isFinite(screen.y)||screen.x<0||screen.y<0||screen.x>view.width||screen.y>view.height)return false;\n      this._mapFeatureClickAbort?.abort();const controller=new AbortController();this._mapFeatureClickAbort=controller;\n      const picked=await this.pickMapFeature({x:screen.x,y:screen.y},view,controller.signal);\n      if(!choiceCurrent()||controller.signal.aborted||!picked?.graphic)return false;\n      view.closePopup();this.openPickedMapDetection(picked);return true;\n    },choiceCurrent);\n    view.openPopup({title:this._owned('Note and map objects'),content,location:graphic.geometry as __esri.Point});return true;\n  }\n\n  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {\n    const stationary = () => view.stationary !== false;\n    // SceneView can report 13.99999 for a settled zoom-14 target.\n    if (view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;\n    const radius = 12;\n    const ground = view.toMap(screen) as __esri.Point;\n    if (!ground) return null;\n    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));\n"
            },
            {
              "label": "Note sprite overlap 3",
              "before": "      // Stop the automatic popup click synchronously, before the first hit-test await.\n      // The captured ID survives an unrestricted SDK hit test omitting this small marker.\n      const placesOwnerAtClick = this.state.placesActive ? this._places : null;\n      const placeTargetAtClick = placesOwnerAtClick?.screenTarget(evt) || null;\n      if (placeTargetAtClick) evt.stopPropagation();\n      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const response = await coverageClickHitTest(!!pointPreviewAtClick, {\n          sharedNotes: !!this._sharedNotesLayer || this._fieldNoteMap.hasPickTargets,\n          pointCloud: !!this._pointCloudMapLayer?.layer,\n          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n        }, () => view.hitTest(evt));\n        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n            if (event.action.id === \"enterprise-note-attachments\" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) void this.openFieldNoteAttachments(view.popup.selectedFeature);\n            if (event.action.id === \"edit-enterprise-note\" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) {\n              void this.openSharedFieldNoteEditor(view.popup.selectedFeature);\n            }\n          }) || null;\n          return;\n        }\n\n\n        // Note clicks select the same highlight as Show on map without moving the camera.\n        const noteHit = response.results.find((result: any) => result.graphic && this._fieldNoteMap.noteForGraphic(result.graphic));\n        if (noteHit && (noteHit as any).graphic) {\n          const graphic = (noteHit as any).graphic;\n          const note = this._fieldNoteMap.noteForGraphic(graphic);\n          if (note) void this._fieldNoteMap.focusNote(note).catch(() => {});\n          return;\n        }\n\n        if (this._pointCloudHits.route(response.results)) return;\n\n        // A direct Places marker hit opens local details before coverage's wider pick radius.\n        // Route/annotation modes, shared notes and point-cloud tools retain priority.\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        if (this.state.placesActive && this._places === placesOwnerAtClick && this.showPlacesHit(response.results, placeTargetAtClick)) return;\n",
              "after": "      // Stop the automatic popup click synchronously, before the first hit-test await.\n      // The captured ID survives an unrestricted SDK hit test omitting this small marker.\n      const placesOwnerAtClick = this.state.placesActive ? this._places : null;\n      const placeTargetAtClick = placesOwnerAtClick?.screenTarget(evt) || null;\n      if (placeTargetAtClick) evt.stopPropagation();\n      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const responsePromise = coverageClickHitTest(!!pointPreviewAtClick, {\n          sharedNotes: !!this._sharedNotesLayer || this._fieldNoteMap.hasPickTargets,\n          pointCloud: !!this._pointCloudMapLayer?.layer,\n          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n        }, () => view.hitTest(evt));\n        if(typeof (evt as any).defer==='function'&&(this.state.trafficSignsActive||this.state.objectsActive)&&(this._sharedNotesLayer||this._fieldNoteMap.hasPickTargets)){\n          deferNoteObjectPopup(evt as any,responsePromise,hit=>hit.results.some((result:any)=>\n            (!!this._sharedNotesLayer&&(result.layer||result.graphic?.layer)===this._sharedNotesLayer)||\n            (result.graphic&&!!this._fieldNoteMap.noteForGraphic(result.graphic))),clickCurrent);\n        }\n        const response=await responsePromise;\n        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          const openEnterpriseNote=()=>{\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n            if (event.action.id === \"enterprise-note-attachments\" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) void this.openFieldNoteAttachments(view.popup.selectedFeature);\n            if (event.action.id === \"edit-enterprise-note\" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) {\n              void this.openSharedFieldNoteEditor(view.popup.selectedFeature);\n            }\n          }) || null;\n          };\n          if((this.state.trafficSignsActive||this.state.objectsActive)&&this.offerNoteObjectChoice(view,(enterpriseNoteHit as any).graphic,openEnterpriseNote,clickCurrent))return;\n          openEnterpriseNote();return;\n        }\n\n\n        // Note clicks select the same highlight as Show on map without moving the camera.\n        const noteHit = response.results.find((result: any) => result.graphic && this._fieldNoteMap.noteForGraphic(result.graphic));\n        if (noteHit && (noteHit as any).graphic) {\n          const graphic = (noteHit as any).graphic;\n          const note = this._fieldNoteMap.noteForGraphic(graphic);\n          const openNote=()=>{if(note)void this._fieldNoteMap.focusNote(note).catch(()=>{});};\n          if(note&&(this.state.trafficSignsActive||this.state.objectsActive)&&this.offerNoteObjectChoice(view,graphic,()=>{openNote();const popupGraphic=graphic.clone();popupGraphic.attributes={...popupGraphic.attributes,note:attachmentMetadata(note.note).text};view.openPopup({features:[popupGraphic],location:graphic.geometry});},clickCurrent))return;\n          openNote();return;\n        }\n\n        if (this._pointCloudHits.route(response.results)) return;\n\n        // A direct Places marker hit opens local details before coverage's wider pick radius.\n        // Route/annotation modes, shared notes and point-cloud tools retain priority.\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        if (this.state.placesActive && this._places === placesOwnerAtClick && this.showPlacesHit(response.results, placeTargetAtClick)) return;\n"
            },
            {
              "label": "Note sprite overlap 4",
              "before": "\n        this._mapFeatureClickAbort?.abort();\n        const featureController = new AbortController(); this._mapFeatureClickAbort = featureController;\n        // Native detection tiles need a local pick only while a detection mode is active.\n        const selectedFeature = featureHit || (this.state.objectsActive || this.state.trafficSignsActive\n          ? await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);\n        if (!clickCurrent() || featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this._selectedMapFeature = selectedFeature;\n          const attrs = (selectedFeature as any).graphic.attributes;\n          const featureId = attrs.id || attrs.value; // Mapillary usually uses 'id' for the feature ID\n\n          // Get feature coordinates\n          const geoPt = webMercatorUtils.webMercatorToGeographic((selectedFeature as any).graphic.geometry) as __esri.Point;\n\n          // 1. Highlight the feature (Optional: Draw a specific marker for the selected object)\n          this.drawPoint(geoPt.longitude, geoPt.latitude);\n\n          // 2. Fetch alternates\n          this.fetchAlternateImages(featureId, geoPt.latitude, geoPt.longitude);\n\n          // Stop here so we don't trigger the \"nearest sequence\" search\n          return;\n        }\n\n        // 3. Turbo Coverage (Get ALL overlapping hits instead of just one)\n        let turboHits = response.results.filter((r: any) => {\n          const layer = r.layer || (r.graphic && r.graphic.layer);\n",
              "after": "\n        this._mapFeatureClickAbort?.abort();\n        const featureController = new AbortController(); this._mapFeatureClickAbort = featureController;\n        // Native detection tiles need a local pick only while a detection mode is active.\n        const selectedFeature = featureHit || (this.state.objectsActive || this.state.trafficSignsActive\n          ? await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);\n        if (!clickCurrent() || featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this.openPickedMapDetection(selectedFeature);\n\n          // Stop here so we don't trigger the \"nearest sequence\" search\n          return;\n        }\n\n        // 3. Turbo Coverage (Get ALL overlapping hits instead of just one)\n        let turboHits = response.results.filter((r: any) => {\n          const layer = r.layer || (r.graphic && r.graphic.layer);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/detections/NoteObjectChoice.ts",
      "content": "/** Overlapping map targets need explicit intent; do not fetch detection tiles merely to open a note. */\nexport function createNoteObjectChoice(document:Document,text:(source:string)=>string,openNote:()=>void,explore:()=>Promise<boolean>,current:()=>boolean):HTMLElement {\n const root=document.createElement('div');Object.assign(root.style,{display:'grid',gap:'8px',fontSize:'12px',lineHeight:'1.4'});\n root.onpointerdown=event=>event.stopPropagation();\n const status=document.createElement('span');status.setAttribute('role','status');status.textContent=text('A note is at this location. Choose what to open.');root.appendChild(status);\n const button=(label:string)=>{const element=document.createElement('button');element.type='button';element.textContent=text(label);Object.assign(element.style,{padding:'7px 10px',minHeight:'32px',border:'1px solid #648b73',borderRadius:'5px',background:'#214233',color:'#e1eee5',fontSize:'12px',cursor:'pointer',textAlign:'start'});root.appendChild(element);return element;};\n const note=button('Open field note'),object=button('Explore sign/object here');\n note.onclick=event=>{event.preventDefault();event.stopPropagation();if(current())openNote();};\n object.onclick=async event=>{event.preventDefault();event.stopPropagation();if(!current()||object.disabled)return;object.disabled=true;status.textContent=text('Finding sign/object\u2026');try{const found=await explore();if(current()&&!found)status.textContent=text('No active sign or object was found here. You can still open the note.');}catch{if(current())status.textContent=text('The sign/object could not be opened. Try again.');}finally{object.disabled=false;}};\n return root;\n}\n/** Keep the SDK's automatic popup from replacing the chooser after async hit testing.\n * ArcGIS 4.33+ supports event.defer; unrelated layer clicks keep normal propagation. */\nexport function deferNoteObjectPopup<R>(event:{defer?:(work:()=>Promise<void>)=>void;stopPropagation:()=>void},response:Promise<R>,hasNote:(hit:R)=>boolean,current:()=>boolean):void {\n if(typeof event.defer!=='function')return;\n event.defer(async()=>{try{const hit=await response;if(current()&&hasNote(hit))event.stopPropagation();}catch{/* The main click handler owns hit-test errors. */}});\n}\n"
    },
    {
      "file": "tests/noteObjectChoice.browser.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst src=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),methods=['openPickedMapDetection','offerNoteObjectChoice'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const type of ['2d','3d']){const page=await browser.newPage({viewport:{width:393,height:700}});await page.setContent('<div id=\"popup\"></div>');await page.evaluate(({helper,runtime,type})=>{const m={exports:{}};new Function('module','exports',helper)(m,m.exports);const Runtime=new Function('createNoteObjectChoice','webMercatorUtils',runtime)(m.exports.createNoteObjectChoice,{webMercatorToGeographic:geometry=>geometry});window.calls=[];window.current=true;window.pending=false;window.resolvePick=null;window.found=true;window.pixel={x:120,y:160};window.view={type,width:393,height:600,toScreen:()=>pixel,openPopup:props=>{view.popup={visible:true,content:props.content};document.getElementById('popup').replaceChildren(props.content)},closePopup:()=>{if(view.popup)view.popup.visible=false;document.getElementById('popup').replaceChildren()}};window.w=new Runtime();Object.assign(w,{state:{trafficSignsActive:true,objectsActive:false},_owned:text=>text,drawPoint:(...args)=>calls.push(['point',...args]),fetchAlternateImages:(...args)=>calls.push(['images',...args]),pickMapFeature:async(screen,v,signal)=>{calls.push(['pick',screen,signal]);if(pending)await new Promise(resolve=>resolvePick=resolve);return found?{graphic:{attributes:{id:'sign'},geometry:{longitude:1,latitude:2}}}:null}});window.show=()=>w.offerNoteObjectChoice(view,{geometry:{longitude:1,latitude:2}},()=>calls.push(['note']),()=>current);show();},{type,helper:compile(fs.readFileSync(root+'/src/features/detections/NoteObjectChoice.ts','utf8')),runtime:compile('class Runtime{'+methods+'};return Runtime;')});assert.equal(await page.evaluate(()=>calls.length),0);await page.getByRole('button',{name:'Open field note',exact:true}).click();assert.deepEqual(await page.evaluate(()=>calls.map(row=>row[0])),['note']);checks++;\nawait page.evaluate(()=>{calls=[];pixel={x:200,y:220};show()});await page.getByRole('button',{name:'Explore sign/object here',exact:true}).click();assert.deepEqual(await page.evaluate(()=>calls.filter(row=>row[0]!=='pick')),[['point',1,2],['images','sign',2,1]]);assert.deepEqual(await page.evaluate(()=>calls[0][1]),{x:200,y:220});checks++;\nawait page.evaluate(()=>{calls=[];found=false;show()});await page.getByRole('button',{name:'Explore sign/object here',exact:true}).click();await page.getByRole('status').filter({hasText:'No active sign or object'}).waitFor();await page.getByRole('button',{name:'Open field note',exact:true}).click();assert.equal(await page.evaluate(()=>calls.at(-1)[0]),'note');checks++;\nawait page.evaluate(()=>{calls=[];pending=true;found=true;show()});await page.getByRole('button',{name:'Explore sign/object here',exact:true}).click();await page.waitForFunction(()=>!!resolvePick);await page.evaluate(()=>{current=false;resolvePick()});await page.waitForTimeout(30);assert.equal(await page.evaluate(()=>calls.filter(row=>row[0]==='images').length),0);checks++;\nawait page.evaluate(()=>{current=true;calls=[];pending=true;resolvePick=null;show()});await page.getByRole('button',{name:'Explore sign/object here',exact:true}).click();await page.waitForFunction(()=>!!resolvePick);await page.evaluate(()=>{view.closePopup();resolvePick()});await page.waitForTimeout(30);assert.equal(await page.evaluate(()=>calls.filter(row=>row[0]==='images').length),0);checks++;\nawait page.evaluate(()=>{current=true;pending=false;calls=[];w.state.trafficSignsActive=false;w.state.objectsActive=false;window.offered=show()});assert.equal(await page.evaluate(()=>offered),false);assert.equal(await page.evaluate(()=>calls.length),0);checks++;await page.close()}console.log(checks+' note/object overlap Chromium checks passed in2D/3D: both actions, deferred picking, current screen projection, empty/stale picks and disabled modes.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});\n"
    },
    {
      "file": "tests/noteObjectChoice.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections/NoteObjectChoice.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m,m.exports);const{deferNoteObjectPopup}=m.exports;\nfor(const [name,hit,current,expected]of [['overlapping note',true,true,true],['unrelated layer',false,true,false],['superseded click',true,false,false]])test(name+' preserves the intended SDK popup propagation',async()=>{let resolve,work,stopped=false;const response=new Promise(done=>resolve=done);deferNoteObjectPopup({defer:fn=>work=fn(),stopPropagation:()=>stopped=true},response,result=>result.note,()=>current);assert.equal(stopped,false);resolve({note:hit});await work;assert.equal(stopped,expected)});\ntest('SDK hit failures stay with the main handler and do not create a second rejection',async()=>{let work,stopped=false;deferNoteObjectPopup({defer:fn=>work=fn(),stopPropagation:()=>stopped=true},Promise.reject(Error('SDK unavailable')),()=>true,()=>true);await work;assert.equal(stopped,false)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'note-sprite-overlap-';

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
    if (manifest.installer !== 'note-sprite-overlap' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-note-sprite-overlap.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Note sprite overlap confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'note-sprite-overlap', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Note sprite overlap confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
