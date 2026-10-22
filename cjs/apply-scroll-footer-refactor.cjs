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
 if(!writes.length){console.log('InfoBox scroll footer extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','scroll-footer-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('InfoBox scroll footer extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check More controls, Back to top and reduced-motion scrolling.');
}catch(error){console.error(error.message);process.exitCode=1;}
