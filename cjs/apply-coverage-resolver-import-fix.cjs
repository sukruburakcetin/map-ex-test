#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
 if(block.wholeFile){
  const canonical=value=>value.split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
  if(canonical(text)===canonical(block.after))return text;
  if(canonical(text)!==canonical(block.before))throw Error('Conflict in '+block.label+'. No files changed. Preserve local edits, including any appended code.');
  return block.after;
 }
 if(block.formatOnly){
  // Compare complete nonblank lines. Only indentation/blank lines may differ;
  // executable text, comments, literal contents and internal spacing stay exact.
  const find=value=>{
   const wanted=value.split('\n').map(line=>line.trim()).filter(Boolean);
   let offset=0;
   const lines=text.split('\n').map(line=>{const entry={value:line.trim(),start:offset,end:offset+line.length};offset+=line.length+1;return entry;}).filter(line=>line.value);
   const hits=[];
   for(let i=0;i<=lines.length-wanted.length;i++){
    if(wanted.every((line,j)=>line===lines[i+j].value))hits.push({start:lines[i].start,end:lines[i+wanted.length-1].end});
   }
   return hits;
  };
  const next=find(block.after);
  if(next.length===1)return text;
  const previous=find(block.before);
  if(previous.length!==1||next.length!==0)throw Error('Conflict in '+block.label+'. No files changed. Code or comments differ beyond indentation/blank lines; preserve local edits.');
  const match=previous[0];return text.slice(0,match.start)+block.after+text.slice(match.end);
 }
 if(block.flexibleIndent){
  const pattern=value=>new RegExp(value.split('\n').map(line=>'^[\\t \\u00a0]*'+line.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\t \\u00a0]*$').join('\n'),'gm');
  const previous=pattern(block.before),next=pattern(block.after);
  const oldMatches=[...text.matchAll(previous)],newMatches=[...text.matchAll(next)];
  if(newMatches.length===1&&oldMatches.length===0)return text;
  if(oldMatches.length!==1||newMatches.length!==0)throw Error('Conflict in '+block.label+'. No files changed.');
  return text.replace(previous,()=>block.after);
 }
 const count=value=>text.split(value).length-1;
 const expected=block.count||1;
 if(count(block.after)===expected)return text;
 if(count(block.before)!==expected||count(block.after)!==0)throw Error('Conflict in '+block.label+'. No files changed. Preserve local edits; merge from review source.');
 return text.split(block.before).join(block.after);
}
try{
 for(const arg of process.argv.slice(2))if(!['--dry-run','--skip-tests'].includes(arg))throw Error('Unknown option: '+arg+'. Supported options: --dry-run, --skip-tests (plural).');
 if(!fs.existsSync(path.join(root,'src/runtime/widget.tsx')))throw Error('Run from the widget project root.');
 for(const relative of data.requiredFiles||[])if(!fs.existsSync(path.join(root,relative)))throw Error('Required earlier step missing: '+relative+'. Apply apply-field-notes-editor-component-refactor-v2.cjs first.');
 const writes=[];
 for(const entry of data.entries){
  const file=path.join(root,entry.file);
  if(entry.test&&(skipTests||!fs.existsSync(file))){console.log('Test adapter preserved/skipped: '+entry.file+'. Merge it before running local lifecycle tests.');continue;}
  if(!fs.existsSync(file))throw Error('Required file missing: '+entry.file+'. No files changed.');
  const original=fs.readFileSync(file,'utf8');let updated=normalize(original);
  for(const block of entry.blocks)updated=replaceOnce(updated,block);
  for(const block of entry.optionalBlocks||[]){if(updated.split(block.before).length===2)updated=updated.replace(block.before,block.after);}
  if(updated!==normalize(original))writes.push({file,content:(original.startsWith('\uFEFF')?'\uFEFF':'')+updated.replace(/\n/g,original.includes('\r\n')?'\r\n':'\n')});
 }
 for(const module of data.modules||[]){
  if(module.test&&skipTests){console.log('Test module skipped: '+module.file);continue;}
  const target=path.join(root,module.file);
  if(fs.existsSync(target)){if(normalize(fs.readFileSync(target,'utf8'))!==normalize(module.content))throw Error('Conflict in '+module.file+'. No files changed.');}
  else writes.push({file:target,content:module.content});
 }
 if(!writes.length){console.log('Coverage resolver missing-module correction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','coverage-resolver-import-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Coverage resolver missing-module correction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and rebuild the widget and verify loading, middle-zoom hover and nearby frame clicks.');
}catch(error){console.error(error.message);process.exitCode=1;}
