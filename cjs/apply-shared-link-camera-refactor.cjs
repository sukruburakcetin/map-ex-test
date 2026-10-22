#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
 if(block.newDeclaration){
  const canonical=value=>value.split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
  if(text.includes(block.newDeclaration)&&!canonical(text).includes(canonical(block.after)))throw Error('Conflict in '+block.label+'. No files changed. Preserve the existing declaration.');
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
 if(!writes.length){console.log('Shared link camera restoration extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','shared-link-camera-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Shared link camera restoration extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check shared links, initial map flights, viewer bearing and 2D/3D auto-switch.');
}catch(error){console.error(error.message);process.exitCode=1;}
