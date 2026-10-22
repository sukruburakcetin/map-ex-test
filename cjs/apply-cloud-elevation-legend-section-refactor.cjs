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
 if(!writes.length){console.log('Point-cloud elevation legend extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','cloud-elevation-legend-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Point-cloud elevation legend extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check cloud elevation-mode legend visibility, labels and colors.');
}catch(error){console.error(error.message);process.exitCode=1;}
