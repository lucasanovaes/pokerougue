import type {GameState,Move,Pokemon} from './game';
export type Hunt='new'|'careful'|'evolve'|'none';
export type TrailStyle='venom'|'relay';
export type TrailCharm='venomheart'|'venomfang'|'venomlens'|'relayguard'|'relayrush'|'relaypatch';
export const TRAIL_RULES={rooms:6,wildLevels:[4,7,8,10,0,16],guardianHp:3.8,pool:[10,16,19,25,27,35,39,41,46,54,69,74],experience:2,roomExperience:24,scouts:1,scoutFromDepth:2,poisonHeal:2,poisonDamage:1.35,poisonCapture:1.4,switchGuard:.5,switchDamage:1.35,switchHeal:.2,braceGuard:.65,heavyPower:110,lightPower:45} as const;
export const HUNTS:Record<Hunt,{name:string;description:string;badge:string}>={
  new:{name:'New discovery',description:'Catch a species missing from your collection.',badge:'Trail Discoverer'},
  careful:{name:'Careful catcher',description:'Catch a Pokémon while it has a condition.',badge:'Gentle Hands'},
  evolve:{name:'Growing together',description:'Evolve a teammate on this expedition.',badge:'Growing Together'},
  none:{name:'Just explore',description:'No request. Follow your curiosity.',badge:''},
};
export const TRAIL_CHARMS:Record<TrailCharm,{name:string;description:string;icon:string}>={
  venomheart:{name:'Venom Heart',description:'Enemy poison ticks heal your living lead by 2 HP.',icon:'leaf'},
  venomfang:{name:'Toxic Fang',description:'Deal 35% more move damage to poisoned enemies.',icon:'zap'},
  venomlens:{name:'Spore Lens',description:'Capture chance ×1.4 against poisoned Pokémon.',icon:'sparkles'},
  relayguard:{name:'Relay Shell',description:'First voluntary switch each battle halves the incoming hit.',icon:'shield'},
  relayrush:{name:'Baton Spark',description:'First switch boosts the incoming Pokémon’s next damaging move by 35%.',icon:'zap'},
  relaypatch:{name:'Welcome Berry',description:'First voluntary switch each battle heals the incoming Pokémon by 20%.',icon:'leaf'},
};
export type TrailState={version:1;style:TrailStyle;hunt:Hunt;knownSpecies:number[];completed:boolean;scoutedDepths:number[];technique:'venom'|'brace';lessonLearned:boolean;relayUsed:boolean;rushUid:string|null;stats:{poisonHeals:number;guardedHits:number;switches:number}};
export const isTrailCharm=(id:string):id is TrailCharm=>Object.hasOwn(TRAIL_CHARMS,id);
export const trailTechnique=(id:'venom'|'brace'):Move=>id==='venom'?{name:'Toxic Spores',type:'poison',category:'status',power:0,accuracy:90,priority:0,pp:15,maxPP:15,effect:'poison'}:{name:'Brace',type:'normal',category:'status',power:0,accuracy:100,priority:3,pp:15,maxPP:15,effect:'guard'};
export function applyTrailTechnique(s:GameState,p:Pokemon){if(s.trail)p.moves[2]=trailTechnique(s.trail.technique);}
export function trailIntent(s:GameState):{name:string;hint:string;move:Move}|null{
  if(!s.trail||s.phase!=='battle'||!s.enemy)return null;
  const boss=s.room?.kind==='boss',pattern=boss?0:s.enemy.speciesId%3;
  if((boss||pattern===0)&&s.turn%3===0)return {name:'Bracing',hint:boss?'Heavy attack next turn. Prepare or switch.':'Reduces this turn’s incoming hit.',move:trailTechnique('brace')};
  if(boss)return {name:s.turn%3===1?'Heavy strike':'Cleansing gust',hint:s.turn%3===1?'Brace, weaken it, or switch behind Relay Shell.':'A lighter hit; clears the guardian’s conditions this turn.',move:{name:s.turn%3===1?'Canopy Crash':'Cleansing Gust',type:s.turn%3===1?'grass':'flying',power:s.turn%3===1?TRAIL_RULES.heavyPower:TRAIL_RULES.lightPower,category:'physical',accuracy:100,priority:0,pp:999,maxPP:999}};
  if(pattern===2&&s.turn===0)return {name:'Setting a condition',hint:'Prepare a catch or strike first.',move:{...s.enemy.moves[2],pp:999,maxPP:999}};
  const move=s.enemy.moves[pattern===1?0:1];return {name:pattern===1?'Quick strike':'Attacking',hint:pattern===1?'Priority move. Switching still takes a hit.':'A regular attack.',move:{...move,pp:999,maxPP:999}};
}
export function trailLength(s:Pick<GameState,'trail'>){return s.trail?TRAIL_RULES.rooms:18;}
