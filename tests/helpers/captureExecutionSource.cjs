/** Historical policy adapters still bind config/log/draw/publication through `this`.
 * Read CURRENT routing execution, mapping only host integration syntax to that fixture boundary.
 * Do not substitute algorithms, guards, request ordering or frozen implementation text.
 */
const fs=require('node:fs'),path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function captureExecutionSource(){
 let source=fs.readFileSync(path.resolve(__dirname,'../../src/features/routing/executeCaptureRoute.ts'),'utf8');
 source=source.replaceAll('host.config()','this.CAPTURE_ROUTE_CONFIG').replaceAll('host.log(','this.log(').replaceAll('host.warn(','this.warn(').replaceAll('host.consoleWarn(','console.warn(').replaceAll('host.draw(','this.drawCaptureRoute(');
 const sf=ts.createSourceFile('execution.ts',source,99,true),edits=[];
 function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='host.publish')edits.push([n.getStart(sf),n.end,'this.setState({\n        routeData: '+n.arguments[0].getText(sf)+',\n      })']);ts.forEachChild(n,visit)}visit(sf);
 for(const [a,b,value] of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,a)+value+source.slice(b);
 return source;
}
module.exports={captureExecutionSource};
