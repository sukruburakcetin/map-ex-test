/** Controlled Chromium work/DOM measurements, not an Experience Builder FPS benchmark. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const {chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');
const root=process.env.MAPILLARY_WIDGET_ROOT||path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const baseline=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/hoverPerformance.baseline.json')));
const common={presentation:compile(fs.readFileSync(path.join(root,'src/i18n/PresentationText.ts'),'utf8')),styles:compile(fs.readFileSync(path.join(root,'src/styles/imageryHoverCard.ts'),'utf8'))};
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="200" height="120" fill="#35af6d"/></svg>';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const errors=[],report={scope:'controlled-Chromium-fixture; no ExB/network-latency/FPS claim'};
try{for(const [name,card]of [['before',baseline.hoverCard],['after',fs.readFileSync(path.join(root,'src/features/imagery/hoverCard.ts'),'utf8')]]){
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('https://hover.test/**',route=>route.fulfill({contentType:route.request().url().endsWith('.svg')?'image/svg+xml':'text/html',body:route.request().url().endsWith('.svg')?svg:'<!doctype html><body></body>'}));await page.goto('https://hover.test/');
 const modules={...common,card:compile(card)};
 await page.addScriptTag({content:`(()=>{const modules=${JSON.stringify(modules)},cache={};function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}};new Function('require','module','exports',modules[key])(id=>load(id.includes('PresentationText')?'presentation':'styles'),m,m.exports);return m.exports;}window.card=load('card');window.presentation=new(load('presentation').PresentationText)();window.host=document.createElement('div');document.body.appendChild(host);window.writes=0;const original=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:original.get,set(value){writes++;original.set.call(this,value)}});window.render=id=>card.renderImageryHoverCard(host,{id,thumb_256_url:'/'+id+'.svg',creator:{username:id},captured_at:1700000000000},undefined,false,presentation);})();`});
 await page.evaluate(()=>render('A'));await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);await page.evaluate(()=>render('B'));await page.waitForFunction(()=>host.querySelector('img')?.getAttribute('src')==='/B.svg'&&host.querySelector('img')?.naturalWidth>0);
 report[name]=await page.evaluate(()=>{const before=writes;render('A');const immediate=!!host.querySelector('img')?.naturalWidth;return{sourceAssignmentsAfterABA:writes,revisitSourceAssignments:writes-before,revisitPixelsSynchronous:immediate};});
 if(name==='after'){
  assert.equal(report[name].revisitPixelsSynchronous,true);assert.equal(report[name].revisitSourceAssignments,0);
  const repeat=await page.evaluate(()=>{const before=writes;for(let i=0;i<40;i++)render(i%2?'A':'B');return{sourceAssignments:writes-before,hasPixels:!!host.querySelector('img')?.naturalWidth};});assert.deepEqual(repeat,{sourceAssignments:0,hasPixels:true});report.after.fortyWarmSwitches=repeat;
  assert.equal(await page.evaluate(()=>{const image=host.querySelector('img');presentation.update('ar',text=>text==='Street imagery preview'?'صورة الشارع':text);return host.querySelector('img')===image&&image.alt==='صورة الشارع'&&host.dir==='rtl';}),true);
  await page.evaluate(()=>{card.clearImageryHoverCardCache(host);host.textContent='';host.style.display='none';});assert.equal(await page.evaluate(()=>{const before=writes;render('A');return writes-before;}),1);
 }
 await page.close();
}
assert.equal(report.before.revisitSourceAssignments,1);assert.equal(report.before.revisitPixelsSynchronous,false);assert.deepEqual(errors,[]);
console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
