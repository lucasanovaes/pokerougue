import {writeFileSync} from 'node:fs';
import * as engine from '../src/engine/game';
import {DEFAULT_BALANCE,FIRST_PARTNERS} from '../src/engine/config';
import {createRoutePlan} from '../src/engine/route';
import {claimFirstPartner,newProfile,buyUpgrade,type UpgradeKey} from '../src/engine/profile';
import {simulateRun} from './simulation/policy';
import {routeAwareEngine} from './simulation/route-policy';
const count=Math.max(1000,Number(process.env.SIM_SEEDS??1000)),report=[];
for(const policy of ['control','public-route'])for(const mode of ['journey','quick-venom','quick-relay'])for(const cohort of ['fresh','upgraded','collected-shiny','collection-6'])for(const starter of FIRST_PARTNERS){
 let wins=0,hunts=0,actions=0;const reached=[0,0,0],cleared=[0,0,0];
 for(let seed=0;seed<count;seed++){
  let p=claimFirstPartner(newProfile(),starter);
  if(['upgraded','collected-shiny'].includes(cohort)){p.research=30;for(const key of ['hp','hp','balls','potions'] as UpgradeKey[])p=buyUpgrade(p,key);}
  if(cohort==='collected-shiny'){p.collection[0].shiny=true;for(const key of Object.keys(p.collection[0].ivs) as (keyof typeof p.collection[0]['ivs'])[])p.collection[0].ivs[key]=31;}
  if(cohort==='collection-6')p.collection=[...new Set([starter,1,4,7,25,74,41])].slice(0,6).map((speciesId,i)=>({...p.collection[0],id:`owned-${i}`,speciesId}));
  const s=engine.newGame({...DEFAULT_BALANCE},`fixed-${starter}-${seed}`,{runId:`${mode}-${cohort}-${policy}-${seed}`,upgrades:p.upgrades});
  if(mode!=='journey'){
   const known=p.collection.map(c=>c.speciesId),canDiscover=[0,1,3].some(d=>!known.includes(createRoutePlan(s.seed,true).encounters[d]));
   engine.configureTrail(s,seed%3===0&&canDiscover?'new':seed%3===2?'evolve':'careful',mode==='quick-venom'?'venom':'relay',known);
  }
  engine.startCollectedTeam(s,p,p.collection.map(c=>c.id));
  const result=simulateRun(policy==='public-route'?routeAwareEngine:engine,s,seed);wins+=Number(result.won);actions+=result.actions;hunts+=Number(s.trail?.completed);result.reached.forEach((v,i)=>reached[i]+=Number(v));result.cleared.forEach((v,i)=>cleared[i]+=Number(v));
  if(!engine.loadSave(JSON.stringify(s)))throw new Error(`Invalid fixed-route save: ${s.seed}/${mode}`);
 }
 report.push({policy,mode,cohort,starter:engine.titleCase(engine.DEX[starter].name),runs:count,reached,cleared,bossClearPct:cleared.map(n=>Math.round(n/count*1000)/10),bossConditionalPct:cleared.map((n,i)=>Math.round(n/Math.max(1,reached[i])*1000)/10),fullRunPct:Math.round(wins/count*1000)/10,huntCompleted:hunts,meanActions:Math.round(actions/count*10)/10});
}
const payload={totalRuns:report.length*count,seedsPerStarterCohort:count,nonTerminating:0,policy:'Control uses independent direction draws (one fixed node per step). Public-route adds lead selection using only the opponent/type forecast shown in the map and current party moves/HP. In Quick Run it also responds to visible intent/status. Neither inspects future IVs, shinies, rewards or hidden combat rolls.',notes:['Bot results are not human win rates or evidence of retention.','Fresh/upgraded/perfect-shiny cohorts start with one partner; collection-6 is an endowed mixed normal IV-18 roster.','Room schedule is fixed; forecasted species differ by seed and persist. All upcoming guardian supports are public.','Legacy blind-route simulations and the frozen baseline are preserved in separate reports. Their acceptance thresholds are not weakened or reused as fixed-route win-rate claims.','Comparison of policies combines lead planning and, in Quick Run, visible-intent use. It is not an isolated experiment measuring only map previews.','Quick Run has one guardian battle; Journey has three.'],report};
writeFileSync('reports/fixed-route-simulation.json',JSON.stringify(payload,null,2)+'\n');
writeFileSync('reports/fixed-route-simulation.md',`# Fixed-route simulations\n\n${payload.totalRuns.toLocaleString()} runs; ${count} seeds per mode/style/cohort/partner/policy. Bot rates are not human win rates.\n\n${payload.policy}\n\n| Policy | Mode | Cohort | Partner | Guardian reach counts | Guardian clear rates | Full clear |\n|---|---|---|---|---|---|---:|\n${report.map(r=>`| ${r.policy} | ${r.mode} | ${r.cohort} | ${r.starter} | ${r.reached.join(' / ')} | ${r.bossClearPct.join(' / ')}% | ${r.fullRunPct}% |`).join('\n')}\n\n${payload.notes.join('\n\n')}\n\nNon-terminating/invalid runs: 0.\n`);
if(report.filter(r=>r.cohort==='fresh'&&r.policy==='public-route').some(r=>r.fullRunPct<1))throw new Error('Every fresh partner must retain full-run wins with public-information planning.');
console.log(`Fixed-route gate passed: ${payload.totalRuns} runs; no invalid/non-terminating states. Reports: reports/fixed-route-simulation.md and .json`);
