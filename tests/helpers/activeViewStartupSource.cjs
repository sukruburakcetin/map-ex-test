/** Exercise the production attachment-host -> readiness-callback -> startup-workflow chain. */
const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const parse=(name,s,kind)=>ts.createSourceFile(name,s,99,true,kind);
const root=path.resolve(__dirname,'../..');
const sf=parse('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),4);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const factory=widget.members.find(n=>n.name?.getText(sf)==='activeViewAttachmentHost');
const feature=parse('ActiveViewTransfer.ts',fs.readFileSync(root+'/src/features/navigation/ActiveViewTransfer.ts','utf8'),3);
let ready;
function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(feature)==='host.whenReady'&&n.arguments[0]?.getText(feature).includes('host.restore(context)'))ready=n.arguments[0];ts.forEachChild(n,visit);}
visit(feature);
if(!factory||!ready)throw Error('Missing production attachment/startup chain');
exports.createStartupCallback=(w,context,jmv,restoreActiveView,logger)=>{
 const Host=new Function('restoreActiveView','console',compile('return class Harness {'+factory.getText(sf)+'};'))(restoreActiveView,logger);
 const host=Host.prototype.activeViewAttachmentHost.call(w,context.view,jmv);
 return new Function('host','context',compile('return ('+ready.getText(feature)+');'))(host,context);
};
