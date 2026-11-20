// Controlled Chromium check: real Blob URL/anchor download, no remote service.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const {chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright-core');
const root=process.env.MAPILLARY_WIDGET_ROOT||path.resolve(__dirname,'..');
const code=ts.transpileModule(fs.readFileSync(path.join(root,'src/features/imagery/downloadImageFile.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
(async()=>{const browser=await chromium.launch({executablePath:process.env.MAPILLARY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();let requests=0;page.on('request',request=>{if(/^https?:/.test(request.url()))requests++;});
 await page.setContent('<!doctype html><html><body></body></html>');
 await page.addScriptTag({content:'window.exports={};'+code+';window.downloadImageFile=exports.downloadImageFile;'});
 await page.evaluate(()=>{window.fetches=[];window.revoked=[];const revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{window.revoked.push(url);revoke(url);};window.fetch=async url=>{window.fetches.push(url);return window.fetches.length===1?{json:async()=>({thumb_2048_url:'https://fixture.invalid/image.jpg'})}:{blob:async()=>new Blob(['fixture-image'],{type:'image/jpeg'})};};});
 const downloading=page.waitForEvent('download');assert.equal(await page.evaluate(()=>window.downloadImageFile('A',[{id:'A',captured_at:1704153600000}],'fixture-token','https://fixture.invalid/graph')),true);const download=await downloading;assert.equal(download.suggestedFilename(),'mapillary_A_2024-01-02.jpg');assert.equal(fs.readFileSync(await download.path(),'utf8'),'fixture-image');
 assert.deepEqual(await page.evaluate(()=>({fetches:window.fetches.length,revoked:window.revoked.length,anchors:document.querySelectorAll('a').length})),{fetches:2,revoked:1,anchors:0});
 await page.evaluate(()=>{window.fetches=[];window.fetch=async url=>{window.fetches.push(url);return{json:async()=>({})};};});assert.equal(await page.evaluate(()=>window.downloadImageFile('B',[],'fixture-token','https://fixture.invalid/graph')),false);assert.equal(await page.evaluate(()=>window.fetches.length),1);assert.equal(requests,0);
 console.log('Chromium download checks passed: dated filename, exact bytes, real Blob URL download, revocation, anchor removal, missing-image result and zero remote requests');
 }finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
