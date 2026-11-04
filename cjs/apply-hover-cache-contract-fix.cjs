#!/usr/bin/env node
'use strict';
/**
 * Hover metadata cache contract fix. Compatible current v6 sources.
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
              "label": "TTL-aware hover metadata availability",
              "before": "    if (cachedPreviewId && this._turboMetadataCache.has(cachedPreviewId)) void resolvePreview();",
              "after": "    // Use the TTL-aware cache contract; TurboMetadataCache is not a Map.\n    if (cachedPreviewId && this._turboMetadataCache.get(cachedPreviewId) !== undefined) void resolvePreview();"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/hoverBearingRuntime.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Production metadata cache regression fixtures",
              "before": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const helpers={exports:{}};new Function('module','exports',compile(fs.readFileSync(__dirname+'/../src/features/imagery/hoverBearingMetadata.ts','utf8')))(helpers,helpers.exports);const targetModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(__dirname+'/../src/features/imagery/hoverBearingTarget.ts','utf8')))(targetModule,targetModule.exports);const src=fs.readFileSync(__dirname+'/../src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cls.members.find(n=>n.name?.getText(sf)==='updateTurboHover').getText(sf);\nfunction setup(cached){\n const timers=[],shows=[],cards=[],urls=[],cache=new Map(cached?[['A',cached]]:[]);let calls=0,time=1000,nextTimer=0,pulses=0,respond=async()=>({id:'A',computed_compass_angle:45,is_pano:false});\n const schedule=(fn,delay)=>{const id=++nextTimer;timers.push({id,fn,delay});return id;};\n const cancel=id=>{const timer=timers.find(t=>t.id===id);if(timer)timer.cancelled=true;};\n const Runtime=new Function('performance','clearTimeout','hoverBearingImageId','distanceMeters','needsHoverBearingMetadata','mergeHoverBearingMetadata','hoverPreviewBearing','HoverBearingSector','setTimeout','fetch','renderImageryHoverCard','positionImageryHoverCard','GRAPH_API','TURBO_LIMITS',compile('class Runtime{'+method+'}')+';return Runtime')({now:()=>time},cancel,targetModule.exports.hoverBearingImageId,()=>0,...Object.values(helpers.exports),class{show(...args){shows.push(args)}clear(){}},schedule,async url=>{urls.push(url);calls++;return{ok:true,json:()=>respond()}},(...args)=>cards.push(args),()=>{},{BASE:'https://example.com'},{hoverDetailsDelayMs:1});\n const w=new Runtime();w.state={turboModeActive:true,jimuMapView:{view:{container:{getBoundingClientRect:()=>({})}}}};w.accessToken='test';w._liveSequenceFrames={complete:null};w._hoverBearingHints=new targetModule.exports.HoverBearingHintCache();w.getTurboOrganizationId=()=>undefined;w.runSequenceBackground=(fn,signal)=>fn(signal);w.tooltipDiv={};w._turboMetadataCache=cache;w._turboHoverAnchor={};w._lastBearing=287;\n w.clearTurboHoverDetails=()=>{w._turboHoverInfoAbort?.abort();cancel(w._hoverTimeout);w._coverageFrameHoverTarget=null};w.showTurboHover=()=>pulses++;w.highlightSequenceOnVTL=()=>{};w.prepareCoverageFrameHover=()=>{};\n const graphic={attributes:{image_id:'A',turbo_representative:true},geometry:{}};\n return{w,graphic,shows,cards,cache,urls,timers,pulses:()=>pulses,calls:()=>calls,run:async()=>{await Promise.resolve();await Promise.resolve();let timer;while(timers.length){timer=timers.shift();if(!timer.cancelled)break;timer=undefined;}if(timer){time+=timer.delay;await timer.fn();}},response:fn=>respond=fn};\n}\n\ntest('existing card without bearing is enriched once and cone reuses cached result',async()=>{const x=setup({id:'A',thumb_256_url:'thumb'});x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],45);assert.equal(x.cache.get('A').thumb_256_url,'thumb');x.w._currentHoveredFeatureId=null;x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),1)});\ntest('bearing received after pointer leave cannot create cone or update metadata cache',async()=>{const x=setup({id:'A'});let release;x.response(()=>new Promise(resolve=>release=resolve));x.w.updateTurboHover(x.graphic,0,0);const pending=x.run();while(!release)await new Promise(r=>setImmediate(r));x.w._turboHoverInfoAbort.abort();release({id:'A',compass_angle:30});await pending;assert.equal(x.shows.length,0);assert.equal(x.cache.get('A').__hoverBearingLoaded,undefined)});\ntest('panorama cached heading policy uses current viewer preview direction without a request',async()=>{const x=setup({id:'A',is_pano:true,computed_compass_angle:null,compass_angle:null});x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),0);assert.equal(x.shows[0][1],287)});\n\nfor(const [type,zoom]of [['2d',7],['3d',8]])test(`${type} zoom ${zoom} uses the clicked nearby frame bearing instead of the line representative`,async()=>{const x=setup({id:'A',computed_compass_angle:10});x.w.state.jimuMapView.view.zoom=zoom;x.w.state.jimuMapView.view.type=type;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:-85.766008,latitude:37.606740};const target={key:'line',location:{lon:-85.766008,lat:37.606740}};x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget=target;let lookups=0;x.w.ensureCoverageFrameLookup=()=>({resolve:async()=>{lookups++;return 'B'}});x.response(async()=>({id:'B',compass_angle:170,is_pano:false}));x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(lookups,1);assert(x.urls[0].includes('/B?'));assert.equal(x.shows[0][1],170);assert.equal(x.cache.get('A').computed_compass_angle,10);assert.equal(x.cache.get('B').compass_angle,170);assert.equal(x.w._currentHoveredFeatureId,'A')});\ntest('moving along one representative invalidates only old metadata while keeping its pulse identity',async()=>{const x=setup();x.w.state.jimuMapView.view.zoom=8;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:0,latitude:0};let release,key=0;const hints=['B','C'];x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget={key:String(++key),location:{lon:key,lat:0}};x.w.ensureCoverageFrameLookup=()=>({resolve:async(_v,_s,p)=>p.lon===1?new Promise(r=>release=r):hints[1]});x.response(async()=>({id:'C',computed_compass_angle:210,is_pano:false}));x.w.updateTurboHover(x.graphic,0,0);const first=x.run();while(!release)await new Promise(r=>setImmediate(r));x.w.updateTurboHover(x.graphic,1,0);await x.run();release('B');await first;assert.equal(x.calls(),1);assert(x.urls[0].includes('/C?'));assert.equal(x.shows.length,1);assert.equal(x.shows[0][1],210);assert.equal(x.w._currentHoveredFeatureId,'A')});\n\nfunction regional(x){x.w.state.jimuMapView.view.zoom=8;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:1,latitude:2};const target={key:'line',location:{lon:1,lat:2}};x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget=target;return target;}\ntest('ready regional card and bearing appear synchronously without a timer, lookup or request',()=>{const x=setup({id:'A',compass_angle:10});regional(x);x.cache.set('B',{id:'B',compass_angle:170,thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.w.ensureCoverageFrameLookup=()=>{throw Error('must not resolve a completed hint again')};x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.pulses(),1);assert.equal(x.shows[0][1],170);assert.equal(x.cards.at(-1)[1].id,'B');assert.equal(x.timers.length,0);assert.equal(x.calls(),0)});\ntest('partial cached card is immediate but only missing metadata waits for dwell',async()=>{const x=setup();regional(x);x.cache.set('B',{id:'B',thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.response(async()=>({id:'B',compass_angle:190}));x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.cards[0][1].id,'B');assert.equal(x.shows.length,0);assert.equal(x.calls(),0);assert.equal(x.timers[0].delay,150);await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],190)});\ntest('cold regional targets keep the immediate pulse and one dwell before resolving',async()=>{const x=setup({id:'A',compass_angle:10});regional(x);let lookups=0;x.w.ensureCoverageFrameLookup=()=>({resolve:async()=>{lookups++;return 'B'}});x.response(async()=>({id:'B',compass_angle:170}));x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.pulses(),1);assert.equal(x.calls(),0);assert.equal(lookups,0);assert.equal(x.shows.length,0);assert.equal(x.timers[0].delay,150);await x.run();assert.equal(lookups,1);assert.equal(x.calls(),1);assert.equal(x.timers.length,0);assert.equal(x.shows[0][1],170)});\ntest('leaving during partial enrichment cancels its timer without a request',async()=>{const x=setup();regional(x);x.cache.set('B',{id:'B',thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.w.updateTurboHover(x.graphic,0,0);x.w.clearTurboHoverDetails();await x.run();assert.equal(x.calls(),0);assert.equal(x.shows.length,0)});\ntest('local-route cached hints bypass scans but unrelated tile hints cannot replace their policy',()=>{const x=setup();regional(x);const frames=[{id:'B',lon:1,lat:2}];x.w.state.sequenceId='sequence';x.w.state.sequenceImages=frames;x.w._liveSequenceFrames.complete=frames;x.cache.set('B',{id:'B',compass_angle:170});x.w._coverageFrameLookup={peek(){throw Error('tile hint must not replace active route policy')}};x.w._hoverBearingHints.remember(x.w.state.jimuMapView.view,frames,JSON.stringify(['sequence',1,2]),'B');x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.shows[0][1],170);assert.equal(x.timers.length,0);assert.equal(x.calls(),0)});\n",
              "after": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const helpers={exports:{}};new Function('module','exports',compile(fs.readFileSync(__dirname+'/../src/features/imagery/hoverBearingMetadata.ts','utf8')))(helpers,helpers.exports);const targetModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(__dirname+'/../src/features/imagery/hoverBearingTarget.ts','utf8')))(targetModule,targetModule.exports);const src=fs.readFileSync(__dirname+'/../src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cls.members.find(n=>n.name?.getText(sf)==='updateTurboHover').getText(sf);\n// Exercise the production cache contract; Map.has masked the v6.120 runtime crash.\nconst cacheSource=ts.createSourceFile('turboCoverageUtils.ts',fs.readFileSync(__dirname+'/../src/utils/turboCoverageUtils.ts','utf8'),ts.ScriptTarget.Latest,true);\nconst cacheClass=cacheSource.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='TurboMetadataCache');\nconst cacheModule={exports:{}};new Function('module','exports',compile(cacheClass.getText(cacheSource)))(cacheModule,cacheModule.exports);\nconst {TurboMetadataCache}=cacheModule.exports;\nfunction setup(cached){\n const timers=[],shows=[],cards=[],urls=[];let calls=0,time=1000,nextTimer=0,pulses=0,respond=async()=>({id:'A',computed_compass_angle:45,is_pano:false});\n const cache=new TurboMetadataCache(32,300000,()=>time);if(cached)cache.set('A',cached);\n const schedule=(fn,delay)=>{const id=++nextTimer;timers.push({id,fn,delay});return id;};\n const cancel=id=>{const timer=timers.find(t=>t.id===id);if(timer)timer.cancelled=true;};\n const Runtime=new Function('performance','clearTimeout','hoverBearingImageId','distanceMeters','needsHoverBearingMetadata','mergeHoverBearingMetadata','hoverPreviewBearing','HoverBearingSector','setTimeout','fetch','renderImageryHoverCard','positionImageryHoverCard','GRAPH_API','TURBO_LIMITS',compile('class Runtime{'+method+'}')+';return Runtime')({now:()=>time},cancel,targetModule.exports.hoverBearingImageId,()=>0,...Object.values(helpers.exports),class{show(...args){shows.push(args)}clear(){}},schedule,async url=>{urls.push(url);calls++;return{ok:true,json:()=>respond()}},(...args)=>cards.push(args),()=>{},{BASE:'https://example.com'},{hoverDetailsDelayMs:1});\n const w=new Runtime();w.state={turboModeActive:true,jimuMapView:{view:{container:{getBoundingClientRect:()=>({})}}}};w.accessToken='test';w._liveSequenceFrames={complete:null};w._hoverBearingHints=new targetModule.exports.HoverBearingHintCache();w.getTurboOrganizationId=()=>undefined;w.runSequenceBackground=(fn,signal)=>fn(signal);w.tooltipDiv={};w._turboMetadataCache=cache;w._turboHoverAnchor={};w._lastBearing=287;\n w.clearTurboHoverDetails=()=>{w._turboHoverInfoAbort?.abort();cancel(w._hoverTimeout);w._coverageFrameHoverTarget=null};w.showTurboHover=()=>pulses++;w.highlightSequenceOnVTL=()=>{};w.prepareCoverageFrameHover=()=>{};w._coverageSelectionTargets={hover(){}};w.coverageSelectionContext=()=>({});\n const graphic={attributes:{image_id:'A',turbo_representative:true},geometry:{}};\n return{w,graphic,shows,cards,cache,urls,timers,pulses:()=>pulses,calls:()=>calls,run:async()=>{await Promise.resolve();await Promise.resolve();let timer;while(timers.length){timer=timers.shift();if(!timer.cancelled)break;timer=undefined;}if(timer){time+=timer.delay;await timer.fn();}},response:fn=>respond=fn,advance:ms=>time+=ms};\n}\n\ntest('existing card without bearing is enriched once and cone reuses cached result',async()=>{const x=setup({id:'A',thumb_256_url:'thumb'});x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],45);assert.equal(x.cache.get('A').thumb_256_url,'thumb');x.w._currentHoveredFeatureId=null;x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),1)});\ntest('bearing received after pointer leave cannot create cone or update metadata cache',async()=>{const x=setup({id:'A'});let release;x.response(()=>new Promise(resolve=>release=resolve));x.w.updateTurboHover(x.graphic,0,0);const pending=x.run();while(!release)await new Promise(r=>setImmediate(r));x.w._turboHoverInfoAbort.abort();release({id:'A',compass_angle:30});await pending;assert.equal(x.shows.length,0);assert.equal(x.cache.get('A').__hoverBearingLoaded,undefined)});\ntest('panorama cached heading policy uses current viewer preview direction without a request',async()=>{const x=setup({id:'A',is_pano:true,computed_compass_angle:null,compass_angle:null});x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(x.calls(),0);assert.equal(x.shows[0][1],287)});\n\nfor(const [type,zoom]of [['2d',7],['3d',8]])test(`${type} zoom ${zoom} uses the clicked nearby frame bearing instead of the line representative`,async()=>{const x=setup({id:'A',computed_compass_angle:10});x.w.state.jimuMapView.view.zoom=zoom;x.w.state.jimuMapView.view.type=type;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:-85.766008,latitude:37.606740};const target={key:'line',location:{lon:-85.766008,lat:37.606740}};x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget=target;let lookups=0;x.w.ensureCoverageFrameLookup=()=>({resolve:async()=>{lookups++;return 'B'}});x.response(async()=>({id:'B',compass_angle:170,is_pano:false}));x.w.updateTurboHover(x.graphic,0,0);await x.run();assert.equal(lookups,1);assert(x.urls[0].includes('/B?'));assert.equal(x.shows[0][1],170);assert.equal(x.cache.get('A').computed_compass_angle,10);assert.equal(x.cache.get('B').compass_angle,170);assert.equal(x.w._currentHoveredFeatureId,'A')});\ntest('moving along one representative invalidates only old metadata while keeping its pulse identity',async()=>{const x=setup();x.w.state.jimuMapView.view.zoom=8;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:0,latitude:0};let release,key=0;const hints=['B','C'];x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget={key:String(++key),location:{lon:key,lat:0}};x.w.ensureCoverageFrameLookup=()=>({resolve:async(_v,_s,p)=>p.lon===1?new Promise(r=>release=r):hints[1]});x.response(async()=>({id:'C',computed_compass_angle:210,is_pano:false}));x.w.updateTurboHover(x.graphic,0,0);const first=x.run();while(!release)await new Promise(r=>setImmediate(r));x.w.updateTurboHover(x.graphic,1,0);await x.run();release('B');await first;assert.equal(x.calls(),1);assert(x.urls[0].includes('/C?'));assert.equal(x.shows.length,1);assert.equal(x.shows[0][1],210);assert.equal(x.w._currentHoveredFeatureId,'A')});\n\nfunction regional(x){x.w.state.jimuMapView.view.zoom=8;x.graphic.attributes.sequence_id='sequence';x.graphic.geometry={longitude:1,latitude:2};const target={key:'line',location:{lon:1,lat:2}};x.w.prepareCoverageFrameHover=()=>x.w._coverageFrameHoverTarget=target;return target;}\ntest('ready regional card and bearing appear synchronously without a timer, lookup or request',()=>{const x=setup({id:'A',compass_angle:10});regional(x);x.cache.set('B',{id:'B',compass_angle:170,thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.w.ensureCoverageFrameLookup=()=>{throw Error('must not resolve a completed hint again')};x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.pulses(),1);assert.equal(x.shows[0][1],170);assert.equal(x.cards.at(-1)[1].id,'B');assert.equal(x.timers.length,0);assert.equal(x.calls(),0)});\ntest('partial cached card is immediate but only missing metadata waits for dwell',async()=>{const x=setup();regional(x);x.cache.set('B',{id:'B',thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.response(async()=>({id:'B',compass_angle:190}));x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.cards[0][1].id,'B');assert.equal(x.shows.length,0);assert.equal(x.calls(),0);assert.equal(x.timers[0].delay,150);await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],190)});\ntest('cold regional targets keep the immediate pulse and one dwell before resolving',async()=>{const x=setup({id:'A',compass_angle:10});regional(x);let lookups=0;x.w.ensureCoverageFrameLookup=()=>({resolve:async()=>{lookups++;return 'B'}});x.response(async()=>({id:'B',compass_angle:170}));x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.pulses(),1);assert.equal(x.calls(),0);assert.equal(lookups,0);assert.equal(x.shows.length,0);assert.equal(x.timers[0].delay,150);await x.run();assert.equal(lookups,1);assert.equal(x.calls(),1);assert.equal(x.timers.length,0);assert.equal(x.shows[0][1],170)});\ntest('leaving during partial enrichment cancels its timer without a request',async()=>{const x=setup();regional(x);x.cache.set('B',{id:'B',thumb_256_url:'thumb-B'});x.w._coverageFrameLookup={peek:()=> 'B'};x.w.updateTurboHover(x.graphic,0,0);x.w.clearTurboHoverDetails();await x.run();assert.equal(x.calls(),0);assert.equal(x.shows.length,0)});\ntest('local-route cached hints bypass scans but unrelated tile hints cannot replace their policy',()=>{const x=setup();regional(x);const frames=[{id:'B',lon:1,lat:2}];x.w.state.sequenceId='sequence';x.w.state.sequenceImages=frames;x.w._liveSequenceFrames.complete=frames;x.cache.set('B',{id:'B',compass_angle:170});x.w._coverageFrameLookup={peek(){throw Error('tile hint must not replace active route policy')}};x.w._hoverBearingHints.remember(x.w.state.jimuMapView.view,frames,JSON.stringify(['sequence',1,2]),'B');x.w.updateTurboHover(x.graphic,0,0);assert.equal(x.shows[0][1],170);assert.equal(x.timers.length,0);assert.equal(x.calls(),0)});\n\n// An individual point must reach preview scheduling at every interactive zoom,\n// even when no metadata exists yet. Warm revisits must not introduce another dwell.\nfor(const type of ['2d','3d'])for(const zoom of [16.2,19.9])test(`${type} zoom ${zoom}: real metadata cache permits cold hover and immediate warm revisit`,async()=>{\n const x=setup();x.w.state.jimuMapView.view.type=type;x.w.state.jimuMapView.view.zoom=zoom;\n x.graphic.attributes.turbo_representative=false;\n assert.equal(typeof x.cache.has,'undefined');\n assert.doesNotThrow(()=>x.w.updateTurboHover(x.graphic,100,100));\n assert.equal(x.pulses(),1);assert.equal(x.calls(),0);assert.equal(x.timers.length,1);\n await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],45);\n x.w._currentHoveredFeatureId=null;\n x.w.updateTurboHover(x.graphic,100,100);\n assert.equal(x.timers.length,0);assert.equal(x.shows.length,2);assert.equal(x.calls(),1);\n});\ntest('expired production metadata is refreshed instead of treated as a warm hover',async()=>{\n const x=setup({id:'A',compass_angle:10});x.graphic.attributes.turbo_representative=false;\n x.advance(300001);x.w.updateTurboHover(x.graphic,0,0);\n assert.equal(x.shows.length,0);assert.equal(x.timers.length,1);\n await x.run();assert.equal(x.calls(),1);assert.equal(x.shows[0][1],45);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/HOVER-CACHE-CONTRACT-FIX.md",
      "content": "# Hover metadata cache contract fix\n\nThe v6.120 warm-preview check called `TurboMetadataCache.has`, but the production cache implements `get`, `set`, `size` and `clear`. A truthy preview image ID therefore triggered a synchronous TypeError before preview scheduling, including cold individual-point hovers. The pointer callback caught that error and removed the new hover feedback. A user trace at 2D zoom 16.2 contains ten successful point picks followed by ten updateTurboHover TypeErrors, with no metadata entries or visible preview.\n\nUse the existing TTL-aware `get` contract to check availability. This also rejects expired entries instead of bypassing cache expiry. Accurate nearby-image bearings, cold dwell, cancellation, image IDs, click behavior, selected sequence overview and rendering remain unchanged.\n\nThe runtime test now instantiates the production cache class instead of Map. With those realistic fixtures the previous implementation fails 12 of 16 cases with `this._turboMetadataCache.has is not a function`; the fix passes all 16. Tests include 2D and 3D zooms 16.2/19.9, cold points, immediate warm revisits, partial cards, expired entries, regional bearings, stale-response cancellation and active-route hints.\n\nApply from the widget root: `node apply-hover-cache-contract-fix.cjs`. Rebuild and reload Experience Builder. The installer does not run tests or a build. `--dry-run` checks targets without source writes; `--uninstall` reverses only unchanged installed blocks. A standalone uninstaller is also provided. This narrowly fixes the reproduced crash; it does not claim to eliminate all cold network latency or validate live SDK terrain projection.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'hover-cache-contract-fix-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.121 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'hover-cache-contract-fix' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.121 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-hover-cache-contract-fix.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Hover metadata cache contract fix is already installed. No files changed.');
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
  const manifest = { installer: 'hover-cache-contract-fix', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Hover metadata cache contract fix ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
