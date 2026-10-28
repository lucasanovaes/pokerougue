import * as engine from '../../src/engine/game';
import {trailIntent} from '../../src/engine/trail';
import type {Engine} from './policy';
// Same hidden-route stream as the control bot. Adapt only to public intent/status/party.
export const trailAwareEngine:Engine={...engine,battleAction(s,action,emit){
  if(s.phase==='battle'&&s.trail&&s.party[s.active].hp>0&&action.kind==='move'){
    const p=s.party[s.active],foe=s.enemy!,intent=trailIntent(s);
    const brace=p.moves.findIndex(m=>m.effect==='guard'&&m.pp>0);
    if(intent?.name==='Heavy strike'){
      const replacement=s.party.findIndex((q,i)=>i!==s.active&&q.hp>q.stats.hp*.4);
      if(!s.trail.relayUsed&&s.relics.includes('relayguard')&&replacement>=0){engine.battleAction(s,{kind:'switch',index:replacement},emit);return;}
      if(brace>=0&&p.hp<p.stats.hp*.6){engine.battleAction(s,{kind:'move',index:brace},emit);return;}
    }
    const poison=p.moves.findIndex(m=>m.effect==='poison'&&m.pp>0),types=engine.DEX[foe.speciesId].types;
    if(foe.status==='none'&&!types.includes('poison')&&!types.includes('steel')&&poison>=0&&(s.relics.includes('venomheart')||s.trail.hunt==='careful')&&s.turn<2){engine.battleAction(s,{kind:'move',index:poison},emit);return;}
    const wantsCatch=s.party.length<6||!s.trail.completed&&(s.trail.hunt==='careful'||s.trail.hunt==='new'&&!s.trail.knownSpecies.includes(foe.speciesId));
    if(s.room?.kind==='wild'&&wantsCatch&&foe.status!=='none'&&s.bag.balls>0&&engine.captureChance(s)>.25){engine.battleAction(s,{kind:'ball',great:false},emit);return;}
  }
  engine.battleAction(s,action,emit);
}};
