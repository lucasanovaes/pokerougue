import rawPokemon from '../data/pokemon.json';
import {BASE_FORMS,PROGRESSION,FIRST_PARTNERS,PARTY_SIZE,COLLECTION_POLICY,type TeamRule} from './config';
import type {GameState,Stats,Pokemon} from './game';

export type UpgradeKey='potions'|'balls'|'hp';
export type Upgrades=Record<UpgradeKey,number>;
export type Specimen={id:string;speciesId:number;ivs:Stats;shiny:boolean;favorite?:boolean};
export type Ledger={rooms:number;bosses:number[];captures:string[];started:boolean;finished:boolean;earned:number};
export type Profile={version:1;onboarded:boolean;research:number;upgrades:Upgrades;spent:number;collection:Specimen[];discoveries:number[];seenSpecies:number[];registeredSpecies:number[];releasedIds:string[];trailBadges:string[];runs:number;wins:number;bestDepth:number;maxChallenge:number;ledger:Record<string,Ledger>};
export const UPGRADE_DEFS = {
  potions:{name:'First aid',description:'+1 starting potion',costs:[5],max:1},
  balls:{name:'Extra pocket',description:'+3 starting balls',costs:[5],max:1},
  hp:{name:'Vitality',description:'+5% team HP per rank · max 10%',costs:[8,12],max:2},
} as const;
const statKeys=['hp','attack','defense','spAttack','spDefense','speed'] as const;
const dex=new Map(rawPokemon.map(p=>[p.id,p]));
export const emptyUpgrades=():Upgrades=>({potions:0,balls:0,hp:0});
export const startingForm=(id:number)=>BASE_FORMS[id]??id;
export function starterCost(id:number){const base=dex.get(startingForm(id));return base?Math.max(2,Math.min(5,Math.ceil(Object.values(base.baseStats).reduce((a,b)=>a+b,0)/130))):99;}
export function newProfile():Profile{
  return {version:1,onboarded:false,research:0,upgrades:emptyUpgrades(),spent:0,collection:[],discoveries:[],seenSpecies:[],registeredSpecies:[],releasedIds:[],trailBadges:[],runs:0,wins:0,bestDepth:0,maxChallenge:0,ledger:{}};
}
export function claimFirstPartner(previous:Profile,speciesId:number):Profile{if(previous.onboarded||!FIRST_PARTNERS.includes(speciesId as typeof FIRST_PARTNERS[number]))return previous;const p=structuredClone(previous);p.onboarded=true;p.collection=[{id:`first-${speciesId}`,speciesId,ivs:Object.fromEntries(statKeys.map(k=>[k,18])) as Stats,shiny:false}];p.discoveries=[speciesId];p.seenSpecies=[speciesId];p.registeredSpecies=[speciesId];return p;}
export function teamCost(profile:Profile,ids:string[]){return ids.reduce((sum,id)=>{const specimen=profile.collection.find(p=>p.id===id);return sum+starterCost(specimen?.speciesId??-1)+Number(specimen?.shiny??false);},0);}
export function validTeam(profile:Profile,ids:string[],rule:TeamRule='open'){return ['open','budget'].includes(rule)&&ids.length>0&&ids.length<=PARTY_SIZE&&new Set(ids).size===ids.length&&ids.every(id=>profile.collection.some(p=>p.id===id))&&(rule!=='budget'||teamCost(profile,ids)<=PROGRESSION.starterBudget);}
export function fillTeam(profile:Profile,selected:string[]){const ids=[...new Set(selected.filter(id=>profile.collection.some(p=>p.id===id)))].slice(0,PARTY_SIZE);for(const p of profile.collection){if(ids.length===PARTY_SIZE)break;if(!ids.includes(p.id))ids.push(p.id);}return ids;}
export function syncProfile(previous:Profile,run:GameState):Profile{
  const p=structuredClone(previous),id=run.runId??`run:legacy:${run.seed}`;
  // Migrate the partner already used in an older run; never grant unchosen starters.
  if(!p.onboarded&&run.party.length){p.onboarded=true;for(const pokemon of run.party){if(!(p.releasedIds??[]).includes(pokemon.uid)&&!p.collection.some(c=>c.id===pokemon.uid))p.collection.push(specimenOf(pokemon));if(!(run.caughtPokemon??[]).some(c=>c.uid===pokemon.uid)&&!p.discoveries.includes(pokemon.speciesId))p.discoveries.push(pokemon.speciesId);}}
  let ledger=Object.hasOwn(p.ledger,id)?p.ledger[id]:undefined;
  if(!ledger){ledger={rooms:0,bosses:[],captures:[],started:false,finished:false,earned:0};p.ledger[id]=ledger;}
  const award=(amount:number)=>{p.research+=amount;ledger!.earned+=amount;};
  if(run.phase!=='starter'&&!ledger.started){ledger.started=true;p.runs++;}
  const completed=Math.min(18,Math.max(0,run.depth));
  if(completed>ledger.rooms){award((completed-ledger.rooms)*PROGRESSION.researchPerRoom);ledger.rooms=completed;}
  for(const depth of run.defeatedBosses??[]){if(!ledger.bosses.includes(depth)){award(PROGRESSION.researchPerBoss);ledger.bosses.push(depth);}}
  for(const pokemon of run.caughtPokemon??[]){
    if(ledger.captures.includes(pokemon.uid))continue;ledger.captures.push(pokemon.uid);
    if(!(p.releasedIds??[]).includes(pokemon.uid)&&!p.collection.some(c=>c.id===pokemon.uid))p.collection.push(specimenOf(pokemon));
    if(!p.discoveries.includes(pokemon.speciesId)){p.discoveries.push(pokemon.speciesId);award(PROGRESSION.researchPerDiscovery);}
  }
  p.registeredSpecies=[...new Set([...(p.registeredSpecies??[]),...p.discoveries,...p.collection.map(c=>c.speciesId),...run.party.map(pokemon=>pokemon.speciesId)])];
  p.seenSpecies=[...new Set([...(p.seenSpecies??[]),...p.registeredSpecies,...p.discoveries,...run.seen,...run.party.map(pokemon=>pokemon.speciesId)])];
  p.trailBadges??=[];if(run.trail?.completed&&run.trail.hunt!=='none'&&!p.trailBadges.includes(run.trail.hunt))p.trailBadges.push(run.trail.hunt);
  p.bestDepth=Math.max(p.bestDepth,completed);
  if((run.phase==='won'||run.phase==='lost')&&!ledger.finished){ledger.finished=true;if(run.phase==='won'){p.wins++;if(!run.trail)p.maxChallenge=Math.max(p.maxChallenge,Math.min(PROGRESSION.maxChallenge,(run.difficulty??0)+1));}}
  return p;
}
export const specimenOf=(p:Pokemon):Specimen=>({id:p.uid,speciesId:p.speciesId,ivs:{...p.ivs},shiny:p.shiny});
export function buyUpgrade(previous:Profile,key:UpgradeKey):Profile{
  if(!Object.hasOwn(UPGRADE_DEFS,key))return previous;
  const def=UPGRADE_DEFS[key],rank=previous.upgrades[key],price=def.costs[rank];
  if(rank>=def.max||price===undefined||previous.research<price)return previous;
  const p=structuredClone(previous);p.research-=price;p.spent+=price;p.upgrades[key]++;return p;
}
export function refundUpgrades(previous:Profile):Profile{const p=structuredClone(previous);p.research+=p.spent;p.spent=0;p.upgrades=emptyUpgrades();return p;}
export function loadProfile(value:unknown):Profile|null{
  if(!value||typeof value!=='object')return null;const p=structuredClone(value) as Profile;
  if(p.onboarded===undefined&&Array.isArray(p.collection)){p.collection=p.collection.filter(c=>!/^starter-(1|4|7)$/.test(c.id));p.discoveries=p.discoveries?.filter(id=>![1,4,7].includes(id)||p.collection.some(c=>c.speciesId===id));p.onboarded=p.collection.length>0;}
  const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
  if(p.version!==1||typeof p.onboarded!=='boolean'||![p.research,p.spent,p.runs,p.wins,p.bestDepth,p.maxChallenge].every(integer)||p.bestDepth>18||p.maxChallenge>PROGRESSION.maxChallenge||!p.upgrades||!p.ledger||typeof p.ledger!=='object'||Array.isArray(p.ledger)||!Array.isArray(p.collection)||p.onboarded&&p.collection.length===0||!Array.isArray(p.discoveries))return null;
  if(!(Object.keys(UPGRADE_DEFS) as UpgradeKey[]).every(k=>integer(p.upgrades[k])&&p.upgrades[k]<=UPGRADE_DEFS[k].max))return null;
  const expectedSpent=(Object.keys(UPGRADE_DEFS) as UpgradeKey[]).reduce((sum,k)=>sum+UPGRADE_DEFS[k].costs.slice(0,p.upgrades[k]).reduce((a,b)=>a+b,0),0);if(p.spent!==expectedSpent)return null;
  const ids=new Set<string>();
  for(const c of p.collection){if(!c||typeof c.id!=='string'||ids.has(c.id)||!dex.has(c.speciesId)||typeof c.shiny!=='boolean'||c.favorite!==undefined&&typeof c.favorite!=='boolean'||!c.ivs||!statKeys.every(k=>integer(c.ivs[k])&&c.ivs[k]<=31))return null;ids.add(c.id);}
  for(const entry of Object.values(p.ledger)){if(!entry||!integer(entry.rooms)||entry.rooms>18||!integer(entry.earned)||!Array.isArray(entry.bosses)||!entry.bosses.every(d=>[5,11,17].includes(d))||!Array.isArray(entry.captures)||!entry.captures.every(v=>typeof v==='string')||typeof entry.started!=='boolean'||typeof entry.finished!=='boolean')return null;}
  p.trailBadges??=[];if(!Array.isArray(p.trailBadges)||!p.trailBadges.every(b=>['new','careful','evolve'].includes(b))||new Set(p.trailBadges).size!==p.trailBadges.length)return null;
  p.releasedIds??=[];
  if(!Array.isArray(p.releasedIds)||!p.releasedIds.every(id=>typeof id==='string'&&id.length>0)||new Set(p.releasedIds).size!==p.releasedIds.length||p.collection.some(c=>p.releasedIds.includes(c.id)))return null;
  if(!p.discoveries.every(id=>dex.has(id)))return null;
  p.registeredSpecies??=[...new Set([...p.discoveries,...p.collection.map(c=>c.speciesId)])];
  if(!Array.isArray(p.registeredSpecies)||!p.registeredSpecies.every(id=>dex.has(id)))return null;
  p.seenSpecies??=[...p.discoveries];
  if(!Array.isArray(p.seenSpecies)||!p.seenSpecies.every(id=>dex.has(id)))return null;
  p.registeredSpecies=[...new Set([...p.registeredSpecies,...p.discoveries,...p.collection.map(c=>c.speciesId)])];
  p.seenSpecies=[...new Set([...p.seenSpecies,...p.discoveries,...p.registeredSpecies])];
  return structuredClone(p);
}

export function toggleFavorite(previous:Profile,id:string):Profile{
  if(!previous.collection.some(p=>p.id===id))return previous;
  const profile=structuredClone(previous),specimen=profile.collection.find(p=>p.id===id)!;specimen.favorite=!specimen.favorite;return profile;
}
export function releaseSpecimens(previous:Profile,ids:string[],lockedIds:readonly string[]=[]):Profile{
  if(!ids.length||new Set(ids).size!==ids.length)return previous;
  const selected=ids.map(id=>previous.collection.find(p=>p.id===id));
  if(selected.some(p=>!p||p.favorite||p.shiny||lockedIds.includes(p.id)))return previous;
  const remaining=previous.collection.filter(p=>!ids.includes(p.id));
  if(selected.some(p=>!remaining.some(keeper=>startingForm(keeper.speciesId)===startingForm(p!.speciesId))))return previous;
  const profile=structuredClone(previous);profile.collection=remaining.map(p=>structuredClone(p));profile.releasedIds=[...(profile.releasedIds??[]),...ids];profile.research+=ids.length*COLLECTION_POLICY.releaseResearch;return profile;
}
