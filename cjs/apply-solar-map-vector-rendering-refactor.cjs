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
 if(!writes.length){console.log('Solar map vector rendering consolidation is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','solar-vector-rendering-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Solar map vector rendering consolidation installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check solar beams/shadows, photo changes, night imagery and 2D/3D switching.');
}catch(error){console.error(error.message);process.exitCode=1;}
