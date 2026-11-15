/** Legend contains category symbols, never copies contribution geometry. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/MapSymbolLegend.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,m={exports:{}};
new Function('require','module','exports',code)(()=>({englishPresentation:{text:value=>value}}),m,m.exports);
test('workspace legend keys use the assigned colors and clear independently of built-in entries',()=>{
 const layers=[],view={map:{add:layer=>layers.push(layer),remove:layer=>layers.splice(layers.indexOf(layer),1)}};const legend=new m.exports.MapSymbolLegend(properties=>({...properties,destroy(){this.destroyed=true}}));legend.sync(view,'test');const layer=legend.layer;
 assert.equal(layer.source.length,0);const count=layer.renderer.uniqueValueInfos.length;
 legend.setCommunityCategories([{name:'Inspection',color:'#e53935'},{name:'Verified',color:'#1565c0'}],'Survey');assert.equal(layer.renderer.uniqueValueInfos.length,count+2);assert.equal(layer.renderer.uniqueValueInfos.at(-1).symbol.color,'#1565c0');assert(layer.renderer.uniqueValueInfos.at(-1).label.includes('Verified'));
 legend.refreshLocale();assert.equal(layer.renderer.uniqueValueInfos.length,count+2);legend.setCommunityCategories([],'');assert.equal(layer.renderer.uniqueValueInfos.length,count);legend.clear();assert.equal(layers.length,0);
});
