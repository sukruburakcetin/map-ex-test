#!/usr/bin/env node
'use strict';
/**
 * Detection defaults fix confirmation. Compatible current v6 sources.
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
      "file": "src/features/detections/detectionExploration.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection defaults fix 1",
              "before": "/** Image detection exploration is independent of map sprite visibility and export. */\nexport const detectionGroups = ['signs','objects','vehicles','people','markings','structures','other','background'] as const;\nexport type DetectionGroup = typeof detectionGroups[number];\nexport type DetectionLabelMode = 'focus' | 'all';\nexport interface DetectionExplorerOptions { mode: 'filtered' | 'explore'; groups: DetectionGroup[]; labelMode: DetectionLabelMode; }\nexport interface DetectionSummary { total:number; shown:number; counts:Partial<Record<DetectionGroup,number>>; loading?:boolean; error?:boolean; }\nexport const defaultDetectionExplorer:DetectionExplorerOptions={mode:'filtered',groups:['signs','objects','vehicles','people','markings','structures','other'],labelMode:'focus'};\nexport const detectionGroupNames:Record<DetectionGroup,string>={signs:'Traffic signs',objects:'Street objects',vehicles:'Vehicles',people:'People',markings:'Road markings',structures:'Structures',other:'Other',background:'Background'};\nexport function detectionGroup(value:string,knownSigns?:ReadonlySet<string>):DetectionGroup {\n const parts=value.split('--');\n if(knownSigns?.has(value)||['regulatory','warning','information','complementary','traffic-sign'].includes(parts[0]))return 'signs';\n if(parts[0]==='human'||parts[0]==='person')return 'people';\n if(parts[0]==='vehicle'||parts[1]==='vehicle')return 'vehicles';\n if(parts[0]==='nature'||parts[0]==='void'||parts[0]==='unlabeled'||parts[1]==='sky'||parts[1]==='terrain'||parts[1]==='vegetation'||parts[1]==='wire'||parts[1]==='wire-group')return 'background';\n if(parts[0]==='construction'&&((parts[1]==='flat'&&['road','sidewalk','parking','rail-track'].includes(parts[2]))||(parts[1]==='structure'&&['building','bridge','tunnel'].includes(parts[2]))))return 'background';\n if(parts[0]==='marking')return 'markings';\n if(parts[0]==='construction')return 'structures';\n if(parts[0]==='object')return 'objects';\n return 'other';\n}\nexport function showDetection(value:string,group:DetectionGroup,options:DetectionExplorerOptions,filters:{signs:boolean;objects:boolean;signCode?:string;objectCode?:string;knownObjects:ReadonlySet<string>}):boolean {\n if(options.mode==='explore')return options.groups.includes(group);\n if(group==='signs')return filters.signs&&(!filters.signCode||filters.signCode==='All traffic signs'||filters.signCode===value);\n return filters.objects&&filters.knownObjects.has(value)&&(!filters.objectCode||filters.objectCode==='All points'||filters.objectCode===value);\n}\n",
              "after": "import { DETECTION_HIDDEN_RAW, DETECTION_HIDDEN_CATEGORIES } from '../../utils/constants';\n/** Image detection exploration is independent of map sprite visibility and export. */\nexport const detectionGroups = ['signs','objects','vehicles','people','markings','structures','other','background'] as const;\nexport type DetectionGroup = typeof detectionGroups[number];\nexport type DetectionLabelMode = 'focus' | 'all';\nexport interface DetectionExplorerOptions { mode: 'filtered' | 'explore'; groups: DetectionGroup[]; labelMode: DetectionLabelMode; }\nexport interface DetectionSummary { total:number; shown:number; counts:Partial<Record<DetectionGroup,number>>; loading?:boolean; error?:boolean; }\nexport const defaultDetectionExplorer:DetectionExplorerOptions={mode:'filtered',groups:['signs','objects','vehicles','people','markings','structures','other'],labelMode:'all'};\nexport const detectionGroupNames:Record<DetectionGroup,string>={signs:'Traffic signs',objects:'Street objects',vehicles:'Vehicles',people:'People',markings:'Road markings',structures:'Structures',other:'Other',background:'Background'};\nexport function detectionGroup(value:string,knownSigns?:ReadonlySet<string>):DetectionGroup {\n const parts=value.split('--');\n if(knownSigns?.has(value)||['regulatory','warning','information','complementary','traffic-sign'].includes(parts[0]))return 'signs';\n if(parts[0]==='human'||parts[0]==='person')return 'people';\n if(parts[0]==='vehicle'||parts[1]==='vehicle')return 'vehicles';\n if(parts[0]==='nature'||parts[0]==='void'||parts[0]==='unlabeled'||parts[1]==='sky'||parts[1]==='terrain'||parts[1]==='vegetation'||parts[1]==='wire'||parts[1]==='wire-group')return 'background';\n if(parts[0]==='construction'&&((parts[1]==='flat'&&['road','sidewalk','parking','rail-track'].includes(parts[2]))||(parts[1]==='structure'&&['building','bridge','tunnel'].includes(parts[2]))))return 'background';\n if(parts[0]==='marking')return 'markings';\n if(parts[0]==='construction')return 'structures';\n if(parts[0]==='object')return 'objects';\n return 'other';\n}\nexport function showDetection(value:string,group:DetectionGroup,options:DetectionExplorerOptions,filters:{signs:boolean;objects:boolean;signCode?:string;objectCode?:string;knownObjects:ReadonlySet<string>}):boolean {\n if(options.mode==='explore')return options.groups.includes(group);\n // Standard view preserves the original image-overlay rules. Map sprite source/filter\n // state must not suppress image detections (their classification codes can differ).\n const labelFull=value.split('--').map(part=>part.charAt(0).toUpperCase()+part.slice(1).replace(/-/g,' ')).join(' ').toLowerCase();\n const raw=value.split('--').pop() || '';\n return !DETECTION_HIDDEN_RAW.includes(raw) && !DETECTION_HIDDEN_CATEGORIES.some(category=>labelFull.includes(category));\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/detections/DetectionExplorerControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection defaults fix 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { detectionGroups, detectionGroupNames } from './detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from './detectionExploration';\nexport function DetectionExplorerControls({options,summary,onChange}:{options:DetectionExplorerOptions;summary:DetectionSummary;onChange:(options:DetectionExplorerOptions)=>void}){\n const {owned:text}=useWidgetLocale();\n const select:React.CSSProperties={width:'100%',minWidth:0,boxSizing:'border-box',background:'#182d24',color:'#e1eee5',border:'1px solid #648b73',borderRadius:4,font:'inherit',padding:'4px 2px'};\n return <details className=\"mly-detection-explorer\" style={{fontSize:9,minWidth:0,borderTop:'1px solid #648b7344',paddingTop:4}}>\n  <summary style={{cursor:'pointer',paddingBlock:4}}>{text('Detection categories')}{summary.total>0?` \u00b7 ${summary.shown}/${summary.total}`:''}</summary>\n  <div style={{display:'grid',gap:6,paddingBlock:4}}>\n   <label style={{display:'grid',gap:3}}>{text('Show')}<select aria-label={text('Detection scope')} style={select} value={options.mode} onChange={event=>onChange({...options,mode:event.target.value as DetectionExplorerOptions['mode']})}><option value=\"filtered\">{text('Filtered')}</option><option value=\"explore\">{text('Explore all')}</option></select></label>\n   <span role={summary.error?'alert':'status'}>{summary.loading?text('Loading detections\u2026'):summary.error?text('Could not load detections. Toggle AI Overlay to retry.'):`${summary.shown} / ${summary.total} ${text('detections shown')}`}</span>\n   {options.mode==='filtered'&&<small>{text('Matches map filters; selected objects stay visible.')}</small>}\n   {options.mode==='explore'&&<React.Fragment>\n    {detectionGroups.filter(group=>group!=='background'&&(summary.counts[group]||0)>0).map(group=><label key={group} style={{display:'flex',alignItems:'center',gap:4}}><input type=\"checkbox\" style={{margin:0,flexShrink:0}} checked={options.groups.includes(group)} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,group]:options.groups.filter(value=>value!==group)})}/><span style={{minWidth:0,overflowWrap:'anywhere'}}>{text(detectionGroupNames[group])} \u00b7 {summary.counts[group]}</span></label>)}\n    {!!summary.counts.background&&<details><summary style={{cursor:'pointer'}}>{text('Background categories')}</summary><label style={{display:'flex',gap:4,paddingTop:4}}><input type=\"checkbox\" style={{margin:0}} checked={options.groups.includes('background')} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,'background']:options.groups.filter(value=>value!=='background')})}/>{text('Background')} \u00b7 {summary.counts.background}</label></details>}\n   </React.Fragment>}\n   <label style={{display:'grid',gap:3}}>{text('Label display')}<select aria-label={text('Label display')} style={select} value={options.labelMode} onChange={event=>onChange({...options,labelMode:event.target.value as DetectionExplorerOptions['labelMode']})}><option value=\"focus\">{text('On hover/select')}</option><option value=\"all\">{text('All visible')}</option></select></label>\n   <small>{text('Tap an outline to select its label. Map selections stay visible.')}</small>\n  </div>\n </details>;\n}\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { detectionGroups, detectionGroupNames } from './detectionExploration';\nimport type { DetectionExplorerOptions, DetectionSummary } from './detectionExploration';\nexport function DetectionExplorerControls({options,summary,onChange}:{options:DetectionExplorerOptions;summary:DetectionSummary;onChange:(options:DetectionExplorerOptions)=>void}){\n const {owned:text}=useWidgetLocale();\n const select:React.CSSProperties={width:'100%',minWidth:0,maxWidth:'100%',boxSizing:'border-box',background:'#182d24',color:'#e1eee5',border:'1px solid #648b73',borderRadius:4,fontSize:9,lineHeight:1.3,padding:'4px',height:26};\n const field:React.CSSProperties={display:'grid',gap:3,margin:0,color:'#d3e2d9',fontSize:9,minWidth:0};\n const check:React.CSSProperties={display:'flex',alignItems:'center',gap:4,margin:0,color:'#d3e2d9',fontSize:9,minWidth:0};\n return <details className=\"mly-detection-explorer\" style={{fontSize:9,lineHeight:1.3,color:'#d3e2d9',minWidth:0,boxSizing:'border-box',background:'#12241c',border:'1px solid #648b7344',borderRadius:5,padding:'3px 5px'}}>\n  <style>{`\n   .mly-detection-explorer { color:#d3e2d9 !important; }\n   .mly-detection-explorer :is(label,span,small,summary,select,option),\n   .mly-info-panel .mly-info-body .mly-detection-explorer :is(label,span,small,summary,select,option) { color:#d3e2d9 !important; font-size:9px !important; line-height:1.3 !important; }\n   .mly-detection-explorer label { margin:0 !important; }\n   .mly-info-panel .mly-info-body .mly-detection-explorer summary { padding:3px 0 !important; }\n   .mly-detection-explorer select { min-height:26px !important; height:26px !important; }\n  `}</style>\n  <summary style={{cursor:'pointer',paddingBlock:3}}>{text('Detections')}</summary>\n  <div style={{display:'grid',gap:6,paddingBlock:4,minWidth:0}}>\n   <label style={field}>{text('View')}<select aria-label={text('Detection scope')} title={text('Standard keeps the original detection visibility. Explore reveals additional categories.')} style={select} value={options.mode} onChange={event=>onChange({...options,mode:event.target.value as DetectionExplorerOptions['mode']})}><option value=\"filtered\">{text('Standard')}</option><option value=\"explore\">{text('Explore')}</option></select></label>\n   <span role={summary.error?'alert':'status'} style={{color:'#b7cabe',fontSize:9}}>{summary.loading?text('Loading\u2026'):summary.error?text('Load failed. Toggle AI Overlay to retry.'):`${summary.shown} / ${summary.total} ${text('shown')}`}</span>\n   {options.mode==='explore'&&<React.Fragment>\n    {detectionGroups.filter(group=>group!=='background'&&(summary.counts[group]||0)>0).map(group=><label key={group} style={check}><input type=\"checkbox\" style={{margin:0,flexShrink:0}} checked={options.groups.includes(group)} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,group]:options.groups.filter(value=>value!==group)})}/><span style={{minWidth:0,overflowWrap:'anywhere'}}>{text(detectionGroupNames[group])} \u00b7 {summary.counts[group]}</span></label>)}\n    {!!summary.counts.background&&<details><summary style={{cursor:'pointer'}}>{text('Background')}</summary><label style={check}><input type=\"checkbox\" style={{margin:0}} checked={options.groups.includes('background')} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,'background']:options.groups.filter(value=>value!=='background')})}/>{text('Show background')} \u00b7 {summary.counts.background}</label></details>}\n   </React.Fragment>}\n   <label style={field}>{text('Labels')}<select aria-label={text('Label display')} style={select} value={options.labelMode} onChange={event=>onChange({...options,labelMode:event.target.value as DetectionExplorerOptions['labelMode']})}><option value=\"all\">{text('All visible')}</option><option value=\"focus\">{text('On hover/tap')}</option></select></label>\n  </div>\n </details>;\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/detectionExploration.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection defaults fix 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst mod={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/detections/detectionExploration.ts'),'utf8')))(mod,mod.exports);const {detectionGroup:group,showDetection:show,defaultDetectionExplorer:defaults}=mod.exports;\nconst filters={signs:true,objects:true,knownObjects:new Set(['object--support--pole','construction--barrier--temporary'])};\ntest('explicit categories preserve useful vehicles/people/markings while broad surfaces are background',()=>{for(const [code,expected] of [['object--vehicle--car','vehicles'],['human--person','people'],['marking--continuous--solid','markings'],['construction--barrier--temporary','structures'],['construction--flat--road','background'],['nature--vegetation','background'],['object--wire-group','background'],['regulatory--stop--g1','signs']])assert.equal(group(code),expected)});\ntest('filtered mode requires enabled sources, supported object codes and exact active filters',()=>{assert(show('object--support--pole','objects',defaults,filters));assert(!show('object--vehicle--car','vehicles',defaults,filters));assert(show('construction--barrier--temporary','structures',defaults,filters));assert(!show('regulatory--stop--g1','signs',defaults,{...filters,signs:false}));assert(!show('regulatory--stop--g1','signs',defaults,{...filters,signCode:'regulatory--yield--g1'}));assert(!show('object--support--pole','objects',defaults,{...filters,objectCode:'object--bench'}))});\ntest('explore mode reveals individual groups independently and background is opt-in',()=>{const options={...defaults,mode:'explore'};assert(show('object--vehicle--car','vehicles',options,{...filters,objects:false}));assert(!show('nature--sky','background',options,filters));assert(show('nature--sky','background',{...options,groups:[...options.groups,'background']},filters));assert(!show('object--vehicle--car','vehicles',{...options,groups:['signs']},filters))});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nfunction fixture(){class Geometry{constructor(polygon){this.polygon=polygon}}class Tag{constructor(id,geometry,options){Object.assign(this,{id,geometry,options})}}\nconst method=widget.members.find(n=>n.name?.getText(sf)==='setupDetectionHover').getText(sf),Runtime=new Function('PolygonGeometry','OutlineTag','getDetectionColor',compile('class Runtime{'+method+'};return Runtime;'))(Geometry,Tag,()=>0x00ff00),w=new Runtime(),container=new EventTarget();container.querySelector=()=>({getBoundingClientRect:()=>({left:0,top:0})});const component={tags:[],ids:[],removeAll(){this.tags=[]},add(tags){this.tags.push(...tags)},async getTagIdsAt(){return this.ids}};w.viewerContainer={current:container};w.mapillaryViewer={};w.state={showAiTags:true,detectionExplorer:{...defaults}};w.getDetectionValueFromTagId=id=>'object--'+id;w._panoramaDetectionLabels={setActive(ids){this.ids=ids}};w.setupDetectionHover(component,['pole','bench'].map(id=>new Tag(id,new Geometry([[0,0],[1,1]]),{})));component._refreshDetectionLabels();return{w,component,container,click:async ids=>{component.ids=ids;container.dispatchEvent(Object.assign(new Event('click'),{clientX:20,clientY:20}));await new Promise(resolve=>setImmediate(resolve))}};}\ntest('tap selects one label, persists after pointer leave, empty tap clears, all mode restores text',async()=>{const x=fixture();assert(x.component.tags.every(tag=>!tag.options.text));await x.click(['pole']);assert.equal(x.component.tags.find(tag=>tag.id==='pole').options.text,'Object Pole');assert.equal(x.component.tags.find(tag=>tag.id==='bench').options.text,'');assert.deepEqual([...x.w._panoramaDetectionLabels.ids],['pole']);x.container.dispatchEvent(new Event('mouseleave'));assert.equal(x.component.tags.find(tag=>tag.id==='pole').options.text,'Object Pole');await x.click([]);assert(x.component.tags.every(tag=>!tag.options.text));x.w.state.detectionExplorer.labelMode='all';x.component._refreshDetectionLabels();assert(x.component.tags.every(tag=>tag.options.text));assert.equal(x.w._panoramaDetectionLabels.ids,null);x.component._detectionHoverCleanup()});\ntest('pending tap cannot restore tags after hover owner cleanup',async()=>{const x=fixture();let resolve;x.component.getTagIdsAt=()=>new Promise(done=>resolve=done);x.container.dispatchEvent(Object.assign(new Event('click'),{clientX:20,clientY:20}));x.component._detectionHoverCleanup();x.component.tags=[];resolve(['pole']);await new Promise(done=>setImmediate(done));assert.equal(x.component.tags.length,0)});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst constantsModule={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/utils/constants.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(constantsModule,constantsModule.exports);\nconst mod={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/detections/detectionExploration.ts'),'utf8')))(()=>constantsModule.exports,mod,mod.exports);const {detectionGroup:group,showDetection:show,defaultDetectionExplorer:defaults}=mod.exports;\nconst filters={signs:true,objects:true,knownObjects:new Set(['object--support--pole','construction--barrier--temporary'])};\ntest('explicit categories preserve useful vehicles/people/markings while broad surfaces are background',()=>{for(const [code,expected] of [['object--vehicle--car','vehicles'],['human--person','people'],['marking--continuous--solid','markings'],['construction--barrier--temporary','structures'],['construction--flat--road','background'],['nature--vegetation','background'],['object--wire-group','background'],['regulatory--stop--g1','signs']])assert.equal(group(code),expected)});\ntest('standard matches the pre-exploration overlay visibility regardless of map source or sprite filter',()=>{\nconst codes=['object--support--pole','object--street-light','object--fire-hydrant','object--sign--advertisement','regulatory--stop--g1','marking--discrete--stop-line','object--vehicle--car','human--person','nature--vegetation','construction--barrier--temporary','object--wire-group','void--unlabeled','marking--continuous--solid'];\nfor(const value of codes){const full=value.split('--').map(part=>part.charAt(0).toUpperCase()+part.slice(1).replace(/-/g,' ')).join(' ').toLowerCase();const expected=!constantsModule.exports.DETECTION_HIDDEN_RAW.includes(value.split('--').pop())&&!constantsModule.exports.DETECTION_HIDDEN_CATEGORIES.some(part=>full.includes(part));assert.equal(show(value,group(value),defaults,{...filters,signs:false,objects:false,signCode:'different',objectCode:'different',knownObjects:new Set()}),expected,value)}\nassert.equal(defaults.labelMode,'all');\n});\ntest('explore mode reveals individual groups independently and background is opt-in',()=>{const options={...defaults,mode:'explore'};assert(show('object--vehicle--car','vehicles',options,{...filters,objects:false}));assert(!show('nature--sky','background',options,filters));assert(show('nature--sky','background',{...options,groups:[...options.groups,'background']},filters));assert(!show('object--vehicle--car','vehicles',{...options,groups:['signs']},filters))});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nfunction fixture(){class Geometry{constructor(polygon){this.polygon=polygon}}class Tag{constructor(id,geometry,options){Object.assign(this,{id,geometry,options})}}\nconst method=widget.members.find(n=>n.name?.getText(sf)==='setupDetectionHover').getText(sf),Runtime=new Function('PolygonGeometry','OutlineTag','getDetectionColor',compile('class Runtime{'+method+'};return Runtime;'))(Geometry,Tag,()=>0x00ff00),w=new Runtime(),container=new EventTarget();container.querySelector=()=>({getBoundingClientRect:()=>({left:0,top:0})});const component={tags:[],ids:[],removeAll(){this.tags=[]},add(tags){this.tags.push(...tags)},async getTagIdsAt(){return this.ids}};w.viewerContainer={current:container};w.mapillaryViewer={};w.state={showAiTags:true,detectionExplorer:{...defaults,labelMode:'focus'}};w.getDetectionValueFromTagId=id=>'object--'+id;w._panoramaDetectionLabels={setActive(ids){this.ids=ids}};w.setupDetectionHover(component,['pole','bench'].map(id=>new Tag(id,new Geometry([[0,0],[1,1]]),{})));component._refreshDetectionLabels();return{w,component,container,click:async ids=>{component.ids=ids;container.dispatchEvent(Object.assign(new Event('click'),{clientX:20,clientY:20}));await new Promise(resolve=>setImmediate(resolve))}};}\ntest('tap selects one label, persists after pointer leave, empty tap clears, all mode restores text',async()=>{const x=fixture();assert(x.component.tags.every(tag=>!tag.options.text));await x.click(['pole']);assert.equal(x.component.tags.find(tag=>tag.id==='pole').options.text,'Object Pole');assert.equal(x.component.tags.find(tag=>tag.id==='bench').options.text,'');assert.deepEqual([...x.w._panoramaDetectionLabels.ids],['pole']);x.container.dispatchEvent(new Event('mouseleave'));assert.equal(x.component.tags.find(tag=>tag.id==='pole').options.text,'Object Pole');await x.click([]);assert(x.component.tags.every(tag=>!tag.options.text));x.w.state.detectionExplorer.labelMode='all';x.component._refreshDetectionLabels();assert(x.component.tags.every(tag=>tag.options.text));assert.equal(x.w._panoramaDetectionLabels.ids,null);x.component._detectionHoverCleanup()});\ntest('pending tap cannot restore tags after hover owner cleanup',async()=>{const x=fixture();let resolve;x.component.getTagIdsAt=()=>new Promise(done=>resolve=done);x.container.dispatchEvent(Object.assign(new Event('click'),{clientX:20,clientY:20}));x.component._detectionHoverCleanup();x.component.tags=[];resolve(['pole']);await new Promise(done=>setImmediate(done));assert.equal(x.component.tags.length,0)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/panoramaDetectionRuntime.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection defaults fix 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst policyModule={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections/detectionExploration.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(policyModule,policyModule.exports);const policy=policyModule.exports;\nconst methods=['loadDetections','clearDetectionOverlays','toggleAiTags','getDetectionValueFromTagId'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nfunction fixture(cameraType='spherical'){\n const created=[];class Geometry{constructor(polygon){this.polygon=polygon}getPoleOfInaccessibility2d(){return[.4,.5]}}\n class Tag{constructor(id,geometry,options){Object.assign(this,{id,geometry,...options})}}\n class Labels{constructor(viewer,container,labels,visible){Object.assign(this,{viewer,container,labels,visible,disposed:false});created.push(this)}dispose(){this.disposed=true}setVisible(value){this.visible=value}setActive(ids){this.ids=ids}}\n const Runtime=new Function('GRAPH_API','fetch','DETECTION_HIDDEN_RAW','DETECTION_HIDDEN_CATEGORIES','decodeAndNormalizeGeometry','PolygonGeometry','OutlineTag','getDetectionColor','PanoramaDetectionLabels','detectionGroup','showDetection',ts.transpileModule('class Runtime{'+methods+'};return Runtime;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)({BASE:'fixture'},async()=>({ok:true,json:async()=>({data:[{id:'pole',value:'object--utility-pole',geometry:'fixture'}]})}),[],[],()=>[[.3,.4],[.5,.4],[.5,.6]],Geometry,Tag,()=>0xff00,Labels,policy.detectionGroup,policy.showDetection);\n const w=new Runtime(),component={removeAll(){},add(){}};Object.assign(w,{state:{detectionExplorer:{...policy.defaultDetectionExplorer},imageId:'A',detectionsActive:true,trafficSignsActive:false,objectsActive:true,showAiTags:true},_detectionSignCodes:new Set(),_detectionObjectCodes:new Set(['object--utility-pole']),_mapFeatureFilterCodes:new Map(),viewerContainer:{current:{}},_detectionLoadRequest:0,detectionTagMap:new Map(),mapillaryViewer:{getImage:async()=>({id:'A',cameraType}),getComponent:()=>component},runSequenceBackground:fn=>fn(new AbortController().signal),setupDetectionHover(){},log(){},setState(update,callback){Object.assign(this.state,typeof update==='function'?update(this.state):update);callback?.()}});return{w,created};\n}\ntest('spherical detections create projected labels and honor off/on plus overlay cleanup',async()=>{const {w,created}=fixture();await w.loadDetections('A');assert.equal(created.length,1);assert.equal(created[0].labels[0].text,'Object Utility pole');assert.deepEqual(created[0].labels[0].point,[.4,.5]);w.toggleAiTags();assert.equal(created[0].visible,false);w.toggleAiTags();assert.equal(created[0].visible,true);w.clearDetectionOverlays();assert.equal(created[0].disposed,true);assert.equal(w._panoramaDetectionLabels,null)});\ntest('ordinary photos keep SDK-only labels without a duplicate text layer',async()=>{const {w,created}=fixture('perspective');await w.loadDetections('A');assert.equal(created.length,0)});\ntest('replacement disposes prior text and a stale image response creates no text',async()=>{const {w,created}=fixture();await w.loadDetections('A');await w.loadDetections('A');assert.equal(created[0].disposed,true);assert.equal(created.length,2);w.mapillaryViewer.getImage=async()=>({id:'B',cameraType:'spherical'});await w.loadDetections('A');assert.equal(created.length,2);w.clearDetectionOverlays()});\n\ntest('category and label changes reuse loaded data without requesting detections again',async()=>{const {w,created}=fixture();let requests=0;w.runSequenceBackground=fn=>{requests++;return fn(new AbortController().signal)};await w.loadDetections('A');w.state.detectionExplorer={...policy.defaultDetectionExplorer,mode:'explore',groups:[]};await w.loadDetections('A');assert.equal(w.state.detectionSummary.shown,0);assert.equal(w.state.detectionSummary.total,1);w.state.detectionExplorer={...policy.defaultDetectionExplorer,labelMode:'all'};await w.loadDetections('A');assert.equal(w.state.detectionSummary.shown,1);assert.equal(requests,1);w.clearDetectionOverlays()});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst constantsModule={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/utils/constants.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(constantsModule,constantsModule.exports);\nconst policyModule={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections/detectionExploration.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(()=>constantsModule.exports,policyModule,policyModule.exports);const policy=policyModule.exports;\nconst methods=['loadDetections','clearDetectionOverlays','toggleAiTags','getDetectionValueFromTagId'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nfunction fixture(cameraType='spherical'){\n const created=[];class Geometry{constructor(polygon){this.polygon=polygon}getPoleOfInaccessibility2d(){return[.4,.5]}}\n class Tag{constructor(id,geometry,options){Object.assign(this,{id,geometry,...options})}}\n class Labels{constructor(viewer,container,labels,visible){Object.assign(this,{viewer,container,labels,visible,disposed:false});created.push(this)}dispose(){this.disposed=true}setVisible(value){this.visible=value}setActive(ids){this.ids=ids}}\n const Runtime=new Function('GRAPH_API','fetch','DETECTION_HIDDEN_RAW','DETECTION_HIDDEN_CATEGORIES','decodeAndNormalizeGeometry','PolygonGeometry','OutlineTag','getDetectionColor','PanoramaDetectionLabels','detectionGroup','showDetection',ts.transpileModule('class Runtime{'+methods+'};return Runtime;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)({BASE:'fixture'},async()=>({ok:true,json:async()=>({data:[{id:'pole',value:'object--utility-pole',geometry:'fixture'}]})}),[],[],()=>[[.3,.4],[.5,.4],[.5,.6]],Geometry,Tag,()=>0xff00,Labels,policy.detectionGroup,policy.showDetection);\n const w=new Runtime(),component={removeAll(){},add(){}};Object.assign(w,{state:{detectionExplorer:{...policy.defaultDetectionExplorer},imageId:'A',detectionsActive:true,trafficSignsActive:false,objectsActive:true,showAiTags:true},_detectionSignCodes:new Set(),_detectionObjectCodes:new Set(['object--utility-pole']),_mapFeatureFilterCodes:new Map(),viewerContainer:{current:{}},_detectionLoadRequest:0,detectionTagMap:new Map(),mapillaryViewer:{getImage:async()=>({id:'A',cameraType}),getComponent:()=>component},runSequenceBackground:fn=>fn(new AbortController().signal),setupDetectionHover(){},log(){},setState(update,callback){Object.assign(this.state,typeof update==='function'?update(this.state):update);callback?.()}});return{w,created};\n}\ntest('spherical detections create projected labels and honor off/on plus overlay cleanup',async()=>{const {w,created}=fixture();await w.loadDetections('A');assert.equal(created.length,1);assert.equal(created[0].labels[0].text,'Object Utility pole');assert.deepEqual(created[0].labels[0].point,[.4,.5]);w.toggleAiTags();assert.equal(created[0].visible,false);w.toggleAiTags();assert.equal(created[0].visible,true);w.clearDetectionOverlays();assert.equal(created[0].disposed,true);assert.equal(w._panoramaDetectionLabels,null)});\ntest('ordinary photos keep SDK-only labels without a duplicate text layer',async()=>{const {w,created}=fixture('perspective');await w.loadDetections('A');assert.equal(created.length,0)});\ntest('replacement disposes prior text and a stale image response creates no text',async()=>{const {w,created}=fixture();await w.loadDetections('A');await w.loadDetections('A');assert.equal(created[0].disposed,true);assert.equal(created.length,2);w.mapillaryViewer.getImage=async()=>({id:'B',cameraType:'spherical'});await w.loadDetections('A');assert.equal(created.length,2);w.clearDetectionOverlays()});\n\ntest('category and label changes reuse loaded data without requesting detections again',async()=>{const {w,created}=fixture();let requests=0;w.runSequenceBackground=fn=>{requests++;return fn(new AbortController().signal)};await w.loadDetections('A');w.state.detectionExplorer={...policy.defaultDetectionExplorer,mode:'explore',groups:[]};await w.loadDetections('A');assert.equal(w.state.detectionSummary.shown,0);assert.equal(w.state.detectionSummary.total,1);w.state.detectionExplorer={...policy.defaultDetectionExplorer,labelMode:'all'};await w.loadDetections('A');assert.equal(w.state.detectionSummary.shown,1);assert.equal(requests,1);w.clearDetectionOverlays()});\ntest('standard restores image objects even when only signs are enabled and sprite codes do not match',async()=>{const {w,created}=fixture();w.state.trafficSignsActive=true;w.state.objectsActive=false;w._detectionObjectCodes.clear();w._mapFeatureFilterCodes.set('signs','regulatory--yield--g1');const values=['object--support--utility-pole','object--street-light','object--fire-hydrant','object--sign--advertisement','regulatory--stop--g1','object--support--utility-pole','object--street-light','object--fire-hydrant','object--sign--advertisement','object--support--pole'];w.runSequenceBackground=async()=>({data:values.map((value,index)=>({id:String(index),value,geometry:'fixture'}))});await w.loadDetections('A');assert.equal(w.state.detectionSummary.total,10);assert.equal(w.state.detectionSummary.shown,10);assert.equal(created[0].labels.length,10);assert.equal(created[0].visible,true);w.clearDetectionOverlays()});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/detectionExplorerControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Detection defaults fix 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [96,144,240,393]){const context=await browser.newContext({viewport:{width:400,height:800},isMobile:width===393,hasTouch:width===393}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><div id=\"root\" style=\"width:'+width+'px;background:#14251d;color:white\"></div>');await page.addScriptTag({path:'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({policy,controls})=>{const p={exports:{}};new Function('module','exports',policy)(p,p.exports);const c={exports:{}};new Function('require','module','exports',controls)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text})}:p.exports,c,c.exports);function App(){const [options,setOptions]=React.useState({...p.exports.defaultDetectionExplorer});window.options=options;return React.createElement(c.exports.DetectionExplorerControls,{options,summary:{shown:2,total:10,counts:{objects:2,vehicles:3,background:5}},onChange:setOptions})}ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));},{policy:compile('detectionExploration.ts'),controls:compile('DetectionExplorerControls.tsx')});\nawait page.locator('.mly-detection-explorer').waitFor();assert.equal(await page.getByLabel('Detection scope',{exact:true}).isVisible(),false);checks++;\nawait page.locator('summary').first().click();await page.getByLabel('Detection scope',{exact:true}).selectOption('explore');assert.equal(await page.getByRole('checkbox',{name:'Vehicles \u00b7 3',exact:true}).isChecked(),true);await page.getByRole('checkbox',{name:'Vehicles \u00b7 3',exact:true}).uncheck();assert.equal(await page.evaluate(()=>options.groups.includes('vehicles')),false);checks++;\nassert.equal(await page.getByRole('checkbox',{name:'Background \u00b7 5',exact:true}).isVisible(),false);await page.getByText('Background categories',{exact:true}).click();await page.getByRole('checkbox',{name:'Background \u00b7 5',exact:true}).check();assert.equal(await page.evaluate(()=>options.groups.includes('background')),true);checks++;\nawait page.getByLabel('Label display',{exact:true}).selectOption('all');assert.equal(await page.evaluate(()=>options.labelMode),'all');await page.getByLabel('Detection scope',{exact:true}).selectOption('filtered');assert.equal(await page.getByRole('checkbox').count(),0);checks++;\nassert.equal(await page.locator('#root').evaluate(element=>element.scrollWidth<=element.clientWidth+1),true);assert.deepEqual(errors,[]);checks++;await context.close()}console.log(checks+' detection explorer Chromium checks passed at96,144,240 and393px including touch.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/detections',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [96,144,240,393]){const context=await browser.newContext({viewport:{width:400,height:800},isMobile:width===393,hasTouch:width===393}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setContent('<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>label,small{color:black;font-size:14px} .mly-info-panel .mly-info-body label{color:black}</style><div class=\"mly-info-panel\"><div class=\"mly-info-body\"><div id=\"root\" style=\"width:'+width+'px;background:#14251d;color:white\"></div></div></div>');await page.addScriptTag({path:'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({policy,controls,constants})=>{const k={exports:{}};new Function('module','exports',constants)(k,k.exports);const p={exports:{}};new Function('require','module','exports',policy)(()=>k.exports,p,p.exports);const c={exports:{}};new Function('require','module','exports',controls)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text})}:p.exports,c,c.exports);function App(){const [options,setOptions]=React.useState({...p.exports.defaultDetectionExplorer});window.options=options;return React.createElement(c.exports.DetectionExplorerControls,{options,summary:{shown:2,total:10,counts:{objects:2,vehicles:3,background:5}},onChange:setOptions})}ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));},{policy:compile('detectionExploration.ts'),controls:compile('DetectionExplorerControls.tsx'),constants:compile('../../utils/constants.ts')});\nawait page.locator('.mly-detection-explorer').waitFor();assert.equal(await page.getByLabel('Detection scope',{exact:true}).isVisible(),false);checks++;\nawait page.locator('summary').first().click();assert.equal(await page.getByLabel('Label display',{exact:true}).inputValue(),'all');assert.equal(await page.locator('.mly-detection-explorer label').first().evaluate(e=>getComputedStyle(e).color),'rgb(211, 226, 217)');assert((await page.locator('.mly-detection-explorer').boundingBox()).height<170);checks++;await page.getByLabel('Detection scope',{exact:true}).selectOption('explore');assert.equal(await page.getByRole('checkbox',{name:'Vehicles \u00b7 3',exact:true}).isChecked(),true);await page.getByRole('checkbox',{name:'Vehicles \u00b7 3',exact:true}).uncheck();assert.equal(await page.evaluate(()=>options.groups.includes('vehicles')),false);checks++;\nassert.equal(await page.getByRole('checkbox',{name:'Show background \u00b7 5',exact:true}).isVisible(),false);await page.getByText('Background',{exact:true}).click();await page.getByRole('checkbox',{name:'Show background \u00b7 5',exact:true}).check();assert.equal(await page.evaluate(()=>options.groups.includes('background')),true);checks++;\nawait page.getByLabel('Label display',{exact:true}).selectOption('all');assert.equal(await page.evaluate(()=>options.labelMode),'all');await page.getByLabel('Detection scope',{exact:true}).selectOption('filtered');assert.equal(await page.getByRole('checkbox').count(),0);checks++;\nassert.equal(await page.locator('#root').evaluate(element=>element.scrollWidth<=element.clientWidth+1),true);assert.deepEqual(errors,[]);checks++;await context.close()}console.log(checks+' detection explorer Chromium checks passed at96,144,240 and393px including touch.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n"
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
const prefix = 'detection-defaults-fix-';

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
    if (manifest.installer !== 'detection-defaults-fix' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-detection-defaults-fix.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Detection defaults fix confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'detection-defaults-fix', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Detection defaults fix confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
