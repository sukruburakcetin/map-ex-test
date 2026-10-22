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
 if(!writes.length){console.log('Detection tools extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','detection-tools-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Detection tools extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check area export, detection outlines, labels and hover restoration.');
}catch(error){console.error(error.message);process.exitCode=1;}
