#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
 if(block.reviewedBefore){
  const count=value=>text.split(value).length-1;
  if(count(block.after)===1)return text;
  const matches=block.reviewedBefore.filter(value=>count(value)===1);
  if(matches.length!==1||count(block.after)!==0)throw Error('Conflict in '+block.label+'. No files changed. Preserve local navigation changes.');
  return text.replace(matches[0],block.after);
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
  if(entry.createIfMissing&&!fs.existsSync(file)&&!(entry.test&&skipTests)){writes.push({file,content:entry.createIfMissing});continue;}
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
 if(!writes.length){console.log('Tilted playback follow fix is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','playback-tilt-follow-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Tilted playback follow fix installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check 3D playback at several tilts, manual zoom/rotation, 2D offsets and fly-in.');
}catch(error){console.error(error.message);process.exitCode=1;}
