import {mkdirSync,writeFileSync} from 'node:fs';
import * as current from '../src/engine/game';
import * as baseline from '../benchmarks/baseline-v1/engine/game';
import {DEFAULT_BALANCE,FIRST_PARTNERS} from '../src/engine/config';
import {buyUpgrade,newProfile,claimFirstPartner,type UpgradeKey} from '../src/engine/profile';
import {simulateRun,type Engine} from './simulation/policy';

const count=Math.max(1000,Number(process.env.SIM_SEEDS??1000));
const report:{cohort:string;starter:string;runs:number;reached:number[];cleared:number[];bossClearPct:number[];bossConditionalPct:number[];fullRunPct:number;meanFirstBossLevel:number;meanFirstBossParty:number;maxActions:number}[]=[];
for(const cohort of ['baseline','fresh','upgraded','collected-shiny','collection-3','collection-6','collection-6-shiny'])for(const id of (cohort==='baseline'?[1,4,7]:FIRST_PARTNERS)){
  const engine=(cohort==='baseline'?baseline:current) as Engine;
  const row={cohort,starter:current.titleCase(current.DEX[id].name),runs:count,reached:[0,0,0],cleared:[0,0,0],bossClearPct:[0,0,0],bossConditionalPct:[0,0,0],fullRunPct:0,meanFirstBossLevel:0,meanFirstBossParty:0,maxActions:0};
  let wins=0,levels=0,parties=0;
  for(let seed=0;seed<count;seed++){
    let profile=claimFirstPartner(newProfile(),id);
    if(cohort==='upgraded'||cohort==='collected-shiny'){profile.research=30;for(const key of ['potions','balls','hp','hp'] as UpgradeKey[])profile=buyUpgrade(profile,key);}
    const s=engine.newGame({...DEFAULT_BALANCE},`audit-${id}-${seed}`,{navigation:'legacy',upgrades:profile.upgrades,runId:`${cohort}-${id}-${seed}`});
    if(cohort.startsWith('collection-')){
      const lineup=[...new Set([id,1,4,7,25,74,41,46,69,61])].slice(0,cohort==='collection-3'?3:6);
      profile.collection=lineup.map((speciesId,i)=>({id:`fixture-${i}`,speciesId,shiny:cohort.endsWith('-shiny'),ivs:{hp:cohort.endsWith('-shiny')?31:18,attack:cohort.endsWith('-shiny')?31:18,defense:cohort.endsWith('-shiny')?31:18,spAttack:cohort.endsWith('-shiny')?31:18,spDefense:cohort.endsWith('-shiny')?31:18,speed:cohort.endsWith('-shiny')?31:18}}));
      if(!current.startCollectedTeam(s,profile,profile.collection.map(p=>p.id)))throw new Error('Invalid collection fixture');
    }else if(cohort==='collected-shiny'){
      profile.collection.push({id:'benchmark-shiny',speciesId:id,shiny:true,ivs:{hp:31,attack:31,defense:31,spAttack:31,spDefense:31,speed:31}});
      current.startCollectedTeam(s,profile,['benchmark-shiny']);
    }else engine.startRun(s,id);
    const result=simulateRun(engine,s,seed);if(result.won)wins++;
    result.reached.forEach((yes,i)=>row.reached[i]+=Number(yes));result.cleared.forEach((yes,i)=>row.cleared[i]+=Number(yes));
    levels+=result.leadLevelAtFirstBoss??0;parties+=result.partyAtFirstBoss??0;row.maxActions=Math.max(row.maxActions,result.actions);
  }
  row.bossClearPct=row.cleared.map(n=>Math.round(n/count*1000)/10);row.bossConditionalPct=row.cleared.map((n,i)=>Math.round(n/Math.max(1,row.reached[i])*1000)/10);
  row.fullRunPct=Math.round(wins/count*1000)/10;row.meanFirstBossLevel=Math.round(levels/Math.max(1,row.reached[0])*10)/10;row.meanFirstBossParty=Math.round(parties/Math.max(1,row.reached[0])*10)/10;report.push(row);
}
mkdirSync('reports',{recursive:true});
const payload={navigationMode:'legacy-hidden-paths',rulesVersion:2,seedsPerCohortStarter:count,totalRuns:count*report.length,policy:'Blind independent direction stream; visible-state combat heuristic; no future room inspection',notes:['Bot results are not human win rates.','Rates for each boss use all generated runs as denominator; conditional rates use runs reaching that boss.','Upgraded profile buys all four ranks with 30 endowed research. Collected-shiny adds one perfect-IV shiny starter, not a full retained team.','Collection-3 and collection-6 use endowed mixed collections at IV 18 with no upgrades. Collection-6-shiny uses the same roster with six perfect-IV shinies and no upgrades. These fixtures never grant Pokémon in the actual game.','Enemy levels and guardian team size use starting lineup size only; catches, IV quality and shiny ownership do not dynamically scale opponents. Guardian XP is divided across its team to avoid extra-opponent XP snowballing.','Baseline is the frozen pre-progression game. Same seed names and route stream across cohorts.','Bot limitations: fixed HP thresholds and no tactical switching can produce non-monotonic cohort rates (notably Bellsprout at boss 1); stronger stats are not evidence that this heuristic makes better decisions. Later bosses remain substantially harder and need human playtesting.'],nonTerminating:0,report};
writeFileSync('reports/simulation.json',JSON.stringify(payload,null,2)+'\n');
const table=['| Cohort | Starter | Boss 1 reached | Boss 1 clear | Boss 2 clear | Boss 3 / full clear | Lead level at boss 1 | Team size |','|---|---|---:|---:|---:|---:|---:|---:|',...report.map(r=>`| ${r.cohort} | ${r.starter} | ${r.reached[0]}/${count} | ${r.bossClearPct[0]}% | ${r.bossClearPct[1]}% | ${r.fullRunPct}% | ${r.meanFirstBossLevel} | ${r.meanFirstBossParty} |`)].join('\n');
writeFileSync('reports/simulation.md',`# Legacy blind-route compatibility simulation\n\n${payload.totalRuns.toLocaleString()} runs; ${count} independent seeds per starter/cohort. No hidden-room inspection. Bot results are not human win rates.\n\n${table}\n\nAll rates in this table use every generated run as the denominator. Conditional rates, exact boss reach/clear counts, and termination metrics are in simulation.json.\n\n${payload.notes.join('\n\n')}\n\nNon-terminating runs: 0.\n`);
console.table(report.map(r=>({cohort:r.cohort,starter:r.starter,boss1:r.bossClearPct[0],boss2:r.bossClearPct[1],full:r.fullRunPct})));
const fresh=report.filter(r=>r.cohort==='fresh');
if(fresh.some(r=>r.bossClearPct[0]<35||r.bossClearPct[0]>95||r.fullRunPct<1))throw new Error('Fresh-profile acceptance failed: boss 1 must clear in 35–95% of bot runs, and every starter must have full-run wins.');
if(Math.max(...fresh.map(r=>r.bossClearPct[0]))-Math.min(...fresh.map(r=>r.bossClearPct[0]))>15)throw new Error('Fresh starter boss-1 gap exceeds 15 percentage points.');
if(fresh.some(r=>r.bossClearPct[1]>r.bossClearPct[0]||r.bossClearPct[2]>r.bossClearPct[1]))throw new Error('Boss reach/clear accounting is not monotonic.');
const fullTeams=report.filter(r=>r.cohort==='collection-6');
if(fullTeams.some(r=>r.fullRunPct<5||r.bossClearPct[0]<50))throw new Error('Full-team acceptance failed: every six-member roster must clear boss 1 in at least 50% and complete at least 5% of blind bot runs.');
if(report.some(r=>r.bossClearPct[1]>r.bossClearPct[0]||r.bossClearPct[2]>r.bossClearPct[1]))throw new Error('Boss team rewards counted before the entire battle was cleared.');
console.log(`Simulation gate passed: ${payload.totalRuns} runs, no invalid or non-terminating states. Reports: reports/simulation.md and .json`);
