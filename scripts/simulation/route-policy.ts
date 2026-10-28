import * as engine from '../../src/engine/game';
import {routeStops} from '../../src/engine/route';
import {trailAwareEngine} from './trail-policy';
import type {Engine} from './policy';
// The same public opponent/type forecast displayed in RouteMap. No enemy IVs,
// shiny rolls, future rewards, or hidden encounter state are inspected.
export const routeAwareEngine:Engine={...trailAwareEngine,choosePath(s,direction){
 const stop=routeStops(s).find(p=>p.current),next=stop?.opponents[0];
 if(s.routePlan&&s.phase==='map'&&next){
  const target=engine.DEX[next].types;
  const score=(index:number)=>{const p=s.party[index];if(p.hp<=0)return -1;const attack=Math.max(...p.moves.filter(m=>m.pp>0&&m.power>0).map(m=>m.power*target.reduce((n,t)=>n*engine.TYPE_CHART[m.type][t],1)*(engine.DEX[p.speciesId].types.includes(m.type)?1.5:1)),0);const threat=Math.max(...target.map(type=>engine.DEX[p.speciesId].types.reduce((n,t)=>n*engine.TYPE_CHART[type][t],1)));return attack*(.5+.5*p.hp/p.stats.hp)/Math.max(.5,threat);};
  s.active=s.party.reduce((best,_,i)=>score(i)>score(best)?i:best,s.party.findIndex(p=>p.hp>0));
 }
 engine.choosePath(s,direction);
}};
