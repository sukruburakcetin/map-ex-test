#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
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
 if(!writes.length){console.log('Playback map-scale preservation fix is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','playback-map-scale-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Playback map-scale preservation fix installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check profile playback in 2D/3D, center/offset follow and initial fly-in.');
}catch(error){console.error(error.message);process.exitCode=1;}
