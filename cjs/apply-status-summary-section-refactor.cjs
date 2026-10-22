#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('H4sIAGqz0GoC/+0ai3LbNvJXUOeupHI0Jb8Sh7HsS31Jz62TdCLfYyprGoqEJDgUwRKkLVXhv98uQEqgSMqy28x05tKpK2kB7Av7Rhc7NExiRsWOQ/qLnRELKHzbEbHX9vg04iEsi/ZFOOLf8ZmdiNmORXaGAfc+5SeGdMRjeYbB9jghC/ITZ2FyHvDUfx3QWzdhPLykYxr6JCOjmE+JYdvtEXWTNKaiHeHuXQ+3txtPGi+RrjtKaPzlSV2HS/y9BI6KXjqduvF8hbPNQCG7Qz5rlzYoLgN3SAPk8twN2DCWqInCuJNZRFcZKf2zaD8l/6SuT2PSJr9xoPS0nV2H5U0nPrtdhxEiknlAu4tFdYUQn4kocOcOud4ZBXR2vWPV7bpJRcJG83MeJnDluFlErkd3hzS5ozRsOAUSjsOLhE4FnvDgJI0btoKCxiz8jicJn+Lmg6iJFQ6EWQIMd+zj2g0jYLLHfqOIZq/TiGfIY9DliuJeNCOCB8wn8XjomvtHR1bx17H3Ww1YItf3WTheoTlsIJhV7uq0uukEtBour0tK8h/KxhPQ+LNOxyqJdoyEAO1p7+rV1b96J20824TztI73kwuPh8LuUTf2JkQA3u7iRbYir+7kg6J/vbMvJcuhl3S0AgIXpF1PoipQhf+fHbLw0jgG8/gZzfqbbpekoU9HLKQ+OSPamp3wN2xGfXOvRRxyw6bpWzf6N6N3uHimrWbN6qhfOGmD5wB0HY5e98r3IT6IOn9buPnat98Ss4YYIF3X57qNE48HPMbfTw6e+0fH+wjTb/6o00E1bbjB7wM+pPkF7u033+Dh5ssqhMnqtKbUU4a2snqFnXPwLRa6Ca1XWn6jF9Nxk96GKSgpJMk8ot3rHfULWE9YEiDgnEdzcgmxM0l9apFLHo7lV9jixszdlUG2u/go93kaN3/RaNuBmyxN5lkLgm95lYf66seM8PA8YN6n7sJske4pSSZM2FHMI2HDClDSxD6zzTIhi5RRt7RbqoZggp//YDH1MD3I4MmDdIpxlozdSPPGO+YnExXpOn9FgBYeX1hFeMoPkA7uGLrep3HMwcUQnMRuCB6BrMlFGRVxIYTsvoJ8cH2WQhg/0OyVhRMas6Sw1zVQQmfJK0wACA8gXEhbT2OhDnugMISkgsY9GoCkkhs4pKLCFtGkRm/1GacJXwXjUpv7R0q9esB6se6urusq3JevrhrjzSoEbzC9Dac3Lf1Z1fH+3UPVUfa1x6jjpK2ixNZB6hKqVMgvXgz1H49J4o5rYxXUhkN+nm9qjvJ1vG4qu4qK54pHm6oGrcQoapSDDVvLri3rGChfyP4euO3eARQQGyoZovn+Wi20juPwPhxFtNhUx5Eaa6rfV5Mg6zeWQs7GcjOryXH1OVG//wckxlJDsnak3Das3KCruUSmlz1dvT7K1uue7mINkJE8kXeXGZ3oYnTLQpFK9oING3Iblg+lTkbJQ0QuUAQUgVfZ2ay3NHnr9JS4gsjaRfVM1zvQiOkdJS5d7+i9Vt5k/oQ8Fa0WHGtjiYBb6zpAXNvy6FKYt/wWSiklEZMcJhxSPWUx4XchoM8GUqaiF/a5B/y+e/P+u/f/3e29Pr+6eP+uZ0/95k7448M6TmyrPyJtgWwQOmPQioVjQottyj/IJzonLrS2PhVezKKEgRxSKmGTjzIU5QQbiOQ0WCJKN2gX6iMxTVyWcyF53r1lgg0D2l6ysjvlPiXj1I19m1yBDRGm9rOpO6a7gsFqwnlAAkn1JVBDWxUk5BAPoxxMcOighPEmbjimcj1XFsqK4gd8zDy7dOtfFfvHKRZz5pMnT0jZtxH6UfPT+kGHUizmIfA3nFRYRUDCciGauyBaqSpHhlCYoJKSVxpmyyHT6s7AJ7fQqAqdu1JTQIJ/SiNJUcACpkoUWupOCiaYQiVb0ZEbBJhTLWiuZrs+9QBJkF++xAEqgyQOsDCdQuHraWIRLz8MLckYVkFfwNcU+ILuVqkf7vJ7yj0uWZC3ErBoyOGSiet52FZCIJoTnibqgkEaXV6yvAm7cbIkY5aYsAiMB3Bg9BrAXjCnNLhnrNd8uUjNU6MgPNd++pT8/UbMCP49bWtB+wN1PWh9EF5MxzBXgbHFVJukracDHMvJn9qeDbEct8tYXhrOIfuKczU166EdWRr4CpvJClRNQypgNIcKMB8MVOCyH69AtRS6Ye0Dv9uweol3XF1XDiPhulLg37L3oIKuQzpbabR0t0qrXfITdLknuqYtYmgViEE+q3vUag4Jy71cftdLDAmo1BHGKfmWYHG8qnqc0v32DUF/TWno0Qv0XWEM+uBmQxoPAF+YBgF8LAdFIFkmpUNr7E34XZHEb90ghRhzx5JJOc7/pnu4igiak2uOnDdWEBPBUosQI2TPWgoxKhi/LMUAHBiAVfP4Dr26Ei5y5hIucSOuOA0TNqVaKCjiSB74lx5KIhoD4qkM4iquWWS8jCcQQNfDiZSgvTQA9LCkbAGOcln7zflJ1TJOwTTMhV6YWuu1qBbpdQOwqjWmPhAhmRyoQGt1kpOP3TFGzNO6xu33DcFrw8KDZ7N1UeSLTWJrg9NWE9ea+PV/M2+tD9OPmaPWBfavM9Q/ZIb6ewanzZk1e4hnVFPvVtOxzdn5zzET/PJCfp301ecWvSL70qMmyJrtStpsQS2EZTq4BNboUOYIWppbYLFfaa3WCvty6S1p1NfxWHMtCyNVdpUbsx8phSbUnUMrU9Q8cjYN11ItzLDCQVI5Jk82vZW6pTaRF/XLea+HJQuNE0axos1nsE2P3ds+b2980N70hF3zaN34TP3Yh+nGp2isixtUt6peGjW31St0MwWtZGkm8YCX5mZKyxJnsyhbc66XDfex/rhH3Wbaq0Jja6Ud3ifPepZsxvz1QbLyILmNWovU+iDFNj3RbUNwlYqbST7qDW8DcS2x3RNsGx+4NjxoPewB6zEPVpseqJoepBofoJoenLL7si8uiLYoD9YAZns360lY3cACV7NuTH9NwQtNI+Q+dRBmYKZXe1wBppus7VFAIBUzDzZbI7G2YSQAGrnJZA2OIFi5na7Bb6cATTQscvQmJ+MaLzdi1jVxxZKvSJZt296EBRBRw1b31Fyslhz538+fF5lV7MhaFhQKUZp0F6jJ26kdp+FF+I7eyQw9S8xE2CpOgD7fylmmORI22Kb/BiC9eeiZyL99w1lo/vKLz+LQnVILh2JbTzlBTCNNRsfwucADgDh+H2H8E85CDVAd4EOR/5GFvn3Op1Me/tCzEjB9muBqTyrmSv62X/f2O/sdC3SDSz+I2espS2w1JAXgG/jk8dwx4LuRZS1bKeEKBLYWyh+Fo2BWrn2H+d1T+Ot2tYLsbCFROouiHnSMUf7NyJBQBsdsFnoBtHvCNNSotXW2ULnaMYT8NCyZhRxjjB9G5ixvPNdipXw0WtnKAtBYRDfsnn4Tfv6M181HJPwGGOXDGwiuxll/4LyKY3duMyE/zbB1FtojaIPeupEpj7ecfoimI3+Y4cqEBksyaA5IpaCAqkBjD8fGWVhHYArI8VBLGYdhtBz9rJowGmc9iQOOOOHZku6ZND6ND8fA8hf90DTyclVOpaD6HdEY3wigrI2g42V53UuU2uX8kcZcPSJA9RvfMUEx9wj5XoNIDMsEV8FgOuKxqaTt562UBZssiXBAgPN+v2PtPbeMjt0xBlZ/b98+OJQA/IaQ5XwHoPb+MSw8X19YfTOMwaC1yNUbU9pVNmeXPMTUZ0hOwdbaiMhBNvOJiIMTW0ub9eJvsBcVoGz+yVSeDQRbmnH+7BDjb1LSVusl9DrSwpTCqyNaIlOHKF5ooE8sRq9i01MNLIbBnOCLCg4nVopXOsABrOj2B5ac70Kb5zuG/GpYYKzOwZG9t39wePTs+fELC/pbZ/f42H5x/PzZ0eHB/l728l5FNilI0rAqIxLHxLEIjkK6p5I1O0rFxOzn0EFrpVQf2q7Xv6ZuYMqNVn9wr74LaZ4brXv3rgTFzUpO1Zt3lceqA2BVvgkuCp0/zqLAydQmY0mASh4VVP1vB31jNYQCOzUqU6glnxbR2XipI7HzaZPZrJC+VLIcNOXfQIMDtDHN0KZMCPRYdSHFiFu92OXzAg6RvOZJUu2RvBcPDQysTWYRN1g3tEfYyNJrszVlli8ggMqk/grsgIbjZGJ1iguMeJSCOqh/DyfG65k7jQJaqMOw9PmFY+SaMXRulesot+lIX+lk1RCw5EC3tXVqre2OFVystvucinc8uZrE/M5E/StNaaeb7XXdrJZ2ohV7SZzSbJD9D4FMi9M7MQAA','base64')));
const root=process.cwd(),dry=process.argv.includes('--dry-run'),skipTests=process.argv.includes('--skip-tests');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
function replaceOnce(text,block){
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
 if(!writes.length){console.log('Status summary extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','status-summary-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('Status summary extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check zoom fallback, address, creator and coordinate copying.');
}catch(error){console.error(error.message);process.exitCode=1;}
