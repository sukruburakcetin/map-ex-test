#!/usr/bin/env node
/** Developer-only community translation table. Catalogs remain the runtime source of truth. */
const fs=require('node:fs'),path=require('node:path');
const locales={'tr':'tr','es':'es','fr':'fr','de':'de','pt-BR':'pt-br','it':'it','ja':'ja','ko':'ko','zh-CN':'zh-cn','zh-TW':'zh-tw'};
const columns=['scope','key','en',...Object.keys(locales)];
const tableFile='docs/localization/translations.csv';
const {auditCatalog}=require('./check-localization-catalogs.cjs');
function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';}
function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false;
 function field(){row.push(cell);cell='';closed=false;}function record(){field();rows.push(row);row=[];}
 for(let i=0;i<text.length;i++){
  const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c===','){field();continue;}if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;record();continue;}
  if(c==='"'&&!cell&&!closed){quoted=true;continue;}if(closed||c==='"')throw new Error('Malformed CSV quoting');cell+=c;
 }
 if(quoted)throw new Error('Unclosed CSV quote');if(cell||row.length||closed)record();return rows;
}
function initializer(ts,source,name){
 const sf=ts.createSourceFile('catalog.ts',source,ts.ScriptTarget.Latest,true);if(sf.parseDiagnostics.length)throw new Error('Catalog has invalid TypeScript syntax');
 for(const statement of sf.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(sf)===name&&declaration.initializer)return {start:declaration.initializer.getStart(sf),end:declaration.initializer.end};
 throw new Error('Catalog declaration not found: '+name);
}
function read(root,ts){
 const directory=path.join(root,'src/i18n'),cache=new Map();
 function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(directory,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>load(path.posix.join(path.posix.dirname(file),id+'.ts')),m,m.exports);cache.set(file,m.exports);return m.exports;}
 const runtime={en:load('messages.ts').en},settings={en:load('settingsMessages.ts').settingsEn};for(const[locale,slug]of Object.entries(locales)){runtime[locale]=load(`locales/${slug}.ts`).default;settings[locale]=load(`locales/settings-${slug}.ts`).default;}
 const startupFile='src/i18n/startupMessages.ts',startupSource=fs.readFileSync(path.join(root,startupFile),'utf8'),range=initializer(ts,startupSource,'names'),names=JSON.parse(startupSource.slice(range.start,range.end)),startup=load('startupMessages.ts');
 return {runtime,settings,names,startup,startupFile,startupSource};
}
function rowsFor(data){const rows=[columns];for(const scope of ['runtime','settings','names']){const catalogs=data[scope];for(const key of Object.keys(catalogs.en))rows.push([scope,key,...columns.slice(2).map(locale=>catalogs[locale][key])]);}return rows;}
function exportTable(root,ts){return csv(rowsFor(read(root,ts)));}
function planImport(root,ts,text){
 const data=read(root,ts),expected=rowsFor(data),rows=parseCSV(text);
 if(JSON.stringify(rows[0])!==JSON.stringify(columns))throw new Error('CSV header must match the exported language columns');
 const expectedRows=new Map(expected.slice(1).map(row=>[row[0]+':'+row[1],row])),seen=new Set(),changes=[];
 for(const row of rows.slice(1)){
  if(row.length!==columns.length)throw new Error('Incorrect column count for '+row.slice(0,2).join(':'));
  const[scope,key,english]=row,id=scope+':'+key,original=expectedRows.get(id);if(!original)throw new Error('Unknown message: '+id);if(seen.has(id))throw new Error('Duplicate message: '+id);seen.add(id);
  if(english!==original[2])throw new Error('English source changed or table is outdated: '+id);
  for(let i=3;i<columns.length;i++)if(row[i]!==original[i]){const locale=columns[i],validation=auditCatalog({[key]:english},{[key]:row[i]});if(validation.errors.length)throw new Error('Invalid translation '+id+' ['+locale+']: '+validation.errors.map(e=>e.issue).join(', '));changes.push({scope,key,locale,before:original[i],after:row[i]});data[scope][locale][key]=row[i];}
 }
 if(seen.size!==expectedRows.size)throw new Error('Missing messages: import the complete table');
 const writes=new Map();
 for(const scope of ['runtime','settings'])for(const[locale,slug]of Object.entries(locales))if(changes.some(c=>c.scope===scope&&c.locale===locale)){
  const file=`src/i18n/locales/${scope==='settings'?'settings-':''}${slug}.ts`,source=fs.readFileSync(path.join(root,file),'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);let name;
  for(const statement of sf.statements)if(ts.isExportAssignment(statement)&&ts.isIdentifier(statement.expression))name=statement.expression.text;
  const range=initializer(ts,source,name);writes.set(file,source.slice(0,range.start)+JSON.stringify(data[scope][locale],null,2)+source.slice(range.end));
 }
 // Update eager subsets from the same edited catalogs, preventing stale first-paint text.
 for(const[locale,catalog]of Object.entries(data.startup.startupMessages))for(const key of Object.keys(catalog))catalog[key]=data.runtime[locale][key];
 for(const[locale,catalog]of Object.entries(data.startup.startupSettings))for(const key of Object.keys(catalog))catalog[key]=data.settings[locale][key];
 let source=data.startupSource;const replacements=[['startupMessages',data.startup.startupMessages],['startupSettings',data.startup.startupSettings],['names',data.names]].map(([name,value])=>({...initializer(ts,source,name),value})).sort((a,b)=>b.start-a.start);
 // Preserve formatting when a startup section has no semantic changes.
 for(const range of replacements)if(JSON.stringify(JSON.parse(source.slice(range.start,range.end)))!==JSON.stringify(range.value))source=source.slice(0,range.start)+JSON.stringify(range.value,null,2)+source.slice(range.end);
 if(source!==data.startupSource)writes.set(data.startupFile,source);
 const table=csv(rowsFor(data));if(!fs.existsSync(path.join(root,tableFile))||fs.readFileSync(path.join(root,tableFile),'utf8')!==table)writes.set(tableFile,table);return {changes,writes};
}
function apply(root,plan){
 // Back up every target before writing. Restore completed writes if a filesystem write fails.
 const originals=new Map([...plan.writes].map(([file])=>[file,fs.existsSync(path.join(root,file))?fs.readFileSync(path.join(root,file)):null])),done=[];
 try{for(const[file,text]of plan.writes){done.push(file);fs.writeFileSync(path.join(root,file),text);}}
 catch(error){for(const file of done.reverse()){const original=originals.get(file);if(original===null)fs.unlinkSync(path.join(root,file));else fs.writeFileSync(path.join(root,file),original);}throw error;}
}
module.exports={columns,tableFile,csv,parseCSV,read,rowsFor,exportTable,planImport,apply};
if(require.main===module){
 try{
  const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..'),[command,file,...flags]=process.argv.slice(2);if(!['export','check','import'].includes(command)||!file||flags.some(flag=>flag!=='--write')||(command!=='import'&&flags.length))throw new Error('Usage: node tools/translation-table.cjs export|check|import FILE [--write (import only)]');
  const target=path.resolve(file);
  if(command==='export'){const table=exportTable(root,ts);fs.writeFileSync(target,table);console.log('Exported '+(parseCSV(table).length-1)+' message rows with English and '+Object.keys(locales).length+' translations: '+target);}
  else if(command==='check'){if(JSON.stringify(parseCSV(fs.readFileSync(target,'utf8')))!==JSON.stringify(parseCSV(exportTable(root,ts))))throw new Error('Translation table differs from catalogs. Import reviewed edits or export a fresh table.');console.log('Translation table matches all catalogs and language names.');}
  else{const plan=planImport(root,ts,fs.readFileSync(target,'utf8'));for(const c of plan.changes)console.log(JSON.stringify(c));if(flags.includes('--write'))apply(root,plan);console.log(plan.changes.length+' translation edits '+(flags.includes('--write')?'applied.':'validated; no files changed. Add --write to apply.'));}
 }catch(error){console.error(error.message);process.exitCode=1;}
}
