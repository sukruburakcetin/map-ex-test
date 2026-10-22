#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
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
 if(!writes.length){console.log('Direction hover event binding extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','direction-bindings-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Direction hover event binding extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check navigation-arrow hover/touch, repeated viewer setup and teardown.');
}catch(error){console.error(error.message);process.exitCode=1;}
