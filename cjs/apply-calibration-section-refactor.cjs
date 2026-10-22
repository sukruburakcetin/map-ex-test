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
 if(!writes.length){console.log('Point-cloud calibration extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','calibration-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Point-cloud calibration extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check calibration step choices, six nudge directions, reset and disclosure.');
}catch(error){console.error(error.message);process.exitCode=1;}
