import {TRAIL_RULES} from './trail';
import {RUN_LENGTH,TEAM_PROGRESSION} from './config';
import type {GameState,Room,RoomKind} from './game';
export const BIOMES = [
  {name:'Viridian Wilds',subtitle:'Where every adventure takes root.',tag:'FOREST',accent:'#356653',pool:[10,12,16,19,23,25,27,35,37,39,41,43,46,48,52,54,56,58,63,69,74],boss:133},
  {name:'Cerulean Coast',subtitle:'Follow the tide into the unknown.',tag:'COAST',accent:'#397c88',pool:[7,25,54,60,72,79,81,84,88,92,96,100,104,109,116,120,129,133,50,102,1,61],boss:130},
  {name:'Ember Highlands',subtitle:'A final climb. A story worth telling.',tag:'HIGHLANDS',accent:'#9b6952',pool:[5,8,26,37,58,66,77,93,94,111,114,123,131,134,135,136,143,147,148,95],boss:149},
];
export const ROUTE_TRANSITION_MS=120;
export const ROUTE_SEQUENCE:RoomKind[]=['wild','wild','treasure','wild','camp','boss'];
export const ROUTE_LABELS:Record<RoomKind,string>={wild:'Wild Pokémon',elite:'Elite',treasure:'Item',camp:'Camp',shop:'Shop',event:'Event',boss:'Guardian'};
export type RoutePlan={version:1;encounters:number[]};
const routeHash=(text:string)=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
export function createRoutePlan(seed:string,trail=false):RoutePlan{
 const encounters=Array.from({length:RUN_LENGTH},(_,depth)=>{const b=BIOMES[Math.floor(depth/6)],kind=ROUTE_SEQUENCE[depth%6];return kind==='boss'?b.boss:kind==='wild'?(trail&&depth<6?TRAIL_RULES.pool:b.pool)[routeHash(`${seed}:route:${depth}`)%(trail&&depth<6?TRAIL_RULES.pool.length:b.pool.length)]:0;});
 // Opening catches offer different team options; battle RNG and shiny rolls remain independent.
 for(const depth of [1,7,13])if(encounters[depth]===encounters[depth-1]){const pool=trail&&depth<6?[...TRAIL_RULES.pool]:BIOMES[Math.floor(depth/6)].pool;encounters[depth]=pool[(pool.indexOf(encounters[depth])+1)%pool.length];}
 return {version:1,encounters};
}
export function fixedRooms():Room[][]{return Array.from({length:RUN_LENGTH},(_,depth)=>{const kind=ROUTE_SEQUENCE[depth%6];return [{id:`${depth}-0`,kind,label:ROUTE_LABELS[kind],hint:'',lane:0}];});}
export function routeStops(s:GameState,chapter=Math.min(2,Math.floor(s.depth/6))){return Array.from({length:6},(_,i)=>{const depth=chapter*6+i,room=s.map[depth]?.[0];const kind=room?.kind??ROUTE_SEQUENCE[i],speciesId=s.routePlan?.encounters[depth]??0,size=Math.max(1,s.startingTeamSize??1);const opponents=speciesId?(kind==='boss'?[...TEAM_PROGRESSION.supports[chapter].slice(0,TEAM_PROGRESSION.bossTeamThresholds.filter(n=>size>=n).length),speciesId]:[speciesId]):[];return {depth,kind,speciesId,opponents,done:depth<s.depth,current:depth===s.depth};});}
