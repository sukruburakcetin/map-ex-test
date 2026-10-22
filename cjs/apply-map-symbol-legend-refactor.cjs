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
