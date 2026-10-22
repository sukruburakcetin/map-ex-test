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
 if(!writes.length){console.log('Dense regional coverage hover index fix is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','dense-regional-hover-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Dense regional coverage hover index fix installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and test cold and repeated hover at zoom 6.7 in 2D/3D; verify brown pulse and creator/date/thumbnail card, then far/close picking and playback.');
}catch(error){console.error(error.message);process.exitCode=1;}
