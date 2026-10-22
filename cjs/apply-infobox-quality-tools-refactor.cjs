#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const data=JSON.parse(zlib.gunzipSync(Buffer.from('H4sIALl60GoC/90aC3vTOPKviN4ddljjpIUClzbtltLudWFhd9PdvfvafotjK4nBkYNl93Gp//vNSPIrke20dO8FlCbSaDSaGc1Ls9igLI58yjf65GyxMfYDCp82eOR23XA2DxlM8+4JG4evw2s75tcbFtkYBaH7Wa0Y0XEYiTU+gEcxWZD31IlGN6dhGPAhdWM/ZCQl4yicEcO2u2PqxElEedefORMa3XRXwY0d3MUZxzR6aMTnLMf2U+IEftyOzg0vaQQYu5oFktLAGdEAKVUQJEYQInfaSC1SZhOp/Fl0n5Cffjl4d3L6D/LrydFv5PTDd9+9OyJPuuk5WwJ9NPU9eqioOWBOcMN9Th4/JuYyKCG7nn+5OkoIj28COlgsdHOEzJxo4rPTcN4n5xvb8+vzDUsPOAojj0YKcHN+TXgY+B6JJiPH3NretrKfnt171anFMnc8z2cTheZ57X5pujq6pwPcHSVxHDL9biE7DHz382ARwgknk4Aqaf3q06tUvyT2Y+TWlwLwAMR+Sck+0JsJG4fJh/d9EviMcuKGQQh645HRDRGaSNRywl1QgfMN0l9ZfHzcJy4SB5qjEJBM7RRawLaEp4bmZgmD6Bz38yQKE+YhHQxueK18MjmvAahE2Se9WhCpXE0Qns/ngXOD240Det2w3aeEx/745jBkMRgoXMDnjkufjmh8RSlrWAksnLCTmM44rnJhNY0awK98L54KJe/1/tIA5yYRDwWj5qHfghMFLECvpn5cz9RUK+A9PfAunJ/VbdimEnfh/J05SMjEEff72bwZ7xiE+Rv1J1OQ54terwVy6P+TItZXLVjx9vxNYd1sgKvaos0WrEqEesPwp+Ptgxdbz9RN19jEl50G5GnNvd6rW7B74oaM28PYiQgHrgwWm71UUlhnutaiEHyhHwTU0yBJSbeWHOXNatS0i3pap8M1Pms9FS5u6osW4U2VOrQrjzR/Pzuen/BmF7VqW+/J+Wedxh3mIfcx8BCraeAg4uZbBdd5OI189rnJ8oKrixxWoC4OQnr2Fn9QdW2Q8jpyrvLAGUHkkcTNPIDTrXetwVzQcVwnu7/iarIenlwbX7SCFurYDruskNuNTmnV3Td7HJ0mIEPadKBeC0itodjtgh7og7iujOJgUjetMWn6EDhTtlynquGtvMsazyeuzBs/khG+8HGgYjMMKjJXtiU0IU1rlXxh1vPqrIn5Z2Ainm0fHL94g9udb3wXhp78dJ5sbb3YBtPck98nYubCasOWGRxcc+z4kfzUs59vA8be5rMC41jMtmN80+ttbb6Wa34MwxzjZi/DCLjF2FzMtmM8eLW9ffxSrvmFifhWnfp990B+SPLhJnQXxOHkjENGyyYWWf6dMY3c5qcVHyWZ4mNpm7OLun069syZm+aZ8LEWEemfReDaTKgFF455Fx0y2COLpviB8Zj4kEYGoGaQLAwIVx9VZvAa0JDBYCDw7bRjOmA3JWSPHmnQNWCJKOS6jJhNgmo23PjnM70ZLAQ30mbAPBUzBaNCpqh8RyeUeWLOxHN3WvCo/KzER7TTh1kmxafhFYSrQZ45IU4ubPjHIc6FLLghf1YkE9eZi4z/Y8uu6/iouwbV9wytKwH28/k6e5SD55drrbhLbpNLGNIx4Hh/STPBUj+qSAsCHtIcmOucksIu/BKhDqetFKWNMt1rXlz1Irlrl9FjyX/LDGfFSW+p4ZInVpajEpwBjQ1hdSnNK0jJM0lNIPlquyOcWSmrqnD+Za8HnN/u4b576go0hue5bxOGDkV5B2qeC2KkA34nYiyI3ZI4lG5Uosy2bxRVfdygbHOtlUvrrEk9St0KPTRCnrNK2XLd6t2urhC5EuRoszBNJUtf3tJ5l8FCM5hqjTEiXR1Fdc2PvVIDBccUR1gGRUcWiFUb6YUohtZUmeObOeV2zOtLzER34j6RXuQy9KWLY6Lue4K1N77fV1Vj8fXsYmdJROvg07Bpv3+3YAK+siQIBDodK2FP9E13xHrHY+ciOrr2eQwRUe4XXXCSaJ6ErORxUQnnUTjny0LzQpd3T94ff3j94e9Ph0eHpycf3g/tmVcvtVtFS+5g4RgfUfZrVOzxyeFjBi8sDe+yAgqmcVac8mkmJ3Lpc3/k48kgOAsdrOuAniUsBlvlxBCjgTfBIj0KXmQAotZ6I06PHluwwgWOw0pHcOK2ojb/Dwc6Z7ekuKqq1Lx8jKanD91BvpTA1El+zUknk8SJPCtXulnoAbH5GVH/rYKUiI4SP/Ck+cC5p/J4sGDmsNh3uRTKit3hSnnDK0YjPvXnBDQ2mYGFESdffo5Ry2DnIEy83GpBOB8m4o7g/mE8pVGGmQPTfQgqpw6knj7DAiPcFMqzHWCMZA9mFbU5/KN20NteH9LoMCLulOKdXDr2x5hyMLksjGlVqDBsu59AdEhVBqXR4gyucsJWrNY6KMtbf9EpXnnvtc5+kV4AKChcEuheOtfWd9wQd4eFYyfgoL4brnyCQFTdJ0/It5/4NcGfJ91zhgPFk6DQ3kyblUesihXTkZ3iCoi7LVbklyEC5Qfhz50IFj1FFfdssVX+qvkzddzYEiRkj5mf/FnyFF1G6fnzCSbKonBcvHjCv/KbL06WVqB3BvxK735E11B+Lq0uFq688tqqEeQQjYZVmXktKj+aCekrNRM/Y+Soxic0LgvuHaqGfuo0Aouon3rLwpF+Bh2/fmZ45cTutH5VQckSyzR2E7l2zuh1wXSNMkr2D8iPEDvslkViEWMlTjTADBuaQEeMa4IbBb8apRh7gjZU67eUzjMdFnE/74oYnhcW/anQc8+fzXIjF/kQ/jtBHm/wHcJCQsdjWMBhmgzfvCVXYfSZhC5knZBaRVTqt+KHrHZoGNKXim8fH+7WsWsP+DWXfFO1GYltsRpsW7q40NIFgpY2nAMpq71EZFatrpTrKCp3qrscKv3Is42V9+0137T/V96xNewoWYQcsJR9rbx7KhS1psBcYUI5yavkdf8FD2srj2krGfpyVU5//sLe3eX8KwU/PfLcYjbjrr4FVNNoTc2/tc5frsrUuIpqgX65KL9SiP/64vvDFNwfpsj+1YX1P66Yfr8C+tcVze9fKK8rjusL4o1F8K8pfP/7it36a56HP2ZBglVl6CrZe/rWtJotSnGUKXSjoy+JVgqPjfFWidZOe5mzprSpjzdby5a6SmG1PFkpSVbBs5liFJem8LOxUkPTZ9/tyYoKHIsy0GrJTrIA4jS8yVkcV0rSmUfFsEpMVCbVjRJI0WdUk6GoNEJEa/oMpRLq1UVGWbx3OBxicEej2KcYECuTUdvIeL/GRX2jYtpEbCluaaG1oSGvpv1updluubWu7uVp3ba5xncofUtc/SORpt2tkXMl/13LuQd/ym8iqLjy9fTc9+2j2HecMFm4qg9dHREG9UEtwoCCeboloDR0DHG119GTplRMebCSP216m2x9haxp6Ktv4Gtq2Ktr0GtuyFP8du7XdYdsT1s5XwqaH5Dz9X1q9X1pbX1oZRPi3L/ZrLW5rK6ZbL3msfW4XmQTD8j01paxmgYx2Q7mrNMDVtvxVd/f1dbN1da71daptR7DdXFdzvSlAC8f/0/Ym+cae1PXydDcs3D/7oR1+xDWY/1KvNtX6VUde3PO/oFdCDtkPZ3RBtmtClKc4IGaFwS51Zi4/emgFBvHUbIUGquyIM6ng4h+SSCAMA0WerSPYwYG4hLG4RzOtQQjB7soSLcMPOZLgGNudKy5E0+XxnEIZi5nS+OXMxiNS1hEld2N/Hl5m0/8emDijCUKkJZt2+7UDzyI1TuDPXNRTPXF/7e3i9TKINKOFSbxPIkHC9Tgy5kNkfwJe0+vRMx4HZsxpBZ4B+bA6x/Eg4o55nZEHe8YRoY3zDWRfvsTXDvz9989P2LOjFpY777TUwsc1Uji8Sv4vcCHBUAefZiL17H+Qr7k9IEWScJbn3n2YTibhez7oRVDpEVjnB0K5pyK7/bRcKu31bOAPzj1Pb8+mvmxLd9LYPAYfofRTd+Az0aadmzJiFM4tLWQ14H35ZilJND3vcEe/AwGpQxmfyFQ9oGrgCkFGNtnbpB4lJuGelXp7C+wqtg38H8cMtJ+LlXFKX1SZ3TSQtQy/RpIomwNI3NI1B8+YIO9R+z2FjUgHBP2COgOR58A1Ng/u+gfRJFzY4NFxN8m6+wzewwxwA/O3BTLO/0zhtokvpis0KqLfBvUENwl2wE5Iw2aUWyLgyyZjWhk7A/FJGym2x1rRIixI5XJMDp9tp9vuy/UsURG3zAKzoRXfBBHlA72JLn4uWODgQBXYAKFoGNADpIC6bXx+DGzxWWwVYEGeYx33cxeU7L3u3EYXTmRx4kvHiyW3jNEdox9PpzEU1p56APvHeBjrowlDMuEy4j+MaCxws0HvR3FRvF9gCBq6ptvsik8k5S7uVoh7ctEX9fUopoDtM0ngpZ4CkwjR1EURqbxCzqA4l1eFvVB90D5pHmzKW5uKvKs3tI48l/xPKBsEk8RQp5AFnoHVbEwryoUCWQsYZWjVUlZkoQccoYetQopCmdWd/mpotvZ0SE0a464Keovq4qh5AtuzfEZ6gSIxlJvYqqmKQsquUbk2iLqLaAQhTZIFmUlycHZxXpiFz5MJ3WBN9VLHWkZ7GV72fOET1XtMROVPNqgEGaVM3I6E/DzfNajdH5UhsgvsnVmiJp6Xk03LANL5NXiOAxixbta64bBrID9vntgXDTvBiRnNx8+6jSseu2Fsd23ZRCF0xBEGZ3ypF0ETngM9U4AVKkkCz/Jmj1+knV3pBIMhpnbJAL2T1LZgW91elecKBMObIjFdsCMhXb4hUV2+JUV2HEjrXKWe7koIL8EXSy/yOIgQpARnTqXfhhBXBlPwaFg+wwCiR6EqrUStfX11VJTX++rY9xVYy+dIAGLLhRXfG7X1HrtKAQg5atieRAuRP3WJmbH+HOhVfqzzYuKcTFayvBgyZYX1pgb0QYl+SNqxSvnEGd8YFMg59JOZx32bFrib6Fy2F/zL8GYlPNIQAAA','base64')));
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
 if(!writes.length){console.log('InfoBox quality-controls extraction is already installed. No files changed.');process.exit(0);}
 if(dry){console.log('Dry run passed. Would update: '+writes.map(x=>path.relative(root,x.file)).join(', '));process.exit(0);}
 const backup=path.join(root,'.refactor-backups','infobox-quality-tools-'+Date.now()+'-'+process.pid);fs.mkdirSync(backup,{recursive:true});
 const originals=writes.map(x=>({...x,bytes:fs.existsSync(x.file)?fs.readFileSync(x.file):null}));
 for(const x of originals)if(x.bytes!==null){const dest=path.join(backup,path.relative(root,x.file));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,x.bytes);}
 fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify(originals.map(x=>({file:path.relative(root,x.file),created:x.bytes===null})),null,2));
 try{for(const x of writes){fs.mkdirSync(path.dirname(x.file),{recursive:true});fs.writeFileSync(x.file,x.content);}}
 catch(error){for(const x of originals)if(x.bytes===null){if(fs.existsSync(x.file))fs.unlinkSync(x.file);}else fs.writeFileSync(x.file,x.bytes);throw error;}
 console.log('InfoBox quality-controls extraction installed. Backup: '+path.relative(root,backup));
 console.log('Rebuild Experience Builder and check quality toggle, legend colors, selected-band filtering and mobile layout.');
}catch(error){console.error(error.message);process.exitCode=1;}
