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
 if(!writes.length){console.log('Elevation profile indicator extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','elevation-indicator-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Elevation profile indicator extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check elevation chart progress, altitude badges, profile toggling and sequence playback in 2D/3D.');
}catch(error){console.error(error.message);process.exitCode=1;}
