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
 if(!writes.length){console.log('Sequence hover highlight owner extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','sequence-hover-owner-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Sequence hover highlight owner extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check sequence hover, mouseout, rapid hover changes and 2D/3D switching.');
}catch(error){console.error(error.message);process.exitCode=1;}
