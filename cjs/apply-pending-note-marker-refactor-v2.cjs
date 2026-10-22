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
 if(!writes.length){console.log('Pending note marker extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','pending-note-marker-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Pending note marker extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check pending-note pulse, group visibility, cancel/submit and 2D/3D map changes.');
}catch(error){console.error(error.message);process.exitCode=1;}
