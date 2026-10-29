#!/usr/bin/env node
'use strict';
/**
 * Live isolation diagnostic v6.78. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/SelectionPulse.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "cached pulse symbols 1",
              "before": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\n",
              "after": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport { watch as reactiveWatch } from 'esri/core/reactiveUtils';\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "   type: 'point-3d', symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [0,255,0,1] },\n    outline: { color: 'white', size: 2 }, size: 10, occludedVisibility: { mode: 'visible' } }]\n  } });\n  layer.add(graphic);\n  try { owner.view.map.add(layer); } catch (error) { layer.destroy(); throw error; }\n  this.comparison = { layer, graphic, originalVisible: owner.layer.visible, started: this.now(), lastWrite: -Infinity, lastSize: NaN, assignments: 0 };\n  owner.layer.visible = false; this.record('comparison-start');\n  return 'Fresh WGS84 marker, cloned-symbol pulse active; restore() ends comparison';\n };\n",
              "after": "   type: 'point-3d', symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [0,255,0,1] },\n    outline: { color: 'white', size: 2 }, size: 10, occludedVisibility: { mode: 'visible' } }]\n  } });\n  layer.add(graphic);\n  this.isolationExempt = layer;\n  try { owner.view.map.add(layer); } catch (error) { layer.destroy(); throw error; }\n  finally { this.isolationExempt = null; }\n  this.comparison = { layer, graphic, originalVisible: owner.layer.visible, started: this.now(), lastWrite: -Infinity, lastSize: NaN, assignments: 0 };\n  owner.layer.visible = false; this.record('comparison-start');\n  return 'Fresh WGS84 marker, cloned-symbol pulse active; restore() ends comparison';\n };\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": "  return c ? { active: true, assignments: c.assignments, size: c.lastSize, layerVisible: c.layer.visible,\n   graphicPresent: c.layer.graphics?.includes?.(c.graphic) ?? null,\n   layerPresent: this.owner?.view.map?.layers?.includes?.(c.layer) ?? null } : { active: false };\n }\n private isolation: { target: any; visible: boolean; scope: string; type: string }[] = [];\n isolate = () => {\n  this.restore();\n  const owner = this.owner;\n  if (!owner) return [];\n  // Only top-level operational layers: keep basemap and elevation unchanged.\n  owner.view.map?.layers?.forEach?.((target: any) => {\n   if (target !== owner.layer) this.isolation.push({ target, visible: target.visible, scope: 'layer', type: target.type || 'unknown' });\n  });\n  owner.view.graphics?.forEach?.((target: any) => {\n   this.isolation.push({ target, visible: target.visible, scope: 'view-graphic', type: target.geometry?.type || 'unknown' });\n  });\n  for (const item of this.isolation) item.target.visible = false;\n  this.record('isolation-start'); return this.isolationReport();\n };\n show = (index: number) => {\n  const item = this.isolation[index];\n  if (!Number.isInteger(index) || !item) throw new Error('Choose an index returned by isolate()');\n  item.target.visible = item.visible;\n  this.record('isolation-show', String(index)); return this.isolationReport();\n };\n restore = () => {\n  this.scenePause = 'off';\n  this.endComparison();\n  const hadIsolation = this.isolation.length > 0;\n  for (const item of this.isolation) if (!item.target.destroyed) item.target.visible = item.visible;\n  this.isolation = [];\n  if (hadIsolation) this.record('isolation-restored');\n };\n private isolationReport(): any[] {\n  return this.isolation.map((item, index) => ({ index, scope: item.scope, type: item.type, originallyVisible: item.visible, visible: item.target.visible }));\n }\n private contextCounts: Record<string, number> = {};\n private contextLast: Record<string, number> = {};\n private attachments = 0;\n",
              "after": "  return c ? { active: true, assignments: c.assignments, size: c.lastSize, layerVisible: c.layer.visible,\n   graphicPresent: c.layer.graphics?.includes?.(c.graphic) ?? null,\n   layerPresent: this.owner?.view.map?.layers?.includes?.(c.layer) ?? null } : { active: false };\n }\n private isolation: { target: any; visible: boolean; scope: string; type: string; allowed: boolean; addedLater: boolean }[] = [];\n private isolationHandles: { remove(): void }[] = [];\n private isolationActive = false;\n private isolationExempt: any = null;\n private isolationSuppressions = 0;\n private captureIsolation(target: any, scope: string, addedLater: boolean): void {\n  if (!this.isolationActive || target === this.owner?.layer || target === this.comparison?.layer || target === this.isolationExempt || this.isolation.some(item => item.target === target)) return;\n  const item = { target, visible: target.visible, scope, type: scope === 'layer' ? target.type || 'unknown' : target.geometry?.type || 'unknown', allowed: false, addedLater };\n  this.isolation.push(item);\n  const enforce = () => {\n   if (this.isolationActive && !item.allowed && !target.destroyed && target.visible !== false) {\n    ++this.isolationSuppressions; this.context('isolation-rehide'); target.visible = false;\n   }\n  };\n  // Public synchronous watcher closes the gap between cache activation and rendering.\n  this.isolationHandles.push(reactiveWatch(() => target.visible, enforce, { sync: true }));\n  enforce();\n  if (addedLater) this.context('isolation-late-entry');\n }\n isolate = () => {\n  this.restore();\n  const owner = this.owner;\n  if (!owner) return [];\n  this.isolationActive = true; this.isolationSuppressions = 0;\n  for (const [collection, scope] of [[owner.view.map?.layers, 'layer'], [owner.view.graphics, 'view-graphic']] as const) {\n   collection?.forEach?.((target: any) => this.captureIsolation(target, scope, false));\n   const handle = collection?.on?.('after-add', (event: any) => this.captureIsolation(event.item, scope, true));\n   if (handle?.remove) this.isolationHandles.push(handle);\n  }\n  this.record('isolation-start'); return this.isolationReport();\n };\n show = (index: number) => {\n  const item = this.isolation[index];\n  if (!Number.isInteger(index) || !item) throw new Error('Choose an index returned by isolate()');\n  item.allowed = true; item.target.visible = item.visible;\n  this.record('isolation-show', String(index)); return this.isolationReport();\n };\n restore = () => {\n  this.scenePause = 'off';\n  const hadIsolation = this.isolationActive;\n  // Detach locks before restoring visibility or removing the exempt comparison.\n  this.isolationActive = false;\n  this.isolationHandles.forEach(handle => handle.remove()); this.isolationHandles = [];\n  this.endComparison();\n  for (const item of this.isolation) if (!item.target.destroyed) item.target.visible = item.visible;\n  this.isolation = [];\n  if (hadIsolation) this.record('isolation-restored');\n };\n private isolationReport(): any[] {\n  return this.isolation.map((item, index) => ({ index, scope: item.scope, type: item.type, originallyVisible: item.visible, visible: item.target.visible, addedLater: item.addedLater, allowed: item.allowed }));\n }\n private isolationStatus(): any {\n  return { active: this.isolationActive, suppressions: this.isolationSuppressions,\n   lateEntries: this.isolation.filter(item => item.addedLater).length,\n   unexpectedVisible: this.isolation.filter(item => !item.allowed && !item.target.destroyed && item.target.visible !== false).length };\n }\n private contextCounts: Record<string, number> = {};\n private contextLast: Record<string, number> = {};\n private attachments = 0;\n"
            },
            {
              "label": "cached pulse symbols 4",
              "before": "  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  // Export history on demand; console logging can itself disturb animation timing.\n }\n report = () => ({ mode: '3d-scene-settings-v77', sceneWorkPause: this.scenePause, comparison: this.comparisonReport(), isolation: this.isolationReport(), context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => event === 'view:updating' ? this.context(event) : this.record(event));\n",
              "after": "  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  // Export history on demand; console logging can itself disturb animation timing.\n }\n report = () => ({ mode: '3d-live-isolation-v78', isolationStatus: this.isolationStatus(), sceneWorkPause: this.scenePause, comparison: this.comparisonReport(), isolation: this.isolationReport(), context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => event === 'view:updating' ? this.context(event) : this.record(event));\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/pulseVisibilityProbe.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "cached pulse symbols 1",
              "before": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);const{PulseVisibilityProbe}=m.exports;\nfunction watchable(data={}){const callbacks=new Map();return Object.assign(data,{callbacks,watch(key,cb){callbacks.set(key,cb);return{remove:()=>callbacks.delete(key)}}})}\nfunction collection(items){const callbacks=new Set();return{items,callbacks,includes:x=>items.includes(x),on(event,cb){callbacks.add(cb);return{remove:()=>callbacks.delete(cb)}},remove(x){items.splice(items.indexOf(x),1);for(const cb of [...callbacks])cb()}}}\ntest('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,2);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n",
              "after": "const reactiveHandles=new Set();\nfunction flushReactive(){for(const h of [...reactiveHandles]){const next=h.read();if(next!==h.last){h.last=next;h.callback();h.last=h.read()}}}\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)((name)=>name==='esri/core/reactiveUtils'?{watch(read,callback){const h={read,callback,last:read(),remove(){reactiveHandles.delete(h)}};reactiveHandles.add(h);return h}}:{selectionPulseOverlayStyle:()=>({})},m,m.exports);const{PulseVisibilityProbe}=m.exports;\nfunction watchable(data={}){const callbacks=new Map();return Object.assign(data,{callbacks,watch(key,cb){callbacks.set(key,cb);return{remove:()=>callbacks.delete(key)}}})}\nfunction collection(items){const callbacks=new Set();return{items,callbacks,includes:x=>items.includes(x),on(event,cb){callbacks.add(cb);return{remove:()=>callbacks.delete(cb)}},remove(x){items.splice(items.indexOf(x),1);for(const cb of [...callbacks])cb()}}}\ntest('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,2);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "\ntest('stationary stage pauses block only the named stage',()=>{const g=watchable({symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},p=new PulseVisibilityProbe();p.attach(view,layer,g);for(const stage of ['coverage','anchor','preview']){p.pauseSceneWork(stage);for(const kind of ['cone','settled','coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),kind===stage)}p.restore();for(const kind of ['coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),false);p.stop()});\n\ntest('scene settings export is read-only, explicit and removes URL credentials/query keys',()=>{const g=watchable({geometry:{toJSON:()=>({x:1,y:2,z:3})},symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g]),elevationInfo:{mode:'on-the-ground'}}),camera={toJSON:()=>({heading:20,tilt:40,position:{x:1,y:2,z:300}})},environment={toJSON:()=>({starsEnabled:true})},basemap={toJSON:()=>({baseMapLayers:[{url:'https://user:secret@example.com/tiles?token=private#frag',apiKey:'private',customParameters:{secret:1}}]})},view={type:'3d',qualityProfile:'medium',camera,environment,map:{layers:collection([layer]),basemap,ground:{toJSON:()=>({opacity:1})}}},p=new PulseVisibilityProbe();p.attach(view,layer,g);const s=p.sceneSettings();assert.equal(s.view.qualityProfile,'medium');assert.equal(s.view.camera.position.z,300);assert.equal(s.map.basemap.baseMapLayers[0].url,'https://example.com/tiles');assert(!JSON.stringify(s).includes('private'));assert(!JSON.stringify(s).includes('secret'));assert.equal(s.view.viewingMode,null);assert.equal(view.camera,camera);assert.equal(view.environment,environment);assert.equal(p.report().sceneSettings,undefined);p.stop();assert.throws(()=>p.sceneSettings())});\n",
              "after": "\ntest('stationary stage pauses block only the named stage',()=>{const g=watchable({symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},p=new PulseVisibilityProbe();p.attach(view,layer,g);for(const stage of ['coverage','anchor','preview']){p.pauseSceneWork(stage);for(const kind of ['cone','settled','coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),kind===stage)}p.restore();for(const kind of ['coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),false);p.stop()});\n\ntest('scene settings export is read-only, explicit and removes URL credentials/query keys',()=>{const g=watchable({geometry:{toJSON:()=>({x:1,y:2,z:3})},symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g]),elevationInfo:{mode:'on-the-ground'}}),camera={toJSON:()=>({heading:20,tilt:40,position:{x:1,y:2,z:300}})},environment={toJSON:()=>({starsEnabled:true})},basemap={toJSON:()=>({baseMapLayers:[{url:'https://user:secret@example.com/tiles?token=private#frag',apiKey:'private',customParameters:{secret:1}}]})},view={type:'3d',qualityProfile:'medium',camera,environment,map:{layers:collection([layer]),basemap,ground:{toJSON:()=>({opacity:1})}}},p=new PulseVisibilityProbe();p.attach(view,layer,g);const s=p.sceneSettings();assert.equal(s.view.qualityProfile,'medium');assert.equal(s.view.camera.position.z,300);assert.equal(s.map.basemap.baseMapLayers[0].url,'https://example.com/tiles');assert(!JSON.stringify(s).includes('private'));assert(!JSON.stringify(s).includes('secret'));assert.equal(s.view.viewingMode,null);assert.equal(view.camera,camera);assert.equal(view.environment,environment);assert.equal(p.report().sceneSettings,undefined);p.stop();assert.throws(()=>p.sceneSettings())});\n\ntest('live isolation hides late entries and reactivation, exempts comparison and restores every watcher',()=>{function liveCollection(initial=[]){const handlers=new Map();return{items:initial,forEach(cb){this.items.forEach(cb)},includes(x){return this.items.includes(x)},on(type,cb){if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(cb);return{remove:()=>handlers.get(type).delete(cb)}},add(x){this.items.push(x);for(const cb of handlers.get('after-add')||[])cb({item:x})},remove(x){this.items.splice(this.items.indexOf(x),1)},listeners(){return [...handlers.values()].reduce((n,s)=>n+s.size,0)}}}const g=watchable({geometry:{longitude:1,latitude:2},symbol:{symbolLayers:[{size:12}]}}),layer=watchable({visible:true,graphics:collection([g])}),a={visible:true,type:'vector-tile'},layers=liveCollection([a,layer]),graphics=liveCollection(),view={type:'3d',map:{layers,add:x=>layers.add(x),remove:x=>layers.remove(x)},graphics};function sym(){return {symbolLayers:[{size:10}],clone(){return sym()}}}let comparison;const factories={point:p=>p,layer:p=>(comparison={...p,visible:true,graphics:liveCollection(),add(x){this.graphics.add(x)},destroy(){this.destroyed=true}}),graphic:p=>({...p,symbol:sym()})};const p=new PulseVisibilityProbe();p.attach(view,layer,g,undefined,factories,()=>0);const before=reactiveHandles.size;p.isolate();assert.equal(a.visible,false);p.compare();assert.equal(comparison.visible,true);assert.equal(p.report().isolation.length,1);const late={type:'vector-tile',visible:true};layers.add(late);assert.equal(late.visible,false);flushReactive();assert.equal(p.report().isolationStatus.lateEntries,1);late.visible=true;flushReactive();assert.equal(late.visible,false);assert.equal(p.report().isolationStatus.unexpectedVisible,0);p.show(1);flushReactive();assert.equal(late.visible,true);const dot={visible:true,geometry:{type:'point'}};graphics.add(dot);assert.equal(dot.visible,false);p.restore();assert.equal(a.visible,true);assert.equal(late.visible,true);assert.equal(dot.visible,true);assert.equal(comparison.destroyed,true);assert.equal(reactiveHandles.size,before);const later={visible:true,type:'feature'};layers.add(later);assert.equal(later.visible,true);p.stop();assert.equal(layers.listeners(),0);assert.equal(graphics.listeners(),0)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/PULSE-LIVE-ISOLATION.md",
      "content": "# v6.78 live visibility isolation diagnostic\nRequires v6.77. Rebuild/restart and hard refresh. Mode 3d-live-isolation-v78.\n\nFixes snapshot-only isolation: existing top-level operational layers and view graphics are hidden; after-add captures new ones; public reactiveUtils.watch with sync:true re-hides visibility reactivation. Basemap and ground unchanged, groups hidden via parent. Original pulse and temporary comparison layer exempt. No RAF polling or selection/hover algorithm changes. Background requests, layer loading and layout still run; hidden resources remain loaded. This is visibility isolation, not removal/unloading or proof against every render interaction. Hidden parent cannot suppress a DOM overlay.\n\nInstall then select one image, playback stopped. Run isolate(), compare(), clear() in that order, with no pauseSceneWork calls. Allow coverage to finish, rotate camera and observe 30 seconds. Report observed smooth/flicker plus report(). Verify isolationStatus.active true and unexpectedVisible 0. lateEntries and suppressions show what was caught. Counts include initial hides; alone they do not prove a late reactivation. Original pulse current.layerVisible false is expected during comparison.\n\nshow(index) explicitly exempts one captured entry from the lock, restoring captured visibility. Fresh isolate() removes all exceptions. restore() removes locks before returning captured visibility; changing image/disposing owner also cleans up. New entries restore their visibility as captured on insertion; external visibility changes during test are overwritten by restore. Removed/destroyed objects do not get re-added, created or resurrected. No mutation unless isolate() explicitly enabled. Use only for a brief diagnostic with fixed image.\n\nThe settings export remains separate, normal reports contain no service URLs/coordinates. History remains bounded. This patch corrects diagnostic coverage; it is not a flicker fix.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'pulse-live-isolation-v6-78-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.78 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'pulse-live-isolation-v6-78' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.78 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.78 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.78 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-pulse-live-isolation-v6-78.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Live isolation diagnostic v6.78 is already installed. No files changed.');
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
  const manifest = { installer: 'pulse-live-isolation-v6-78', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Live isolation diagnostic v6.78 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
