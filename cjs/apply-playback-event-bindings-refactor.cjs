#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
 if(block.newDeclarations){
  const canonical=value=>value.split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
  if(block.newDeclarations.some(declaration=>text.includes(declaration))&&!canonical(text).includes(canonical(block.after)))throw Error('Conflict in '+block.label+'. No files changed. Preserve existing declarations.');
 }
 if(block.formatOnly){
  // Compare complete nonblank lines. Only indentation/blank lines may differ;
  // executable text, comments, literal contents and internal spacing stay exact.
  const find=value=>{
   const wanted=value.split('\n').map(line=>line.trim()).filter(Boolean);
   let offset=0;
   const lines=text.split('\n').map(line=>{const entry={value:line.trim(),start:offset,end:offset+line.length};offset+=line.length+1;return entry;}).filter(line=>line.value);
   const hits=[];
   for(let i=0;i<=lines.length-wanted.length;i++){
    if(wanted.every((line,j)=>line===lines[i+j].value))hits.push({start:lines[i].start,end:lines[i+wanted.length-1].end});
   }
   return hits;
  };
  const next=find(block.after);
  if(next.length===1)return text;
  const previous=find(block.before);
  if(previous.length!==1||next.length!==0)throw Error('Conflict in '+block.label+'. No files changed. Code or comments differ beyond indentation/blank lines; preserve local edits.');
  const match=previous[0];return text.slice(0,match.start)+block.after+text.slice(match.end);
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
 if(!writes.length){console.log('Playback event binding owner extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','playback-bindings-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Playback event binding owner extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check native playback, pause controls, camera rotation and viewer reopening.');
}catch(error){console.error(error.message);process.exitCode=1;}
