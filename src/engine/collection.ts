import {BIOMES,DEX,SPECIES,TYPE_CHART,buildMoves,type GameState} from './game';
import {startingForm,type Profile,type Specimen} from './profile';
export const COLLECTION_MILESTONES=[{count:3,title:'Trail Scout',symbol:'✦'},{count:8,title:'Field Collector',symbol:'❖'},{count:16,title:'Wildlife Ranger',symbol:'✥'},{count:32,title:'Master Explorer',symbol:'✧'},{count:SPECIES.length,title:'Living Atlas',symbol:'✺'}] as const;
export const ivTotal=(p:Pick<Specimen,'ivs'>)=>Object.values(p.ivs).reduce((a,b)=>a+b,0);
export function ivQuality(p:Pick<Specimen,'ivs'>){const total=ivTotal(p);return {total,percent:Math.round(total/186*100),label:total>=149?'Exceptional':total>=121?'Strong':total>=93?'Promising':'Wild spirit',stars:total>=149?3:total>=121?2:total>=93?1:0};}
export function collectionProgress(profile:Profile){const owned=new Set([...(profile.registeredSpecies??[]),...profile.discoveries,...profile.collection.map(p=>p.speciesId)]),seen=new Set([...(profile.seenSpecies??[]),...owned]);return {owned,seen,next:COLLECTION_MILESTONES.find(m=>owned.size<m.count),badges:COLLECTION_MILESTONES.filter(m=>owned.size>=m.count),total:SPECIES.length};}
export function filterCollection(specimens:Specimen[],query:string,type:string,shiny:boolean,sort:string){return specimens.filter(p=>(!query.trim()||DEX[p.speciesId].name.includes(query.trim().toLowerCase())||DEX[startingForm(p.speciesId)].name.includes(query.trim().toLowerCase()))&&(type==='all'||DEX[startingForm(p.speciesId)].types.includes(type))&&(!shiny||p.shiny)).slice().sort((a,b)=>sort==='iv'?ivTotal(b)-ivTotal(a)||a.id.localeCompare(b.id):sort==='name'?DEX[startingForm(a.speciesId)].name.localeCompare(DEX[startingForm(b.speciesId)].name):0);}
export function teamCoverage(specimens:Specimen[]){const ids=specimens.map(p=>startingForm(p.speciesId)),moves=ids.flatMap(id=>buildMoves(id).filter(m=>m.power>0));const threats=Object.keys(TYPE_CHART);return {covered:threats.filter(type=>moves.some(m=>TYPE_CHART[m.type][type]>1)),sharedWeaknesses:ids.length?threats.filter(type=>ids.every(id=>DEX[id].types.reduce((mult,t)=>mult*TYPE_CHART[type][t],1)>1)):[],types:[...new Set(ids.flatMap(id=>DEX[id].types))]};}
export function habitat(id:number){return BIOMES.filter(b=>b.pool.includes(id)).map(b=>b.name);}
export function captureHighlights(specimen:Specimen,profile:Profile){const others=profile.collection.filter(p=>p.speciesId===specimen.speciesId&&p.id!==specimen.id);return {first:others.length===0,personalBest:others.length>0&&ivTotal(specimen)>Math.max(...others.map(ivTotal)),quality:ivQuality(specimen)};}

export const IV_KEYS=['hp','attack','defense','spAttack','spDefense','speed'] as const;
export function speciesGroups(specimens:Specimen[]){const groups=new Map<number,Specimen[]>();for(const p of specimens){const base=startingForm(p.speciesId);groups.set(base,[...(groups.get(base)??[]),p]);}return [...groups].map(([speciesId,members])=>({speciesId,members}));}
export const attackIvScore=(p:Specimen)=>Math.max(p.ivs.attack,p.ivs.spAttack)+p.ivs.speed;
export function specimenBadges(p:Specimen,siblings:Specimen[]){return {overall:siblings.length>1&&ivTotal(p)===Math.max(...siblings.map(ivTotal)),attacker:siblings.length>1&&attackIvScore(p)===Math.max(...siblings.map(attackIvScore))};}
export function lockedCollectionIds(profile:Profile,run:GameState,selectedIds:readonly string[]=[]){
  const locked=new Set(run.phase==='starter'?selectedIds:[]);
  if(!['starter','lost','won'].includes(run.phase))for(const p of [...run.party,...(run.pendingCapture?[run.pendingCapture]:[])]){
    if(p.sourceSpecimenId){locked.add(p.sourceSpecimenId);continue;}
    if(profile.collection.some(c=>c.id===p.uid)){locked.add(p.uid);continue;}
    // Older runs lack a source ID: conservatively protect matching legacy individuals.
    for(const c of profile.collection)if(startingForm(c.speciesId)===startingForm(p.speciesId)&&c.shiny===p.shiny&&IV_KEYS.every(k=>c.ivs[k]===p.ivs[k]))locked.add(c.id);
  }
  return [...locked];
}
export function suggestedReleases(specimens:Specimen[],lockedIds:readonly string[]=[]){
  const result:{id:string;keeperId:string}[]=[];
  for(const {members} of speciesGroups(specimens)){
    const protectedId=(p:Specimen)=>Boolean(p.shiny||p.favorite||lockedIds.includes(p.id));
    // Equivalent IVs retain the protected individual first, then the oldest catch.
    const outranks=(q:Specimen,p:Specimen)=>q.id!==p.id&&q.shiny===p.shiny&&IV_KEYS.every(k=>q.ivs[k]>=p.ivs[k])&&(IV_KEYS.some(k=>q.ivs[k]>p.ivs[k])||Number(protectedId(q))>Number(protectedId(p))||protectedId(q)===protectedId(p)&&members.indexOf(q)<members.indexOf(p));
    const keepers=members.filter(p=>protectedId(p)||!members.some(q=>outranks(q,p)));
    for(const p of members){if(protectedId(p))continue;const keeper=keepers.find(q=>outranks(q,p));if(keeper)result.push({id:p.id,keeperId:keeper.id});}
  }
  return result;
}
