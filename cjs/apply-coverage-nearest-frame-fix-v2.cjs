#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('H4sIAA3d0WoC/8VYbW/bNhD+K2ejK6xUUfqhGDA77rBlHRAgfUGSYR+aIKWls02YJj2SSmwk/u87kpIsyU7iodn2obDNl7vnnnvueOl9F6XVHE23D1/vu2MukL51jU6PdC4tn+PRHc8maBNrlt0YuiOh0llxeoRjpf15gIXmt8wi3BgUmFqu5DlaverDPRj8K0eZ4mnWB0PO5GQAfM4mtQVYwwPIXAgY+o+Bc8XGFvVLWB9AKng6+6K4tD+7O0LJPvmZj1APQDBb/oD1ACQyjcZeqhN3h46PlBLI5E6Igo1QOIgXJS7QDhg5JrjuBDE0Z/azFCs6ZnWO6xh2M8fMSqYEjWUXRUi/rk6z3nZ8sbOu7WkzyHj/IGMCuaAgKfXM8lukiMZMGIwI2W7e/39scSsxLcxbNNeTc6JuURMgHwA5MXwimc0pAc8kw+cypBYzH1Nvm6Ojg4MrCQAHcI5GCYLMIC08HgouMQQPd9xOuQRuDZjCZCVeFx3d8DGOVtWySQrLfxg0YKcIZkokZMQnS6d0P1VKZ1w6xNrdMRaYzGDFUWQGstzXFpE9AZMySY4VgZN4V5gNwGjH/UtRELgELlSuUwQyTIBGGtnMANlm4jDjlFw6B5YaBmRIFMy5pEWeMiFWBdgj99HksUhdmYfA5C7xbGTynEp8DkUffhkpbS/8j6gPX7Sac4PHwd57uPeQiCZJzPiuYEg47I5xS3Ryk1BnKxX9J+XnxPFpatDicIyllAxzqWYoS9cx9G4WDqmJ4WbEbDqNg77cHWUJDgwrAAB8DL1OuJkwhxmzKNg2BMF1i96ml52r3CLFMiHWTB++vboPlhOrzhRxjRc+vl60Pnp1751t73yDdTQI3qsvAm2Zi6rzPkAuMxyTTrPaqZGT0hBOJW1wuyp2qE6g57Y57b2lPgvHBauJQDmxU1p68yZqRs3hPbyF16/p9A/w7u1PP8JwSLejIg2kxjJtPV0UEBFHrFzS60NElKsx3SkDCZa36dTqzhv87fPHD8sUF64j9666J17dArMrqt2rrtfMB62VvupuLNZEQtGFsL7y64bHzicvwISb3x0v2PPHEtJmBA8P8Ni2klHk7Fsuc2w5rIpqWH396CrL9DbF4BzUi8NZjKHyXX0lPw24le1jn1BKTJnYcqd672itkE6wxbNoAOtCP+HjpSn3hBbu65b8MTJRFmaRk02vM0B3SLbslnFq8gI3Nqlj51qWQflFQr/dkR7v7E++JJ+C3cOxZnPXcr0wNXBpULvAtx8UCEXeGlyI7frkEtcnls3zSeNI6635Hmt1AW29puunxxmnXVza/Qaajbard26759aY39F0W7jJu1YkJp0E/UXbvNA7fARn1MUMhdZ+GSlNuYtmALhkaVnkoXvDDHHh3lauaaIg0GqB0jXGBbPTpF5NLcqoo20Idb/axd+s1+i5I9RDap0TmkpoEPjMc9pM9A7yNj58Caa51jRu9ch9KJ/age8Sb2lm3ex4/64q/mn9emFA0G+Z+11l7Kgi/wQzqsPemonDmaQxQoSlgqYd4n0x29XvugI6nWKxKeBHN6JmLwg5zyg3E+Z73B5NgFQ0UjfNSb4fkhG2TKoR5c2yX4ohWfAlimTZ4OZZMwXwm5KRfqdTGdzM1nu43PG3gpvc52hZxixrC+KpJJHfWlHE5RxL7+FU6fBy+1m2XGDWzbOdDrNWm2RXyC3F/LfO27ttyltqqfgLf1vUZNOi0EPUq/NmcqHt/JGRuJpZG8zsZdP14U67FPZxU8V4Rqy7F2JMD82IpbPu+np9TQfmKstF+K+U6/XfGnWzIVoRAAA=','base64')));
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
 if(!writes.length){console.log('Nearest coverage frame fix v2 is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','coverage-nearest-frame-v2-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Nearest coverage frame fix v2 installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and click a coverage line near its middle in 2D and 3D; verify overview dots and exact image points.');
}catch(error){console.error(error.message);process.exitCode=1;}
