#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
 if(block.newDeclaration){
  const canonical=value=>value.split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
  if(text.includes(block.newDeclaration)&&!canonical(text).includes(canonical(block.after)))throw Error('Conflict in '+block.label+'. No files changed. Preserve the existing declaration.');
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
 if(!writes.length){console.log('Sequence playback recovery extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','playback-recovery-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Sequence playback recovery extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check native playback, unavailable-frame recovery, user pause and sequence end.');
}catch(error){console.error(error.message);process.exitCode=1;}
