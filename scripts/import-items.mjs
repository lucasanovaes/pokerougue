import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const folder=fileURLToPath(new URL('../public/assets/items/',import.meta.url));
const items=['potion','hp-up','poke-ball','great-ball','oran-berry','revive','dragon-fang','miracle-seed','wide-lens','assault-vest','poison-barb','black-sludge','quick-claw','sitrus-berry','nugget'];
await mkdir(folder,{recursive:true});const manifest=[];
for(const name of items){const file=`${name}.png`,source=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${file}`;let bytes;try{bytes=await readFile(folder+file);}catch{const response=await fetch(source,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`${name}: ${response.status}`);bytes=Buffer.from(await response.arrayBuffer());await writeFile(folder+file,bytes);}if(bytes.subarray(1,4).toString()!=='PNG')throw new Error(`Invalid item: ${name}`);manifest.push({file,source,sha256:createHash('sha256').update(bytes).digest('hex')});}
await writeFile(folder+'sources.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Cached ${items.length} item sprites locally.`);
