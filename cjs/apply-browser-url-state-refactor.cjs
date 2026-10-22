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
 if(!writes.length){console.log('Browser URL state extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','browser-url-state-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Browser URL state extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check map/image bookmark URLs, parent history and 2D/3D switching.');
}catch(error){console.error(error.message);process.exitCode=1;}
