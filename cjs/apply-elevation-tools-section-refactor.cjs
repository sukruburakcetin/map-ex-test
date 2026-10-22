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
 if(!writes.length){console.log('Elevation tools extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','elevation-tools-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Elevation tools extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check elevation feature visibility, minimum sequence length and profile toggle.');
}catch(error){console.error(error.message);process.exitCode=1;}
