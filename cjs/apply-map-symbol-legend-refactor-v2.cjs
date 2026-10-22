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
 if(!writes.length){console.log('Map symbol legend owner extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','map-symbol-legend-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Map symbol legend owner extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check legend entries, hide/show and 2D/3D switching.');
}catch(error){console.error(error.message);process.exitCode=1;}
