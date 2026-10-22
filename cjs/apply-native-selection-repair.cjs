#!/usr/bin/env node
'use strict';
/** Native selection repair installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx selection repair block 1",
          "before": "      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      // Turbo colors the original tile geometry; route geometry remains available to the minimap/profile.\n      const layer = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layer) layer.removeMany(layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer?.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n",
          "after": "      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      const layer = this.ensureActiveSequenceLayer(view);\n      const previews = layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview);\n      layer.removeMany(previews);\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx selection repair block 2",
          "before": "    if (this.state.turboModeActive) {\n      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';\n      this._activeSequenceOverlay?.dispose();\n      this.updateNativeSequenceSelection();\n      return;\n",
          "after": "    if (this.state.turboModeActive) {\n      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view && overlay.layer) {\n        overlay.layer.removeMany(Array.from(overlay.points.values())); overlay.points.clear();\n      }\n      this.updateNativeSequenceSelection();\n      return;\n"
        },
        {
          "label": "src/runtime/widget.tsx selection repair block 3",
          "before": "      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layerOwner) layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n",
          "after": "      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.ensureActiveSequenceLayer(view);\n      layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n"
        },
        {
          "label": "src/runtime/widget.tsx selection repair block 4",
          "before": "        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner?.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n",
          "after": "        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n"
        },
        {
          "label": "src/runtime/widget.tsx selection repair block 5",
          "before": "              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7 }}><span aria-hidden=\"true\" style={{ width: 18, borderTop: \"2px solid #739dff\", flexShrink: 0 }} /><span>Blue line \u00b7 Selected sequence</span></div>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7, marginTop: 3 }}><span aria-hidden=\"true\" style={{ width: 6, height: 6, margin: \"0 6px\", borderRadius: \"50%\", background: \"blue\", border: this.state.turboModeActive ? \"1px solid white\" : \"1px solid #e3da30\", flexShrink: 0 }} /><span>{this.state.turboModeActive ? \"Blue circles \u00b7 Selected sequence\" : \"Blue dots \u00b7 Nearby frames\"}</span></div>\n              <p style={{ margin: \"5px 0 0\" }}>{this.state.turboModeActive ? \"Selection recolors the original coverage circles and line. Zoom closer for individual circles; select other coverage to explore.\" : \"More imagery may continue beyond the dots. Select coverage elsewhere to explore. Route previews follow available coverage tiles.\"}</p>\n            </div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n",
          "after": "              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7 }}><span aria-hidden=\"true\" style={{ width: 18, borderTop: \"2px solid #739dff\", flexShrink: 0 }} /><span>Blue line \u00b7 Selected sequence</span></div>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7, marginTop: 3 }}><span aria-hidden=\"true\" style={{ width: 6, height: 6, margin: \"0 6px\", borderRadius: \"50%\", background: \"blue\", border: this.state.turboModeActive ? \"1px solid white\" : \"1px solid #e3da30\", flexShrink: 0 }} /><span>{this.state.turboModeActive ? \"Blue circles \u00b7 Selected sequence\" : \"Blue dots \u00b7 Nearby frames\"}</span></div>\n              <p style={{ margin: \"5px 0 0\" }}>{this.state.turboModeActive ? \"Blue circles belong to the active sequence. Its faint blue overview remains visible; other coverage keeps its normal colors.\" : \"More imagery may continue beyond the dots. Select coverage elsewhere to explore. Route previews follow available coverage tiles.\"}</p>\n            </div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n"
        }
      ],
      "absentAfterUninstall": [
        "Blue circles belong to the active sequence."
      ],
      "requiredOccurrences": [
        {
          "text": "Blue circles belong to the active sequence.",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/coverage/NativeSequenceSelection.ts",
      "blocks": [
        {
          "label": "src/features/coverage/NativeSequenceSelection.ts selection repair block 1",
          "before": "/** Public ArcGIS vector-style boundary; no tile requests or Graphic allocation. */\nexport interface NativeSelectionLayer {\n  getStyleLayerIndex(id: string): number;\n  setStyleLayer(style: any, index?: number): void;\n  deleteStyleLayer(id: string): void;\n}\n\n/**\n * Recolor the selected sequence using mutually exclusive native style filters.\n * Image tiles identify membership with sequence_id; sequence lines use id.\n * Selected and unselected partitions share the source geometry, zoom limits,\n * radius, stroke and opacity. Only their fill/line color differs. Existing\n * quality/date/ownership filters remain authoritative, including missing scores.\n */\nexport class NativeSequenceSelection<L extends NativeSelectionLayer> {\n",
          "after": "/** Public SDK boundary for updating the paint of existing native tile styles. */\nexport interface NativeSelectionLayer {\n  setPaintProperties(id: string, paint: any): void;\n}\n\n/**\n * Recolor existing circles without adding style layers, filters or point Graphics.\n * Membership is evaluated per feature: images use sequence_id, lines use id.\n * A missing or different ID keeps the original color, including date expressions\n * and quality-band paints. Geometry, circle radius, stroke and opacity stay intact.\n */\nexport class NativeSequenceSelection<L extends NativeSelectionLayer> {\n"
        },
        {
          "label": "src/features/coverage/NativeSequenceSelection.ts selection repair block 2",
          "before": "  private sequenceId: string | null | undefined;\n\n  /** Bind only after loadStyle resolves. Discard the retiring layer without restyling it. */\n  bind(layer: L, styles: readonly any[]): void {\n    this.detach();\n    this.layer = layer;\n    this.templates = styles.filter(style => style.source === 'turbo' &&\n      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'));\n  }\n\n  /** Update once per sequence change, never once per image/frame or pointer move. */\n  select(sequenceId: string | null): void {\n    if (!this.layer || this.sequenceId === sequenceId) return;\n    const layer = this.layer;\n    for (const original of this.templates) {\n      const selectedId = `${original.id}-selected`;\n      if (!sequenceId) {\n        layer.setStyleLayer(original);\n        if (layer.getStyleLayerIndex(selectedId) >= 0) layer.deleteStyleLayer(selectedId);\n        continue;\n      }\n      const property = original['source-layer'] === 'image' ? 'sequence_id' : 'id';\n      const constrain = (condition: any[]) => original.filter ? ['all', original.filter, condition] : condition;\n      layer.setStyleLayer({ ...original, filter: constrain(['!=', property, sequenceId]) });\n      const color = original.type === 'circle' ? 'circle-color' : 'line-color';\n      layer.setStyleLayer({ ...original, id: selectedId, filter: constrain(['==', property, sequenceId]),\n        paint: { ...original.paint, [color]: '#0000ff' } }, layer.getStyleLayerIndex(original.id) + 1);\n    }\n    this.sequenceId = sequenceId;\n  }\n\n  /** Release references on style reload, view transfer or teardown; host owns layer disposal. */\n  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }\n}\n",
          "after": "  private sequenceId: string | null | undefined;\n\n  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */\n  bind(layer: L, styles: readonly any[]): void {\n    this.detach();\n    this.layer = layer;\n    this.templates = styles.filter(style => style.source === 'turbo' &&\n      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))\n      .map(style => ({ ...style, paint: { ...style.paint } }));\n  }\n\n  /** Change only paint, once per sequence; same-sequence playback does no SDK work. */\n  select(sequenceId: string | null): void {\n    if (!this.layer || this.sequenceId === sequenceId) return;\n    for (const original of this.templates) {\n      const image = original['source-layer'] === 'image';\n      const color = image ? 'circle-color' : 'line-color';\n      const property = image ? 'sequence_id' : 'id';\n      const paint = { ...original.paint };\n      if (sequenceId) paint[color] = ['case', ['==', ['get', property], sequenceId], '#0000ff', original.paint[color]];\n      this.layer.setPaintProperties(original.id, paint);\n    }\n    this.sequenceId = sequenceId;\n  }\n\n  /** Release references when replacing styles or views; no mutations to a retiring renderer. */\n  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "Recolor existing circles without adding style layers"
      ],
      "requiredOccurrences": [
        {
          "text": "Recolor existing circles without adding style layers",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/nativeSequenceSelection.test.cjs",
      "blocks": [
        {
          "label": "tests/nativeSequenceSelection.test.cjs selection repair block 1",
          "before": "/** Native style partitions and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\n",
          "after": "/** Native paint selection, retained overview and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\n"
        },
        {
          "label": "tests/nativeSequenceSelection.test.cjs selection repair block 2",
          "before": "const {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');\nconst style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);\nclass Layer{constructor(styles){this.styles=structuredClone(styles);this.calls=[]}getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}setStyleLayer(s,index){this.calls.push(s.id);const old=this.getStyleLayerIndex(s.id);if(old>=0)this.styles.splice(old,1);this.styles.splice(index??(old>=0?old:this.styles.length),0,structuredClone(s))}deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}}\nfunction match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}\nfor(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]){\n test(name+': selection changes color only; each matching feature renders exactly once',()=>{\n  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');\n  for(const original of base.filter(s=>s['source-layer']!=='overview')){\n   const selected=layer.styles.find(s=>s.id===original.id+'-selected'),normal=layer.styles.find(s=>s.id===original.id);\n   for(const key of Object.keys(original).filter(k=>!['id','filter','paint'].includes(k)))assert.deepEqual(selected[key],original[key]);\n   const color=original.type==='circle'?'circle-color':'line-color';assert.deepEqual({...selected.paint,[color]:original.paint[color]},original.paint);assert.equal(selected.paint[color],'#0000ff');\n   for(const sequence of ['A','B',undefined])for(const score of [.8,.5,.2,undefined]){\n    const props={id:original.type==='line'?sequence:'image',sequence_id:sequence,quality_score:score,organization_id:123,creator_id:456,foot:false,is_pano:false,captured_at:Date.UTC(2024,6,1)};\n    assert.equal(Number(match(normal.filter,props))+Number(match(selected.filter,props)),Number(match(original.filter,props)));\n    if(match(selected.filter,props))assert.equal(sequence,'A');\n   }\n  }\n  owner.select('B');assert(!JSON.stringify(layer.styles).includes('\"A\"'));owner.select(null);assert.deepEqual(layer.styles,base);\n });\n}\ntest('style reload and view transfer bind current templates without retaining old layers',()=>{const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>s.id.endsWith('-selected')));o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n)});\ntest('same sequence during playback performs no style operations',()=>{const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;for(let i=0;i<10000;i++)o.select('A');assert.equal(l.calls.length,n)});\ntest('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});\n",
          "after": "const {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');\nconst style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);\nclass Layer{setPaintProperties(id,paint){this.calls.push(id);this.styles.find(s=>s.id===id).paint=structuredClone(paint)}constructor(styles){this.styles=structuredClone(styles);this.calls=[]}getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}setStyleLayer(s,index){this.calls.push(s.id);const old=this.getStyleLayerIndex(s.id);if(old>=0)this.styles.splice(old,1);this.styles.splice(index??(old>=0?old:this.styles.length),0,structuredClone(s))}deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}}\nfunction match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}\nfunction color(expression,props){\n if(!Array.isArray(expression))return expression;\n const [op,...args]=expression;\n if(op==='get')return props[args[0]];\n if(op==='==')return color(args[0],props)===color(args[1],props);\n if(op==='case')return color(args[0],props)?color(args[1],props):color(args[2],props);\n if(op==='coalesce')return args.map(a=>color(a,props)).find(v=>v!=null);\n if(op==='step'){const value=color(args[0],props);let result=args[1];for(let i=2;i<args.length;i+=2)if(value>=args[i])result=args[i+1];return result}\n throw Error(op);\n}\nfor(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]){\n test(name+': only matching features turn blue; styles, filters and circle dimensions stay intact',()=>{\n  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');\n  assert.equal(layer.styles.length,base.length);\n  for(const original of base){\n   const actual=layer.styles.find(s=>s.id===original.id);if(original['source-layer']==='overview'){assert.deepEqual(actual,original);continue}\n   const key=original.type==='circle'?'circle-color':'line-color';\n   assert.deepEqual({...actual,paint:original.paint},original);\n   assert.deepEqual({...actual.paint,[key]:original.paint[key]},original.paint);\n   for(const id of ['A','B',undefined,null]){\n    const props={id,sequence_id:id,captured_at:Date.UTC(2025,6,1)};\n    assert.equal(color(actual.paint[key],props),id==='A'?'#0000ff':color(original.paint[key],props));\n   }\n  }\n  owner.select('B');for(const actual of layer.styles.filter(s=>s['source-layer']!=='overview')){const key=actual.type==='circle'?'circle-color':'line-color';assert.equal(color(actual.paint[key],{sequence_id:'B',id:'B'}),'#0000ff');assert.notEqual(color(actual.paint[key],{sequence_id:'A',id:'A'}),'#0000ff')}\n  owner.select(null);assert.deepEqual(layer.styles,base);\n });\n}\ntest('style reload and view transfer bind current templates without retaining old layers',()=>{const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>JSON.stringify(s.paint).includes('case')));o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n)});\ntest('same sequence during playback performs no style operations',()=>{const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;for(let i=0;i<10000;i++)o.select('A');assert.equal(l.calls.length,n)});\ntest('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});\n"
        },
        {
          "label": "tests/nativeSequenceSelection.test.cjs selection repair block 3",
          "before": " w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});\n w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};\n w.ensureActiveSequenceLayer=()=>{throw Error('Native coverage must not create sequence GraphicsLayer')};w.allocations=()=>allocations;\n return {w,view,layer};\n}\ntest('native marker refresh aborts old jobs, disposes legacy overlay and allocates zero point graphics',async()=>{const {w,layer}=setup();let disposed=0;const abort=new AbortController();w._sequenceMarkerAbort=abort;w._activeSequenceOverlay={dispose(){disposed++}};for(let i=0;i<100;i++)await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(w.allocations(),0);assert.equal(disposed,100);assert(layer.styles.some(s=>s.id==='turbo-images-selected'))});\ntest('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});\ntest('complete profile route retains minimap geometry without adding a main-map overlay',async()=>{const {w,view}=setup();await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2)});\nfor(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});\ntest('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});\ntest('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert(layer.styles.some(s=>s.id.endsWith('-selected')&&JSON.stringify(s.filter).includes('\"B\"')))});\ntest('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});\n\ntest('cached sequence preview supplies minimap geometry without a second main-map line',async()=>{const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};await w.showCachedSequencePreview('A',1,new AbortController().signal);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2)});\n",
          "after": " w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});\n w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};\n w.ensureActiveSequenceLayer=()=>{if(!w._activeSequenceOverlay?.layer){const graphics=[];w._activeSequenceOverlay={view,points:new Map(),layer:{graphics:{toArray:()=>graphics.slice()},add:g=>graphics.push(g),removeMany:items=>items.forEach(g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)})}}}return w._activeSequenceOverlay.layer};w.allocations=()=>allocations;\n return {w,view,layer};\n}\ntest('native marker refresh removes legacy points while preserving the faint overview',async()=>{const {w,view,layer}=setup();const overview={attributes:{sequence_preview:true}},point={attributes:{image_id:'old'}},graphics=[overview,point];const abort=new AbortController();w._sequenceMarkerAbort=abort;w._activeSequenceOverlay={view,points:new Map([['old',point]]),layer:{removeMany:items=>items.forEach(g=>graphics.splice(graphics.indexOf(g),1))},dispose(){throw Error('Must preserve overview')}};for(let i=0;i<100;i++)await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(w.allocations(),0);assert.deepEqual(graphics,[overview]);assert.equal(w._activeSequenceOverlay.points.size,0);assert.equal(color(layer.styles.find(s=>s.id==='turbo-images').paint['circle-color'],{sequence_id:'A'}),'#0000ff')});\ntest('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});\ntest('complete profile route retains its sequence line and minimap geometry',async()=>{const {w,view}=setup();await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1)});\nfor(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});\ntest('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});\ntest('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert(layer.styles.some(s=>JSON.stringify(s.paint).includes('\"B\"')))});\ntest('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});\n\ntest('cached faint sequence overview stays on the main map and minimap',async()=>{const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};await w.showCachedSequencePreview('A',1,new AbortController().signal);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1)});\n"
        }
      ],
      "absentAfterUninstall": [
        "only matching features turn blue"
      ],
      "requiredOccurrences": [
        {
          "text": "only matching features turn blue",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md selection repair block 1",
          "before": "\nHost validation: compare circle centers, radius and outline before/after selection at zooms 14, 19, 21 and 23+; switch sequences, clear selection, apply date/quality/organization filters, and repeat in 2D/3D and during playback/profile loading. GPU appearance and native SDK rendering require the Experience Builder host.\n",
          "after": "\nHost validation: compare circle centers, radius and outline before/after selection at zooms 14, 19, 21 and 23+; switch sequences, clear selection, apply date/quality/organization filters, and repeat in 2D/3D and during playback/profile loading. GPU appearance and native SDK rendering require the Experience Builder host.\n\n## Native selection correction and overview restoration\n\nThe first native selection installer produced blue circles across unrelated sequences in the host; its portable filter tests did not establish actual renderer behavior. Replace incremental style-layer partitions with per-feature `case` color expressions on the existing styles through `setPaintProperties`. No selected style layers, membership filters or point Graphics are added. Only a matching sequence ID receives blue; other/missing IDs use the original quality/date color. All base filters and circle dimensions remain unchanged.\n\nRestore the existing cached faint overview and complete route line on the main map. Native marker refresh removes only legacy point graphics, preserving that overview. Full-coordinate route loading remains on demand for elevation. The earlier statement about suppressing the main-map overview is superseded. Refactoring remains paused at the field-note map checkpoint.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Native selection correction and overview restoration"
      ],
      "requiredOccurrences": [
        {
          "text": "## Native selection correction and overview restoration",
          "count": 1
        }
      ]
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'native-selection-repair-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-native-selection-repair.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited native selection references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Native selection repair is already uninstalled. No files changed.' : 'Native selection repair is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'native-selection-repair', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Native selection repair ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Selection now changes existing native paints per feature and restores the faint sequence overview. Only matching sequence IDs become blue; other coverage keeps its original color. No sequence point Graphics or close-zoom replacement is reintroduced. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
