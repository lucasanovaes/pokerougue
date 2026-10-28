import {writeFileSync} from 'node:fs';
import * as engine from '../src/engine/game';
import {DEFAULT_BALANCE,FIRST_PARTNERS} from '../src/engine/config';
import {newProfile,claimFirstPartner,buyUpgrade,type UpgradeKey} from '../src/engine/profile';
import {simulateRun} from './simulation/policy';
import {trailAwareEngine} from './simulation/trail-policy';
const count=Math.max(1000,Number(process.env.SIM_SEEDS??1000));
const report=[];
for(const policy of ['blind-control','visible-intent'])for(const style of ['venom','relay'] as const)for(const cohort of ['fresh','upgraded','collected-shiny','collection-6'])for(const id of FIRST_PARTNERS){
 let wins=0,reached=0,completed=0,poisonHeals=0,guardedHits=0,switches=0,evolutions=0,captures=0,actions=0;
 for(let seed=0;seed<count;seed++){
  let profile=claimFirstPartner(newProfile(),id);
  if(cohort==='upgraded'||cohort==='collected-shiny'){profile.research=30;for(const key of ['potions','balls','hp','hp'] as UpgradeKey[])profile=buyUpgrade(profile,key);}
  if(cohort==='collected-shiny'){profile.collection[0].shiny=true;Object.keys(profile.collection[0].ivs).forEach(k=>profile.collection[0].ivs[k as keyof typeof profile.collection[0]['ivs']]=31);}
  if(cohort==='collection-6'){const roster=[...new Set([id,1,4,7,25,74,41])].slice(0,6);profile.collection=roster.map((speciesId,i)=>({...profile.collection[0],id:`trail-owned-${i}`,speciesId}));}
  const s=engine.newGame({...DEFAULT_BALANCE},`trail-audit-${id}-${seed}`,{navigation:'legacy',runId:`${policy}-${style}-${cohort}-${seed}`,upgrades:profile.upgrades});
  engine.configureTrail(s,seed%3===0?'new':seed%3===1?'careful':'evolve',style,profile.collection.map(p=>p.speciesId));engine.startCollectedTeam(s,profile,profile.collection.map(p=>p.id));
  const result=simulateRun(policy==='visible-intent'?trailAwareEngine:engine,s,seed);
  wins+=Number(result.won);reached+=Number(result.reached[0]);completed+=Number(s.trail!.completed);poisonHeals+=s.trail!.stats.poisonHeals;guardedHits+=s.trail!.stats.guardedHits;switches+=s.trail!.stats.switches;evolutions+=s.party.filter(p=>p.speciesId!==profile.collection[0].speciesId&&p.sourceSpecimenId===profile.collection[0].id).length;captures+=s.captures;actions+=result.actions;
  if(!engine.loadSave(JSON.stringify(s)))throw new Error(`Trail save invalid: ${s.seed}`);
 }
 const pct=(n:number)=>Math.round(n/count*1000)/10;
 report.push({policy,style,cohort,starter:engine.titleCase(engine.DEX[id].name),runs:count,bossReached:reached,bossCleared:wins,bossClearPct:pct(wins),bossConditionalPct:Math.round(wins/Math.max(1,reached)*1000)/10,fullRunPct:pct(wins),huntCompleted:completed,huntPct:pct(completed),meanCaptures:Math.round(captures/count*100)/100,partnerEvolutionPct:pct(evolutions),meanPoisonHealing:Math.round(poisonHeals/count*10)/10,meanGuardedHits:Math.round(guardedHits/count*10)/10,meanSwitches:Math.round(switches/count*10)/10,meanActions:Math.round(actions/count*10)/10});
}
const payload={navigationMode:'legacy-hidden-paths',totalRuns:report.length*count,seedsPerStarterCohort:count,nonTerminating:0,policy:'Both policies use blind independent directions. Visible-intent adapts to the same current intent/status and team shown in the UI; no future-room, encounter or reward inspection. No scouting used. Camps rest; no free lesson chosen.',notes:['Bot rates are not human win rates or engagement metrics.','Three hunts rotate by seed; completion is pooled across them.','Fresh and upgraded start with one normal individual. Collected-shiny starts with one endowed perfect shiny plus capped upgrades.','Collection-6 uses six endowed normal IV-18 individuals without upgrades.','The six-room mode has one guardian battle; boss clear and full clear are equivalent. Exact reach and conditional rates are included.','The original 51,000-campaign baseline/control suite remains separately mandatory.'],report};
writeFileSync('reports/trail-simulation.json',JSON.stringify(payload,null,2)+'\n');
writeFileSync('reports/trail-simulation.md',`# Legacy discovery trail compatibility simulations\n\n${payload.totalRuns.toLocaleString()} runs; 1,000 seeds per starter/style/cohort/policy. Bot rates are not human win rates.\n\n${payload.policy}\n\n| Policy | Style | Cohort | Partner | Guardian reached | Full clear | Hunt complete |\n|---|---|---|---|---:|---:|---:|\n${report.map(r=>`| ${r.policy} | ${r.style} | ${r.cohort} | ${r.starter} | ${r.bossReached}/${count} | ${r.fullRunPct}% | ${r.huntPct}% |`).join('\n')}\n\n${payload.notes.join('\n\n')}\n\nNon-terminating/invalid runs: 0.\n`);
if(report.filter(r=>r.cohort==='fresh').some(r=>r.fullRunPct<1))throw new Error('Every fresh trail partner/style/policy must have full-run wins in at least 1% of runs.');
const aware=report.filter(r=>r.policy==='visible-intent');if(!aware.some(r=>r.style==='venom'&&r.meanPoisonHealing>0)||!aware.some(r=>r.style==='relay'&&r.meanGuardedHits>0&&r.meanSwitches>0))throw new Error('Both build mechanics must be exercised by the public-state bot.');
console.log(`Trail simulation gate passed: ${payload.totalRuns} runs. Fresh clear range ${Math.min(...report.filter(r=>r.cohort==='fresh').map(r=>r.fullRunPct))}–${Math.max(...report.filter(r=>r.cohort==='fresh').map(r=>r.fullRunPct))}%. Reports: reports/trail-simulation.md and .json`);
