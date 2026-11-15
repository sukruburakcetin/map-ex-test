/** Bounded MVT attribute inspection for connection validation; never renders graphics. */
export function portalTileProperties(buffer: ArrayBuffer, sourceLayers: readonly string[]): Record<string, unknown>[] {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength > 4 * 1024 * 1024) throw Error('Places sample tile exceeds 4 MiB');
  type Field = { id: number; wire: number; value: number | Uint8Array };
  function fields(bytes: Uint8Array): Field[] {
    let p = 0; const result: Field[] = [];
    function integer(): number { let value=0,shift=1; for(let i=0;i<10;i++){if(p>=bytes.length)throw Error('Invalid MVT integer');const b=bytes[p++];value+=(b&127)*shift;if(!(b&128))return value;shift*=128;}throw Error('Invalid MVT integer'); }
    while(p<bytes.length){
      const tag=integer(),wire=tag%8,id=Math.floor(tag/8);if(!id)throw Error('Invalid MVT tag');
      let value:number|Uint8Array;
      if(wire===0)value=integer();
      else { const size=wire===2?integer():wire===1?8:wire===5?4:-1;if(size<0||p+size>bytes.length)throw Error('Invalid MVT field');value=bytes.subarray(p,p+size);p+=size; }
      result.push({id,wire,value});if(result.length>100000)throw Error('MVT field budget exceeded');
    }
    return result;
  }
  const decoder=new TextDecoder(),rows:Record<string,unknown>[]=[];
  const data = (field:Field) => field.value as Uint8Array;
  for(const entry of fields(new Uint8Array(buffer))){
    if(entry.id!==3||entry.wire!==2)continue;
    const layer=fields(data(entry)),name=layer.find(f=>f.id===1&&f.wire===2);
    if(!name||!sourceLayers.includes(decoder.decode(data(name))))continue;
    const keys=layer.filter(f=>f.id===3&&f.wire===2).map(f=>decoder.decode(data(f)));
    const values=layer.filter(f=>f.id===4&&f.wire===2).map(f=>{
      const value=fields(data(f))[0];if(!value)return null;
      if(value.id===1&&value.wire===2)return decoder.decode(data(value));
      if(value.id===2&&value.wire===5){const b=data(value);return new DataView(b.buffer,b.byteOffset,b.byteLength).getFloat32(0,true);}
      if(value.id===3&&value.wire===1){const b=data(value);return new DataView(b.buffer,b.byteOffset,b.byteLength).getFloat64(0,true);}
      if(value.wire===0){const n=value.value as number;return value.id===7?!!n:value.id===6?(n%2?-(n+1)/2:n/2):n;}
      return null;
    });
    for(const feature of layer.filter(f=>f.id===2&&f.wire===2)){
      if(rows.length>=4096)throw Error('MVT feature budget exceeded');
      const tags=fields(data(feature)).find(f=>f.id===2&&f.wire===2),row:Record<string,unknown>=Object.create(null);
      if(tags){const packed=data(tags);let p=0;const index=()=>{let n=0,m=1;for(let i=0;i<5;i++){if(p>=packed.length)throw Error('Invalid MVT tags');const b=packed[p++];n+=(b&127)*m;if(!(b&128))return n;m*=128;}throw Error('Invalid MVT tags');};while(p<packed.length){const key=index(),value=index();if(key>=keys.length||value>=values.length)throw Error('Invalid MVT attribute');row[keys[key]]=values[value];}}
      rows.push(row);
    }
  }
  return rows;
}
