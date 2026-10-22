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
 if(!writes.length){console.log('Point-cloud tools extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','cloud-tools-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Point-cloud tools extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check measure progress, toggle/clear and lasso instructions/actions.');
}catch(error){console.error(error.message);process.exitCode=1;}
