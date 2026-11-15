/** Real Chromium DOM/image fixtures; no Experience Builder or Mapillary network required. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const {chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');
const root=process.env.MAPILLARY_WIDGET_ROOT||path.resolve(__dirname,'..');
const files={card:'src/features/imagery/hoverCard.ts',presentation:'src/i18n/PresentationText.ts',styles:'src/styles/imageryHoverCard.ts'};
const modules=Object.fromEntries(Object.entries(files).map(([key,file])=>[key,ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText]));
const script=`(()=>{const modules=${JSON.stringify(modules)},cache={};function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}};new Function('require','module','exports',modules[key])(id=>load(id.includes('PresentationText')?'presentation':'styles'),m,m.exports);return m.exports;}window.card=load('card');window.presentation=new(load('presentation').PresentationText)();window.host=document.createElement('div');document.body.appendChild(host);window.images=[];const original=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:original.get,set(value){images.push(this);original.set.call(this,value)}});window.render=(id='A',url='/thumb.svg',creator='before')=>card.renderImageryHoverCard(host,{id,thumb_256_url:url,creator:{username:creator},captured_at:1700000000000},undefined,false,presentation);})();`;
async function heldRoute(routes){const deadline=Date.now()+5000;while(!routes.length){if(Date.now()>deadline)throw Error('Held thumbnail request did not start');await new Promise(resolve=>setTimeout(resolve,10));}return routes[0];}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="green"/></svg>';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const errors=[];let checks=0;
 async function fixture(){const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const held=[];await page.route('https://preview.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'});if(url.pathname==='/held.svg'){held.push(route);return;}if(url.pathname==='/bad.svg')return route.fulfill({status:404,body:'missing'});return route.fulfill({contentType:'image/svg+xml',body:svg});});await page.goto('https://preview.test/');await page.addScriptTag({content:script});return{page,held};}
 try{
  {
   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);
   assert.deepEqual(await page.evaluate(()=>{const image=host.querySelector('img');render('A','/thumb.svg','after');return{same:host.querySelector('img')===image,writes:images.length,text:host.textContent.includes('after')};}),{same:true,writes:1,text:true});checks++;await page.close();
  }
  {
   const {page,held}=await fixture();await page.evaluate(()=>render('A','/held.svg'));await page.waitForFunction(()=>images.length===1);await page.evaluate(()=>render('A','/held.svg','enriched'));
   assert.equal(await page.evaluate(()=>images.length),1);await (await heldRoute(held)).fulfill({contentType:'image/svg+xml',body:svg});await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);assert.equal(await page.evaluate(()=>host.querySelector('img')===images[0]),true);checks++;await page.close();
  }
  {
   const {page,held}=await fixture();await page.evaluate(()=>render('A','/held.svg'));await heldRoute(held);await page.evaluate(()=>render('B','/thumb.svg','different image'));await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);await held[0].fulfill({contentType:'image/svg+xml',body:svg});await page.waitForFunction(()=>images[0].complete);assert.equal(await page.evaluate(()=>host.querySelector('img')===images[1]&&host.textContent.includes('different image')),true);checks++;await page.close();
  }
  {
   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);
   await page.evaluate(()=>render('A','/other.svg'));assert.equal(await page.evaluate(()=>images.length),2);await page.waitForFunction(()=>host.querySelector('img')===images[1]);checks++;await page.close();
  }
  {
   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);
   assert.equal(await page.evaluate(()=>{const image=host.querySelector('img');render('A','/thumb.svg','after');presentation.update('ar',text=>text==='Street imagery preview'?'صورة الشارع':text);return host.querySelector('img')===image&&image.alt==='صورة الشارع'&&host.dir==='rtl';}),true);checks++;await page.close();
  }
  {
   const {page}=await fixture();await page.evaluate(()=>render('A','/bad.svg'));await page.waitForFunction(()=>host.textContent.includes('Preview unavailable'));
   await page.evaluate(()=>render('A','/bad.svg'));assert.equal(await page.evaluate(()=>images.length),2);checks++;await page.close();
  }
  {
   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);
   assert.equal(await page.evaluate(()=>{host.textContent='';host.style.display='none';render();return images.length===2;}),true);checks++;await page.close();
  }
  assert.deepEqual(errors,[]);console.log(checks+' Chromium checks passed: decoded/pending retention, stale target exclusion, URL changes, live locale, failure retry and cleared-card isolation.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
