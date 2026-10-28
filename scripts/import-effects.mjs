import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const names=['fireball','waterwisp','electroball','leaf1','poisonwisp','iceball','rock1','shadowball','energyball','fist','impact','sound','wisp','feather'];
mkdirSync('public/assets/fx',{recursive:true});
const rows=names.map(name=>{
  const file=`${name}.png`,source=`https://play.pokemonshowdown.com/fx/${file}`,path=`public/assets/fx/${file}`;
  execFileSync('curl',['-fsSL','--retry','2',source,'-o',path]);
  const data=readFileSync(path);if(data.subarray(1,4).toString()!=='PNG')throw new Error(`Invalid effect asset: ${file}`);
  return {file,source,sha256:createHash('sha256').update(data).digest('hex')};
});
writeFileSync('public/assets/fx/sources.json',JSON.stringify(rows,null,2)+'\n');
console.log(`Cached ${rows.length} Pokémon Showdown effect graphics.`);
