const test=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../tools/diagnostics/places-direct-source-probe.cjs');
function fixture({status=206,host='https://overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com/tiles/2026-10-21.0/places.pmtiles'}={}){
 const calls=[],header=new Uint8Array(127);header.set(new TextEncoder().encode('PMTiles'));header[7]=3;header[99]=1;header[100]=0;header[101]=15;
 const json=[{latest:'2026-10-21.0',links:[{rel:'child',latest:true,href:'./2026-10-21.0/catalog.json'}]},{id:'2026-10-21.0',links:[{rel:'child',title:'Places',href:'./places/catalog.json'}]},{links:[{rel:'pmtiles',href:host}]}];
 return{calls,fetcher:async(url,options)=>{calls.push({url,options});return calls.length<4?new Response(JSON.stringify(json[calls.length-1])):new Response(header,{status,headers:{'Content-Range':'bytes 0-126/99999'}})}};
}
test('probe follows official catalog links, reads only a header and makes no operational claims',async()=>{
 const f=fixture(),r=await run({fetcher:f.fetcher,release:'2026-10-21.0'});assert.equal(r.requests,4);assert(r.bytesRead<1024);assert.equal(r.rangeSupported,true);assert.equal(r.tileType,'MVT');assert.equal(r.maxZoom,15);assert.equal(r.browserCorsVerified,false);assert.equal(r.operationalProviderApproved,false);assert.equal(r.completeSearchAndFiltersVerified,false);
 assert.equal(f.calls[3].options.headers.Range,'bytes=0-126');assert(f.calls.every(c=>c.options.credentials==='omit'));assert(f.calls.every(c=>c.options.signal.aborted));
});
test('a server ignoring Range is rejected before downloading its archive',async()=>{const f=fixture({status:200});await assert.rejects(run({fetcher:f.fetcher}),/206/)});
test('unexpected catalog destinations and malformed release IDs are rejected',async()=>{const f=fixture({host:'https://unrelated.example/places.pmtiles'});await assert.rejects(run({fetcher:f.fetcher}),/Unexpected/);assert.equal(f.calls.length,3);await assert.rejects(run({release:'../latest',fetcher:f.fetcher}),/pinned/)});
test('catalog byte budgets prevent unbounded metadata reads',async()=>{await assert.rejects(run({fetcher:async()=>new Response('x'.repeat(300000))}),/byte budget/)});
