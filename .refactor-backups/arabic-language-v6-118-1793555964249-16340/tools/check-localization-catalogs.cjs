#!/usr/bin/env node
/** Read-only catalog QA. Identical English and context-dependent translations require review, not automatic rewriting. */
const fs=require('node:fs'),path=require('node:path');
const languages={'en':null,'en-GB':'en-gb','tr':'tr','es':'es','fr':'fr','de':'de','pt-BR':'pt-br','it':'it','ja':'ja','ko':'ko','zh-CN':'zh-cn','zh-TW':'zh-tw'};
const tokens=text=>[...text.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)].map(match=>match[1]).sort();
function auditCatalog(base,catalog){
 const errors=[],identicalEnglish=[],contextVariants=[];
 for(const key of Object.keys(catalog))if(!Object.hasOwn(base,key))errors.push({key,issue:'extra-key'});
 for(const[key,source]of Object.entries(base)){
  const target=catalog[key];
  if(typeof target!=='string'||!target.trim()){errors.push({key,issue:'missing-or-empty'});continue;}
  if(JSON.stringify(tokens(source))!==JSON.stringify(tokens(target)))errors.push({key,issue:'placeholder-mismatch'});
  if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd\u202a-\u202e\u2066-\u2069]/u.test(target)||/[\uD800-\uDFFF]/u.test(target))errors.push({key,issue:'invalid-or-hidden-character'});
  if(target===source)identicalEnglish.push({key,text:source});
 }
 const groups=new Map();for(const[key,source]of Object.entries(base)){if(!groups.has(source))groups.set(source,[]);groups.get(source).push(key);}
 for(const[text,keys]of groups)if(keys.length>1&&new Set(keys.map(key=>catalog[key])).size>1)contextVariants.push({text,translations:Object.fromEntries(keys.map(key=>[key,catalog[key]]))});
 return {entries:Object.keys(catalog).length,errors,identicalEnglish,contextVariants};
}
function run(root,ts){
 const directory=path.join(root,'src/i18n'),sourceErrors=[],seen=new Set();
 function load(file){
  const source=fs.readFileSync(path.join(directory,file),'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  if(!seen.has(file)){
   seen.add(file);for(const diagnostic of sf.parseDiagnostics)sourceErrors.push({file,issue:'syntax',message:ts.flattenDiagnosticMessageText(diagnostic.messageText,' ')});
   function visit(node){if(ts.isObjectLiteralExpression(node)){const names=new Set();for(const property of node.properties){if(!property.name||ts.isComputedPropertyName(property.name))continue;const name=property.name.text;if(names.has(name))sourceErrors.push({file,key:name,issue:'duplicate-property'});names.add(name);}}ts.forEachChild(node,visit);}visit(sf);
  }
  const module={exports:{}};new Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>load(path.posix.join(path.posix.dirname(file),id+'.ts')),module,module.exports);return module.exports;
 }
 const {en}=load('messages.ts'),{settingsEn}=load('settingsMessages.ts'),{startupMessages,startupSettings,languageName}=load('startupMessages.ts'),report={languages:{},sourceErrors,summary:{runtimeKeys:Object.keys(en).length,builderKeys:Object.keys(settingsEn).length,translatedLanguages:0,errors:0}};
 for(const[language,slug]of Object.entries(languages)){
  if(!slug)continue;
  const runtimeOverrides=load(`locales/${slug}.ts`).default,builderOverrides=load(`locales/settings-${slug}.ts`).default;
  const runtime=language==='en-GB'?{...en,...runtimeOverrides}:runtimeOverrides,builder=language==='en-GB'?{...settingsEn,...builderOverrides}:builderOverrides;
  const entry={runtime:auditCatalog(en,runtime),builder:auditCatalog(settingsEn,builder),startupErrors:[]};
  for(const[kind,subset,full]of [['runtime',startupMessages[language],runtime],['builder',startupSettings[language],builder]]){
   if(!subset)entry.startupErrors.push({kind,issue:'missing-startup-subset'});
   for(const[key,value]of Object.entries(subset||{}))if(value!==full[key])entry.startupErrors.push({kind,key,issue:'startup-mismatch'});
  }
  for(const target of Object.keys(languages))if(!languageName(language,target)?.trim())entry.startupErrors.push({target,issue:'missing-language-name'});
  report.languages[language]=entry;report.summary.translatedLanguages++;report.summary.errors+=entry.runtime.errors.length+entry.builder.errors.length+entry.startupErrors.length;
 }
 report.summary.errors+=sourceErrors.length;return report;
}
module.exports={auditCatalog,run};
if(require.main===module){
 try{const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),report=run(path.resolve(__dirname,'..'),ts),outIndex=process.argv.indexOf('--out');if(outIndex>=0){if(!process.argv[outIndex+1])throw new Error('--out requires a JSON file path');fs.writeFileSync(path.resolve(process.argv[outIndex+1]),JSON.stringify(report,null,2)+'\n');}console.log(JSON.stringify(report.summary,null,2));if(report.summary.errors)process.exitCode=1;}
 catch(error){console.error(error.message);process.exitCode=1;}
}
