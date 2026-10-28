import type {BattleVisualEvent,GameState} from './game';
export const ATTACK_TIMING={impact:220,duration:480,reducedImpact:20,reducedDuration:100} as const;
export const EFFECTS:Record<string,{asset:string;color:string}>={
  normal:{asset:'impact',color:'#eee0ad'},fire:{asset:'fireball',color:'#ff873f'},water:{asset:'waterwisp',color:'#63ceff'},grass:{asset:'leaf1',color:'#a3dd66'},electric:{asset:'electroball',color:'#ffdf52'},ice:{asset:'iceball',color:'#b5efff'},fighting:{asset:'fist',color:'#f29875'},poison:{asset:'poisonwisp',color:'#d29ced'},ground:{asset:'rock1',color:'#c3a275'},flying:{asset:'feather',color:'#d8eaff'},psychic:{asset:'energyball',color:'#ed95ce'},bug:{asset:'leaf1',color:'#c8dc72'},rock:{asset:'rock1',color:'#bca281'},ghost:{asset:'shadowball',color:'#b4a0ea'},dragon:{asset:'energyball',color:'#9c9cf5'},dark:{asset:'shadowball',color:'#a5a0b6'},steel:{asset:'impact',color:'#d0e2e5'},fairy:{asset:'wisp',color:'#ffd0e8'},
};
export function effectFor(event:BattleVisualEvent){
  if(event.move.category==='status')return {asset:event.move.effect==='guard'?'wisp':event.move.effect==='weaken'?'sound':event.move.effect==='sleep'?'wisp':event.move.effect==='burn'?'fireball':event.move.effect==='paralysis'?'electroball':'poisonwisp',color:EFFECTS[event.move.type]?.color??'#e2d5a2'};
  return EFFECTS[event.move.type]??EFFECTS.normal;
}
export function applyVisualImpact(before:GameState,event:BattleVisualEvent){
  const view=structuredClone(before);
  for(const p of [...view.party,...(view.enemy?[view.enemy]:[])]){if(p.uid===event.targetId){p.hp=event.targetHp;p.status=event.targetStatus;}if(p.uid===event.actorId)p.hp=event.actorHp;}
  return view;
}
