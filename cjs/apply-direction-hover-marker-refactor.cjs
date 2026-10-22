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
 if(!writes.length){console.log('Direction hover marker owner extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','direction-marker-owner-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Direction hover marker owner extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check navigation-arrow hover, marker pulse, minimap markers and cleanup in 2D/3D.');
}catch(error){console.error(error.message);process.exitCode=1;}
