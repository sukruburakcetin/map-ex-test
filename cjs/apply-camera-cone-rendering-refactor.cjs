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
 if(!writes.length){console.log('Camera cone rendering consolidation is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','cone-rendering-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Camera cone rendering consolidation installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check camera cones, heading changes, sequence playback and terrain in 2D/3D.');
}catch(error){console.error(error.message);process.exitCode=1;}
