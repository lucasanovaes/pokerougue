import type {GameState,Direction} from '../../src/engine/game';
import type * as Current from '../../src/engine/game';
export type Engine=Pick<typeof Current,'newGame'|'startRun'|'battleAction'|'choosePath'|'resolveDiscovery'|'captureChance'|'effectiveness'|'chooseReward'|'camp'|'buy'|'leaveRoom'|'eventChoice'|'replaceCapture'|'fieldMedicine'|'DEX'>;
// No game state is accepted here: route choices cannot inspect hidden rooms.
export function routeStream(seed:number){let rng=Math.imul(seed+1,2654435761)>>>0;return ():Direction=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return (rng>>>31)?'left':'right';};}
export type Outcome={won:boolean;depth:number;reached:boolean[];cleared:boolean[];leadLevelAtFirstBoss:number|null;partyAtFirstBoss:number|null;actions:number};
export function simulateRun(engine:Engine,s:GameState,seed:number):Outcome{
  const direction=routeStream(seed),result:Outcome={won:false,depth:0,reached:[false,false,false],cleared:[false,false,false],leadLevelAtFirstBoss:null,partyAtFirstBoss:null,actions:0};
  while(!['won','lost'].includes(s.phase)&&result.actions++<3000){
    if(s.phase==='map'){
      for(let i=0;i<s.party.length;i++){if(s.party[i].hp===0)engine.fieldMedicine(s,i,true);if(s.party[i].hp>0&&s.party[i].hp<s.party[i].stats.hp*.55)engine.fieldMedicine(s,i);}
      s.active=s.party.reduce((best,p,i)=>p.hp>0&&p.level>s.party[best].level?i:best,s.party.findIndex(p=>p.hp>0));
      engine.choosePath(s,direction());engine.resolveDiscovery(s);
      if(s.room?.kind==='boss'){const act=Math.floor(s.depth/6);result.reached[act]=true;if(act===0){result.leadLevelAtFirstBoss=s.party[s.active].level;result.partyAtFirstBoss=s.party.length;}}
    }else if(s.phase==='discovery')engine.resolveDiscovery(s);
    else if(s.phase==='battle'){
      const p=s.party[s.active],enemy=s.enemy!;
      if(!p.hp){engine.battleAction(s,{kind:'switch',index:s.party.findIndex(p=>p.hp>0)});continue;}
      if(p.hp<p.stats.hp*.5&&s.bag.potions>0){engine.battleAction(s,{kind:'potion'});continue;}
      if(s.room?.kind==='wild'&&s.party.length<6&&enemy.hp<enemy.stats.hp*.75&&s.bag.balls>0&&engine.captureChance(s)>.25){engine.battleAction(s,{kind:'ball',great:false});continue;}
      const choices=p.moves.map((m,i)=>({i,score:m.pp>0&&m.power>0?m.power*engine.effectiveness(m.type,enemy)*(engine.DEX[p.speciesId].types.includes(m.type)?1.5:1)*(m.category==='physical'?p.stats.attack/enemy.stats.defense:p.stats.spAttack/enemy.stats.spDefense):-1})).sort((a,b)=>b.score-a.score);
      const setup=s.room?.kind==='wild'&&s.party.length<6&&enemy.hp>=enemy.stats.hp*.75&&s.bag.balls>0;
      const chosen=setup?choices.filter(c=>c.score>0).at(-1)??choices[0]:choices[0];
      engine.battleAction(s,{kind:'move',index:chosen.score<0?p.moves.findIndex(m=>m.pp>0):chosen.i});
    }else if(s.phase==='reward'){
      if(s.room?.kind==='boss')result.cleared[Math.floor(s.depth/6)]=true;
      engine.chooseReward(s,s.rewardOptions.includes('medicine')&&s.bag.potions<3?'medicine':s.rewardOptions.find(r=>!['supplies','medicine','gold'].includes(r))??(s.party.length<6?'supplies':'medicine'));
    }else if(s.phase==='camp')engine.camp(s,'rest');
    else if(s.phase==='event')engine.eventChoice(s,'berry');
    else if(s.phase==='shop'){while(s.gold>=25)engine.buy(s,2);engine.leaveRoom(s);}
    else if(s.phase==='replace')engine.replaceCapture(s,-1);
    else throw new Error(`Unexpected simulation phase: ${s.phase}`);
    if(s.party.length>6||s.gold<0||Object.values(s.bag).some(n=>n<0)||s.party.some(p=>p.hp<0||p.hp>p.stats.hp||p.moves.some(m=>m.pp<0)))throw new Error(`Invalid state at ${s.seed}, depth ${s.depth}`);
  }
  if(result.actions>=3000)throw new Error(`Run did not terminate: ${s.seed}`);
  result.won=s.phase==='won';result.depth=s.depth;return result;
}
