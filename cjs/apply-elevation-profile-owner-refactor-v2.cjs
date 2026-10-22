#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('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','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
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
 if(!writes.length){console.log('Elevation profile owner extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','elevation-owner-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Elevation profile owner extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check profile toggling, sequence playback, flat-map terrain and 2D/3D view switches.');
}catch(error){console.error(error.message);process.exitCode=1;}
