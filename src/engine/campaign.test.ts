import {it,expect} from 'vitest';
import * as engine from './game';
import {simulateRun,routeStream} from '../../scripts/simulation/policy';
it('finishes blind-route campaigns without privileged room inspection',()=>{
  const wins:Record<number,number>={1:0,4:0,7:0};
  for(const starter of [1,4,7])for(let seed=0;seed<250;seed++){
    const s=engine.newGame(undefined,`smoke-${starter}-${seed}`);engine.startRun(s,starter);
    const result=simulateRun(engine,s,seed);expect(result.actions).toBeLessThan(3000);expect(['won','lost']).toContain(s.phase);if(result.won)wins[starter]++;
  }
  expect(Object.values(wins).every(n=>n>0)).toBe(true);
});
it('route randomness is independent of combat and contains both directions',()=>{
  const a=routeStream(8),b=routeStream(8),s=engine.newGame();const directions=[];
  for(let i=0;i<50;i++){engine.random(s);directions.push(a());expect(directions.at(-1)).toBe(b());}
  expect(new Set(directions).size).toBe(2);
});

it('finishes encounters after attack PP expires while status PP remains',()=>{
  const s=engine.newGame(undefined,'pp-stall');engine.startRun(s,4);
  engine.enterRoom(s,'0-0');s.party[0].moves.forEach(m=>{if(m.power>0)m.pp=0;});
  const result=simulateRun(engine,s,1);expect(result.actions).toBeLessThan(3000);expect(['won','lost']).toContain(s.phase);
});
