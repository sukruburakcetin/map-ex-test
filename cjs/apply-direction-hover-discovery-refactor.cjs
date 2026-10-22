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
 if(!writes.length){console.log('Direction hover discovery extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','direction-discovery-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Direction hover discovery extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check direction hover targets in active/other sequences, API fallback and mouseout.');
}catch(error){console.error(error.message);process.exitCode=1;}
