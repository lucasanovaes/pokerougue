import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ids = [1,2,3,4,5,6,7,8,9,10,11,12,16,19,23,25,26,27,35,37,39,41,42,43,46,47,48,50,52,54,56,58,60,61,62,63,66,69,70,71,72,74,75,76,77,79,81,84,88,92,93,94,95,96,100,102,104,109,111,114,116,120,123,129,130,131,133,134,135,136,143,147,148,149];
const root = fileURLToPath(new URL('../', import.meta.url));
const cache = path.join(root, '.cache/pokeapi');
await mkdir(cache, {recursive:true});
await mkdir(path.join(root, 'src/data'), {recursive:true});
const delay = ms => new Promise(r => setTimeout(r, ms));
async function download(url, target, json=false) {
  try { const old = await readFile(target); return json ? JSON.parse(old.toString()) : old; } catch {}
  let error;
  for (let attempt=0; attempt<4; attempt++) {
    try {
      const res = await fetch(url, {signal:AbortSignal.timeout(30000)});
      if(!res.ok) throw new Error(`${res.status}: ${url}`);
      const value = json ? await res.json() : Buffer.from(await res.arrayBuffer());
      await mkdir(path.dirname(target), {recursive:true});
      await writeFile(target, json ? JSON.stringify(value) : value);
      return value;
    } catch(e) {error=e;await delay(200*(attempt+1));}
  }
  throw error;
}
const api = endpoint => download(`https://pokeapi.co/api/v2/${endpoint}`, path.join(cache, endpoint.replaceAll('/','_')+'.json'), true);
async function mapLimit(items, limit, fn) {
  let index=0;
  await Promise.all(Array.from({length:limit}, async()=>{while(index<items.length){const i=index++;await fn(items[i],i);}}));
}
const pokemon = [];
await mapLimit(ids, 5, async(id,i)=>{
  const [p,s] = await Promise.all([api(`pokemon/${id}`),api(`pokemon-species/${id}`)]);
  const values = Object.fromEntries(p.stats.map(v=>[v.stat.name,v.base_stat]));
  pokemon[i]={id,name:p.name,types:p.types.sort((a,b)=>a.slot-b.slot).map(t=>t.type.name),baseStats:{hp:values.hp,attack:values.attack,defense:values.defense,spAttack:values['special-attack'],spDefense:values['special-defense'],speed:values.speed},captureRate:s.capture_rate};
  for(const variant of ['', 'shiny/', 'back/', 'back/shiny/']) {
    await download(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${variant}${id}.png`,path.join(root,'public/assets/pokemon',variant,`${id}.png`));
  }
});
await writeFile(path.join(root,'src/data/pokemon.json'),JSON.stringify(pokemon,null,2)+'\n');
const names=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const matrix={};
await mapLimit(names,4,async(name)=>{
  const t=await api(`type/${name}`);
  const row=Object.fromEntries(names.map(n=>[n,1]));
  for(const [key,mult] of [['double_damage_to',2],['half_damage_to',0.5],['no_damage_to',0]]) for(const e of t.damage_relations[key]) row[e.name]=mult;
  matrix[name]=row;
});
await writeFile(path.join(root,'src/data/types.json'),JSON.stringify(Object.fromEntries(names.map(n=>[n,matrix[n]])),null,2)+'\n');
let spriteCount=0;
for(const id of ids)for(const variant of ['','shiny/','back/','back/shiny/']){const data=await readFile(path.join(root,'public/assets/pokemon',variant,`${id}.png`));if(data.subarray(1,4).toString()!=='PNG')throw new Error(`Invalid PNG: ${variant}${id}`);spriteCount++;}
console.log(`Imported ${pokemon.length} species, ${spriteCount} valid normal/shiny front/back sprites, ${names.length}×${names.length} type matrix.`);
