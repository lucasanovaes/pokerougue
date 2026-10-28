import {BIOMES,ROUTE_SEQUENCE,createRoutePlan,fixedRooms,type RoutePlan} from './route';
export {BIOMES} from './route';
import {TRAIL_RULES,TRAIL_CHARMS,HUNTS,isTrailCharm,trailTechnique,applyTrailTechnique,trailIntent,trailLength,type TrailState,type Hunt,type TrailStyle} from './trail';
import rawPokemon from '../data/pokemon.json';
import rawTypes from '../data/types.json';
import { DEFAULT_BALANCE, PARTY_SIZE, RUN_LENGTH, SAVE_VERSION, PROGRESSION, BASE_FORMS, EVOLUTIONS, FIRST_PARTNERS, TEAM_PROGRESSION, type TeamRule, type Balance } from './config';

import {emptyUpgrades,validTeam,startingForm,type Upgrades,type Profile} from './profile';

export type Stats = {hp:number; attack:number; defense:number; spAttack:number; spDefense:number; speed:number};
export type StatKey = keyof Stats;
export type Species = {id:number; name:string; types:string[]; baseStats:Stats; captureRate:number};
export const SPECIES = rawPokemon as Species[];
export const DEX = Object.fromEntries(SPECIES.map(p => [p.id,p])) as Record<number, Species>;
export const TYPE_CHART = rawTypes as Record<string,Record<string,number>>;
export type Status = 'none'|'sleep'|'paralysis'|'poison'|'burn';
export type Move = {name:string;type:string;power:number;category:'physical'|'special'|'status';pp:number;maxPP:number;accuracy:number;priority:number;effect?:Status|'weaken'|'guard'};
export type BattleVisualEvent={actor:'player'|'enemy';actorId:string;targetId:string;move:Pick<Move,'name'|'type'|'category'|'effect'>;result:'damage'|'status'|'miss'|'immune'|'blocked';damage:number;targetHp:number;actorHp:number;targetStatus:Status;critical:boolean};
export type BattleObserver=(event:BattleVisualEvent)=>void;
export type Pokemon = {uid:string;guard?:number;sourceSpecimenId?:string;trainerHpBonus?:number;speciesId:number;level:number;xp:number;ivs:Stats;stats:Stats;hp:number;shiny:boolean;shinyBoost:number;status:Status;sleepTurns:number;attackStage:number;moves:Move[]};
export type RoomKind = 'wild'|'elite'|'treasure'|'camp'|'shop'|'event'|'boss';
export type Room = {id:string;kind:RoomKind;label:string;hint:string;lane:number};
export type Relic = 'grounding'|'fang'|'lens'|'vitality'|import('./trail').TrailCharm;
export const RELICS:Record<Relic,{name:string;description:string;icon:string}> = {...TRAIL_CHARMS,
  grounding:{name:'Grounding Charm',description:'Reduces the extra damage from every type weakness by 30%.',icon:'shield'},
  fang:{name:'Amber Fang',description:'Your team deals 15% more damage.',icon:'zap'},
  lens:{name:'Prismatic Lens',description:'Capture chances are 25% higher.',icon:'sparkles'},
  vitality:{name:'Verdant Seed',description:'Living Pokémon recover 12% max HP after each battle.',icon:'leaf'},
};
export type Direction = 'left'|'right';
export type Phase = 'starter'|'map'|'discovery'|'battle'|'reward'|'camp'|'shop'|'event'|'replace'|'won'|'lost';
export type GameState = {
  version:number;routePlan?:RoutePlan;trail?:TrailState;teamRule?:TeamRule;startingTeamSize?:number;enemyTeam?:Pokemon[];bossTeamTotal?:number;bossTeamDefeated?:number;runId?:string;rulesVersion?:number;difficulty?:number;upgradeSnapshot?:Upgrades;caughtPokemon?:Pokemon[];defeatedBosses?:number[];seed:string;rng:number;config:Balance;phase:Phase;depth:number;party:Pokemon[];active:number;
  enemy:Pokemon|null;room:Room|null;map:Room[][];visited:string[];gold:number;bag:{balls:number;greatBalls:number;potions:number;berries:number;revives:number};
  relics:Relic[];log:string[];rewardOptions:string[];pendingCapture:Pokemon|null;captures:number;seen:number[];shinySeen:number;turn:number;forceShiny:boolean;pathDirection?:Direction;
};
export const biome = (s:GameState) => BIOMES[Math.min(2,Math.floor(s.depth/6))];
export const titleCase = (s:string) => s.replace(/(^|[ -])\w/g, c=>c.toUpperCase());
export const nameOf = (p:Pokemon) => titleCase(DEX[p.speciesId].name);
export const sprite = (p:Pick<Pokemon,'speciesId'|'shiny'>,back=false) => `/assets/pokemon/${back?'back/':''}${p.shiny?'shiny/':''}${p.speciesId}.png`;

function hash(seed:string):number {let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0 || 1;}
export function random(s:GameState):number {s.rng=(s.rng+0x6D2B79F5)>>>0;let t=s.rng;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
const pick = <T,>(s:GameState,items:T[]):T => items[Math.floor(random(s)*items.length)];
function note(s:GameState,message:string){s.log=[...s.log,message].slice(-60);}
const moveNames:Record<string,[string,string]>={normal:['Headbutt','Body Slam'],fire:['Ember','Flame Burst'],water:['Water Gun','Water Pulse'],grass:['Vine Whip','Razor Leaf'],electric:['Thunder Shock','Thunderbolt'],ice:['Powder Snow','Ice Beam'],fighting:['Karate Chop','Brick Break'],poison:['Acid','Sludge Bomb'],ground:['Mud Shot','Dig'],flying:['Gust','Air Slash'],psychic:['Confusion','Psybeam'],bug:['Bug Bite','Signal Beam'],rock:['Rock Throw','Rock Slide'],ghost:['Lick','Shadow Ball'],dragon:['Dragon Breath','Dragon Pulse'],dark:['Bite','Dark Pulse'],steel:['Metal Claw','Flash Cannon'],fairy:['Fairy Wind','Dazzling Gleam']};
const specialMoves = new Set(['Ember','Flame Burst','Water Gun','Water Pulse','Thunder Shock','Thunderbolt','Powder Snow','Ice Beam','Acid','Sludge Bomb','Mud Shot','Gust','Air Slash','Confusion','Psybeam','Signal Beam','Shadow Ball','Dragon Breath','Dragon Pulse','Dark Pulse','Flash Cannon','Fairy Wind','Dazzling Gleam']);
export function buildMoves(id:number):Move[]{
  const types=DEX[id].types, primary=types[0], secondary=types[1]??primary;
  const create=(name:string,type:string,power:number,pp:number,accuracy=100,priority=0):Move=>({name,type,power,pp,maxPP:pp,accuracy,priority,category:specialMoves.has(name)?'special':'physical'});
  let status:Move={...create('Growl','normal',0,20),category:'status',effect:'weaken'};
  if(types.includes('grass')||types.includes('bug'))status={...status,name:'Sleep Powder',type:'grass',accuracy:75,effect:'sleep'};
  if(types.includes('electric'))status={...status,name:'Thunder Wave',type:'electric',accuracy:90,effect:'paralysis'};
  if(types.includes('poison')&&!types.includes('grass'))status={...status,name:'Poison Powder',type:'poison',accuracy:85,effect:'poison'};
  if(types.includes('fire'))status={...status,name:'Will-O-Wisp',type:'fire',accuracy:85,effect:'burn'};
  return [create('Quick Attack','normal',35,25,100,1),create(moveNames[primary][0],primary,45,25),status,create(moveNames[secondary][1],secondary,65,10,90)].map(m=>{
    m={...m,power:Math.round(m.power*(PROGRESSION.speciesMovePower[id]??1))};
    if(m.power&&m.category==='special'&&DEX[id].baseStats.attack>DEX[id].baseStats.spAttack){const physical:Record<string,[string,string]>={poison:['Poison Sting','Poison Jab'],flying:['Peck','Wing Attack'],water:['Waterfall','Aqua Tail']};if(physical[m.type])return {...m,name:physical[m.type][m.power<=45?0:1],category:'physical' as const};}return m;
  });
}
export function calculateStats(id:number,level:number,ivs:Stats,boost=1,hpBonus=0):Stats{
  const base=DEX[id].baseStats;return Object.fromEntries((Object.keys(base) as StatKey[]).map(k=>{const value=(Math.floor((2*base[k]+ivs[k])*level/100)+(k==='hp'?level+10:5))*boost;return [k,Math.max(1,k==='hp'&&hpBonus>0?Math.ceil(Math.floor(value)*(1+hpBonus)):Math.floor(value))];})) as Stats;
}
export function createPokemon(s:GameState,id:number,level:number,starter=false):Pokemon{
  const ivs=Object.fromEntries(['hp','attack','defense','spAttack','spDefense','speed'].map(k=>[k,starter?18:Math.floor(random(s)*32)])) as Stats;
  const shiny=!starter&&(s.config.allShiny||s.forceShiny||random(s)<s.config.shinyChance);if(shiny&&s.forceShiny)s.forceShiny=false;
  const shinyBoost=shiny?s.config.shinyStatMultiplier:1;
  const stats=calculateStats(id,level,ivs,shinyBoost);
  return {uid:`${s.runId??s.seed}-${s.depth}-${Math.floor(random(s)*1e9)}`,speciesId:id,level,xp:0,ivs,stats,hp:stats.hp,shiny,shinyBoost,status:'none',sleepTurns:0,attackStage:0,moves:buildMoves(id)};
}
function buildMap(s:GameState):Room[][]{
  const labels:Record<RoomKind,[string,string]>={wild:['Wild encounter','A new companion, perhaps.'],elite:['Elite encounter','A tough battle. A rare reward.'],treasure:['Forgotten cache','Take one of three field supplies.'],camp:['Quiet clearing','Rest, recover, and regroup.'],shop:['Wandering merchant','Trade a little gold for peace of mind.'],event:['Something curious','The wilds have a story to tell.'],boss:['Biome guardian','Prove your team is ready.']};
  return Array.from({length:RUN_LENGTH},(_,i)=>{
    const rooms=Array.from({length:i%6===5?1:2},(_,lane)=>{
    const step=i%6;
    let kind:RoomKind=step===5?'boss':step===4?'camp':i<2?'wild':step===0?(lane===0?'wild':'shop'):step===1?(lane===0?'wild':'event'):step===2?(i<6?(lane===0?'treasure':'event'):(lane===0?'elite':'treasure')):(lane===0?'wild':'event');
    return {id:`${i}-${lane}`,kind,label:labels[kind][0],hint:labels[kind][1],lane};
    });
    // Neither direction consistently means safety, supplies, or danger.
    if(rooms.length===2&&random(s)<.5)rooms.reverse();
    return rooms;
  });
}
export function newGame(config:Balance={...DEFAULT_BALANCE},seed=`${Date.now().toString(36).toUpperCase()}`,options:{navigation?:'fixed'|'legacy';runId?:string;upgrades?:Upgrades;difficulty?:number;teamRule?:TeamRule}={}):GameState{
  const requested=options.upgrades??emptyUpgrades(),safeUpgrades=emptyUpgrades();for(const key of ['potions','balls','hp'] as const)safeUpgrades[key]=Number.isFinite(requested[key])?Math.max(0,Math.min(key==='hp'?2:1,Math.floor(requested[key]))):0;
  const state:GameState={version:SAVE_VERSION,teamRule:options.teamRule==='budget'?'budget':'open',startingTeamSize:0,enemyTeam:[],bossTeamTotal:0,bossTeamDefeated:0,runId:`run:${options.runId??seed}`,rulesVersion:2,difficulty:Math.max(0,Math.min(PROGRESSION.maxChallenge,Math.floor(options.difficulty??0))),upgradeSnapshot:safeUpgrades,caughtPokemon:[],defeatedBosses:[],seed,rng:hash(seed),config:{...config},phase:'starter',depth:0,party:[],active:0,enemy:null,room:null,map:[],visited:[],gold:45,bag:{balls:10,greatBalls:2,potions:4,berries:2,revives:1},relics:[],log:['Your field journal is waiting for its first story.'],rewardOptions:[],pendingCapture:null,captures:0,seen:[],shinySeen:0,turn:0,forceShiny:false};
  state.bag.potions+=state.upgradeSnapshot!.potions;state.bag.balls+=state.upgradeSnapshot!.balls*3;state.map=buildMap(state);if(options.navigation!=='legacy')enableFixedRoute(state);return state;
}

export function enableFixedRoute(s:GameState){if(s.phase!=='starter'||s.routePlan)return false;s.routePlan=createRoutePlan(s.seed,Boolean(s.trail));s.map=fixedRooms();return true;}
export function advanceRoute(s:GameState){if(s.phase==='map')choosePath(s,'right');}

export function configureTrail(s:GameState,hunt:Hunt,style:TrailStyle,knownSpecies:number[]){
  if(hunt==='new'&&(s.routePlan?![0,1,3].some(depth=>!knownSpecies.includes(createRoutePlan(s.seed,true).encounters[depth])):TRAIL_RULES.pool.every(id=>knownSpecies.includes(id))))return false;
  if(s.phase!=='starter'||!Object.hasOwn(HUNTS,hunt)||!['venom','relay'].includes(style)||s.trail)return false;
  s.trail={version:1,style,hunt,knownSpecies:[...new Set(knownSpecies.filter(id=>DEX[id]))],completed:false,scoutedDepths:[],technique:style==='venom'?'venom':'brace',lessonLearned:false,relayUsed:false,rushUid:null,stats:{poisonHeals:0,guardedHits:0,switches:0}};
  s.relics.push(style==='venom'?'venomheart':'relayguard');
  if(s.routePlan)s.routePlan=createRoutePlan(s.seed,true);
  // Both lanes keep their identities; seed-only shuffling is separate from combat and scouting.
  if(!s.routePlan)for(let depth=0;depth<6;depth++)for(const room of s.map[depth]){if(depth===2){room.kind=room.lane===0?'treasure':'wild';room.label=room.kind==='treasure'?'Trail cache':'Wild encounter';}if(depth===3){room.kind=room.lane===0?'wild':'event';room.label=room.kind==='wild'?'Wild encounter':'Forest shrine';}}
  return true;
}
export function scoutTrail(s:GameState){if(s.routePlan||s.phase!=='map'||!s.trail||s.depth<TRAIL_RULES.scoutFromDepth||s.depth===TRAIL_RULES.rooms-1||s.trail.scoutedDepths.length>=TRAIL_RULES.scouts||s.trail.scoutedDepths.includes(s.depth))return false;s.trail.scoutedDepths.push(s.depth);return true;}
export function scoutClues(s:GameState){if(s.phase!=='map'||!s.trail?.scoutedDepths.includes(s.depth))return null;return ['left','right'].map(direction=>{const row=s.map[s.depth],room=row[direction==='right'?0:1]??row[0];return {direction:direction as Direction,clue:['wild','elite','boss'].includes(room.kind)?'Rustling & tracks':'A quiet glow'};});}
export function learnTrailTechnique(s:GameState,technique:'venom'|'brace'){if(s.phase!=='camp'||!s.trail||s.trail.lessonLearned||!['venom','brace'].includes(technique))return false;s.trail.technique=technique;s.trail.lessonLearned=true;s.party.forEach(p=>applyTrailTechnique(s,p));note(s,`The team learned ${trailTechnique(technique).name}.`);return true;}
function completeHunt(s:GameState,event:'evolve'|'catch',foe?:Pokemon){const t=s.trail;if(!t||t.completed||t.hunt==='none')return;const done=event==='evolve'&&t.hunt==='evolve'||event==='catch'&&foe&&(t.hunt==='new'&&!t.knownSpecies.includes(foe.speciesId)||t.hunt==='careful'&&foe.status!=='none');if(done){t.completed=true;note(s,`Request complete: ${HUNTS[t.hunt].name}! Field badge earned.`);}}

export function startRun(s:GameState,id:number){if(s.phase!=='starter'||!FIRST_PARTNERS.includes(id as typeof FIRST_PARTNERS[number]))return;s.party=[createPokemon(s,id,PROGRESSION.starterLevel,true)];applyTrainerHp(s,s.party[0]);applyTrailTechnique(s,s.party[0]);s.startingTeamSize=1;s.phase='map';note(s,`${nameOf(s.party[0])} joined you. Choose your first path.`);}
export function startCollectedTeam(s:GameState,profile:Profile,ids:string[]){
  if(s.phase!=='starter'||!validTeam(profile,ids,s.teamRule??'open'))return false;
  s.party=ids.map(id=>{const c=profile.collection.find(p=>p.id===id)!;const p=createPokemon(s,startingForm(c.speciesId),PROGRESSION.starterLevel,true);p.sourceSpecimenId=c.id;p.ivs={...c.ivs};p.shiny=c.shiny;p.shinyBoost=p.shiny?s.config.shinyStatMultiplier:1;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost,p.trainerHpBonus);p.hp=p.stats.hp;applyTrainerHp(s,p);applyTrailTechnique(s,p);return p;});
  s.startingTeamSize=s.party.length;s.active=0;s.phase='map';note(s,'Your team is ready.');return true;
}
function applyTrainerHp(s:GameState,p:Pokemon){const ratio=p.hp/p.stats.hp;p.trainerHpBonus=Math.min(.1,Math.max(0,(s.upgradeSnapshot?.hp??0)*.05));p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost,p.trainerHpBonus);p.hp=Math.max(1,Math.ceil(p.stats.hp*ratio));}
export function evolutionHint(p:Pick<Pokemon,'speciesId'|'level'>){const rule=EVOLUTIONS[p.speciesId];return rule?(p.level>=rule[0]?'Evolution ready · next XP reward or camp training':`Evolves at level ${rule[0]}`):null;}
function evolve(s:GameState,p:Pokemon){const visited=new Set<number>();while(!visited.has(p.speciesId)){visited.add(p.speciesId);const target=EVOLUTIONS[p.speciesId];if(!target||p.level<target[0])break;const before=nameOf(p),hp=p.stats.hp;p.speciesId=target[1];p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost,p.trainerHpBonus);p.hp=Math.max(1,Math.min(p.stats.hp,p.hp+p.stats.hp-hp));p.moves=buildMoves(p.speciesId);applyTrailTechnique(s,p);completeHunt(s,'evolve');note(s,`${before} evolved into ${nameOf(p)}!`);}}
function grantXp(s:GameState,p:Pokemon,amount:number){if(p.hp<=0)return;p.xp+=amount;while(p.xp>=p.level*12&&p.level<50){p.xp-=p.level*12;p.level++;const hp=p.stats.hp;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost,p.trainerHpBonus);p.hp=Math.min(p.stats.hp,p.hp+p.stats.hp-hp);note(s,`${nameOf(p)} grew to level ${p.level}!`);evolve(s,p);}evolve(s,p);}

export function effectiveness(moveType:string,defender:Pokemon):number{return DEX[defender.speciesId].types.reduce((m,t)=>m*(TYPE_CHART[moveType]?.[t]??1),1);}
export function adjustedEffectiveness(s:GameState,m:number,isPlayerDefender:boolean):number{return m>1&&isPlayerDefender&&s.relics.includes('grounding')?1+(m-1)*(1-s.config.weaknessReduction):m;}
export function captureChance(s:GameState,great=false):number{
  const p=s.enemy;if(!p||s.room?.kind==='boss'||s.room?.kind==='elite'||p.hp<=0)return 0;
  const status=p.status==='sleep'?2:p.status!=='none'?1.5:1;
  return Math.max(.01,Math.min(.95,DEX[p.speciesId].captureRate/255*((3*p.stats.hp-2*p.hp)/(3*p.stats.hp))*(great?1.5:1)*status*s.config.captureMultiplier*(s.relics.includes('lens')?1.25:1)*(s.relics.includes('venomlens')&&p.status==='poison'?TRAIL_RULES.poisonCapture:1)));
}
function refresh(p:Pokemon,full=false){p.status='none';p.sleepTurns=0;p.attackStage=0;if(full)p.hp=p.stats.hp;p.moves.forEach(m=>m.pp=m.maxPP);}
function completeRoom(s:GameState){
  s.party.forEach(p=>grantXp(s,p,Math.round((s.trail?TRAIL_RULES.roomExperience:PROGRESSION.roomExperience)*s.config.experienceMultiplier)));
  s.enemy=null;s.enemyTeam=[];s.bossTeamTotal=0;s.bossTeamDefeated=0;s.pendingCapture=null;s.party.forEach(p=>p.attackStage=0);s.depth++;
  if(s.party[s.active]?.hp===0)s.active=Math.max(0,s.party.findIndex(p=>p.hp>0));
  if(s.depth>=trailLength(s)){s.phase='won';note(s,'The expedition is complete. Every path led you here.');return;}
  s.phase='map';s.room=null;
}
export function enterRoom(s:GameState,id:string){
  if(s.phase!=='map')return;const room=s.map[s.depth]?.find(r=>r.id===id);if(!room)return;
  s.enemyTeam=[];s.bossTeamTotal=0;s.bossTeamDefeated=0;
  if(s.trail){s.trail.relayUsed=false;s.trail.rushUid=null;}if(s.trail)s.party.forEach(p=>p.guard=0);
  s.room=room;s.visited.push(id);s.turn=0;s.rng=(s.rng^hash(`${s.seed}:${room.id}`))>>>0;
  if(['wild','elite','boss'].includes(room.kind)){
    const act=Math.min(2,Math.floor(s.depth/6)),b=biome(s),size=Math.max(1,s.startingTeamSize??1),lineupBonus=room.kind==='boss'?Math.min(TEAM_PROGRESSION.maxBossLevelBonus,Math.floor((size-1)/3)*TEAM_PROGRESSION.bossLevelPerExtraThree):Math.min(TEAM_PROGRESSION.maxWildLevelBonus,Math.floor((size-1)/2)*TEAM_PROGRESSION.wildLevelPerExtraPair),level=Math.max(2,Math.round(((room.kind==='boss'?PROGRESSION.bossLevels[act]:3+s.depth*.8+(room.kind==='elite'?1:0))+(s.difficulty??0)+lineupBonus)*s.config.enemyStrength));
    // The shiny test flag is reserved for catchable wild encounters.
    const force=s.forceShiny;if(room.kind!=='wild')s.forceShiny=false;
    const generatedLevel=s.trail?Math.max(2,Math.round((TRAIL_RULES.wildLevels[s.depth]+lineupBonus+(s.difficulty??0))*s.config.enemyStrength)):level;
    s.enemy=createPokemon(s,s.routePlan?.encounters[s.depth]||(room.kind==='boss'?b.boss:pick(s,s.trail?[...TRAIL_RULES.pool]:b.pool)),generatedLevel);
    if(s.depth<2)s.enemy.moves.forEach(m=>m.power=Math.min(PROGRESSION.earlyMovePower,m.power));
    if(room.kind==='boss'){
      const count=1+TEAM_PROGRESSION.bossTeamThresholds.filter(threshold=>size>=threshold).length;
      const guardian=s.enemy;guardian.stats.hp=Math.floor(guardian.stats.hp*(s.trail?(count>1?2.5:TRAIL_RULES.guardianHp):(count>1?TEAM_PROGRESSION.multiBossHp[act]:PROGRESSION.bossHp[act])));guardian.hp=guardian.stats.hp;guardian.moves.forEach(m=>m.power=Math.min(PROGRESSION.bossPower[act],m.power));
      if(act===0)guardian.moves=[{name:'Swift',type:'normal'},{name:'Magical Leaf',type:'grass'},{name:'Air Cutter',type:'flying'},{name:'Shock Wave',type:'electric'}].map(m=>({...m,power:50,category:'special' as const,pp:20,maxPP:20,accuracy:100,priority:0}));
      const supports=TEAM_PROGRESSION.supports[act].slice(0,count-1).map(id=>{const p=createPokemon(s,id,Math.max(2,(s.trail?s.enemy!.level:level)-TEAM_PROGRESSION.supportLevelLag));p.stats.hp=Math.max(1,Math.floor(p.stats.hp*TEAM_PROGRESSION.supportHp));p.hp=p.stats.hp;p.moves.forEach(m=>m.power=Math.min(PROGRESSION.bossPower[act],m.power));return p;});
      const lineup=[...supports,guardian];s.enemy=lineup.shift()!;s.enemyTeam=lineup;s.bossTeamTotal=count;
    }
    if(room.kind!=='wild')s.forceShiny=force;
    s.active=s.party[s.active]?.hp>0?s.active:s.party.findIndex(p=>p.hp>0);
    s.seen=[...new Set([...s.seen,s.enemy.speciesId])];if(s.enemy.shiny)s.shinySeen++;
    s.phase='battle';note(s,room.kind==='boss'?`The guardian sends out ${s.enemy.shiny?'a shiny ':''}${nameOf(s.enemy)}!`:`${s.enemy.shiny?'✦ A rare shiny':'A wild'} ${nameOf(s.enemy)} appeared!`);
  }else if(room.kind==='treasure'){
    s.phase='reward';s.rewardOptions=pickRewards(s);note(s,'A weathered supply cache. Choose something for the road.');
  }else s.phase=room.kind as Phase;
}
// The public exploration choice exposes direction only. Commit before revealing the outcome.
export function choosePath(s:GameState,direction:Direction){
  if(s.phase!=='map'||!['left','right'].includes(direction))return;
  const row=s.map[s.depth];const room=row?.[direction==='right'?0:1]??row?.[0];
  if(!room)return;
  s.room=room;s.pathDirection=direction;s.phase='discovery';
  note(s,s.routePlan?`Stop ${s.depth+1}: ${room.label}.`:`You followed Path ${direction==='right'?'A':'B'}. ${room.label} discovered.`);
}
export function resolveDiscovery(s:GameState){
  if(s.phase!=='discovery'||!s.room)return;
  const id=s.room.id;s.phase='map';enterRoom(s,id);
}
export function pickRewards(s:GameState):string[]{const available=(Object.keys(RELICS) as Relic[]).filter(r=>!s.relics.includes(r)&&(s.trail?isTrailCharm(r):!isTrailCharm(r)));if(s.routePlan){if(!available.length)return ['medicine','supplies'];if(s.trail){const preferred=available.filter(r=>r.startsWith(s.trail!.style==='venom'?'venom':'relay'));const ordered=[...preferred,...available.filter(r=>!preferred.includes(r))];return [...ordered.slice(0,2),...(ordered.length<2?['supplies']:[]),'medicine'];}return ['medicine','supplies',pick(s,available)];}if(s.trail){const preferred=available.filter(r=>r.startsWith(s.trail!.style==='venom'?'venom':'relay'));const rest=available.filter(r=>!preferred.includes(r));return [...[...preferred,...rest].slice(0,3),'supplies','medicine','gold'].slice(0,3);}return ['supplies','medicine',available.length?pick(s,available):'gold'];}
function winBattle(s:GameState,caught=false){
  const foe=s.enemy!,moreGuardians=s.room?.kind==='boss'&&Boolean(s.enemyTeam?.length);
  const xp=Math.round(foe.level*22*s.config.experienceMultiplier*(s.trail?TRAIL_RULES.experience:1)*(s.room?.kind==='boss'?TEAM_PROGRESSION.bossExperience/Math.max(1,s.bossTeamTotal??1):1));
  s.party.forEach((p,i)=>{grantXp(s,p,Math.round(xp*(i===s.active?1:.7)));if(p.hp>0&&s.relics.includes('vitality'))p.hp=Math.min(p.stats.hp,p.hp+Math.ceil(p.stats.hp*.12));});
  if(s.room?.kind==='boss')s.bossTeamDefeated=(s.bossTeamDefeated??0)+1;
  if(moreGuardians){
    s.enemy=s.enemyTeam!.shift()!;s.seen=[...new Set([...s.seen,s.enemy.speciesId])];if(s.enemy.shiny)s.shinySeen++;
    note(s,`${nameOf(foe)} was defeated. The guardian team sends out ${nameOf(s.enemy)}!`);return;
  }
  s.gold+=s.room?.kind==='boss'?60:s.room?.kind==='elite'?35:15;
  if(s.room?.kind==='boss'){s.defeatedBosses??=[];if(!s.defeatedBosses.includes(s.depth))s.defeatedBosses.push(s.depth);s.party.forEach(p=>refresh(p,true));note(s,'Guardian cleared. The team is fully restored.');}
  note(s,caught?`${nameOf(foe)} was caught! +${xp} field experience.`:`${nameOf(foe)} was defeated. +${xp} experience.`);
  if(caught){
    completeHunt(s,'catch',foe);applyTrailTechnique(s,foe);foe.attackStage=0;s.captures++;
    foe.level=Math.max(foe.level,Math.max(1,s.party[s.active].level-PROGRESSION.catchLevelLag));
    foe.stats=calculateStats(foe.speciesId,foe.level,foe.ivs,foe.shinyBoost);foe.hp=Math.max(1,Math.ceil(foe.stats.hp*PROGRESSION.catchHpFloor));foe.status='none';foe.sleepTurns=0;foe.moves.forEach(m=>m.pp=m.maxPP);applyTrainerHp(s,foe);
    s.caughtPokemon??=[];s.caughtPokemon.push(structuredClone(foe));
    if(s.party.length>=PARTY_SIZE){s.pendingCapture=foe;s.phase='replace';return;}
    s.party.push(foe);
  }
  s.phase='reward';s.rewardOptions=s.routePlan||s.trail||s.room?.kind==='elite'||s.room?.kind==='boss'?pickRewards(s):['supplies','medicine','gold'];
}
function attack(s:GameState,attacker:Pokemon,defender:Pokemon,move:Move,player:boolean,emit?:BattleObserver){
  const visual=(result:BattleVisualEvent['result'],damage=0,critical=false)=>{emit?.({actor:player?'player':'enemy',actorId:attacker.uid,targetId:(move.effect==='guard'?attacker:defender).uid,move:{name:move.name,type:move.type,category:move.category,effect:move.effect},result,damage,targetHp:(move.effect==='guard'?attacker:defender).hp,actorHp:attacker.hp,targetStatus:(move.effect==='guard'?attacker:defender).status,critical});};
  if(attacker.hp<=0||defender.hp<=0)return;
  if(attacker.status==='sleep') {if(attacker.sleepTurns>0){attacker.sleepTurns--;note(s,`${nameOf(attacker)} is fast asleep.`);visual('blocked');return;}attacker.status='none';note(s,`${nameOf(attacker)} woke up!`);}
  if(attacker.status==='paralysis'&&random(s)<.25){note(s,`${nameOf(attacker)} is fully paralyzed.`);visual('blocked');return;}
  if(move.pp<=0)return;move.pp--;
  note(s,`${nameOf(attacker)} used ${move.name}.`);
  if(random(s)*100>=move.accuracy){note(s,'The move missed!');visual('miss');return;}
  const mult=move.name==='Struggle'?1:effectiveness(move.type,defender);
  if(mult===0&&(move.category!=='status'||move.effect==='paralysis')){note(s,`${nameOf(defender)} is immune.`);visual('immune');return;}
  if(move.category==='status'){
    if(move.effect==='guard'){attacker.guard=TRAIL_RULES.braceGuard;note(s,`${nameOf(attacker)} braced for the next hit.`);visual('status');return;}
    if(move.effect==='weaken'){defender.attackStage=Math.max(-6,defender.attackStage-1);note(s,`${nameOf(defender)}'s Attack fell.`);visual('status');return;}
    const types=DEX[defender.speciesId].types;
    if(defender.status!=='none'||(move.effect==='poison'&&(types.includes('poison')||types.includes('steel')))||(move.effect==='burn'&&types.includes('fire'))||(move.effect==='paralysis'&&types.includes('electric'))||(move.effect==='sleep'&&types.includes('grass'))){note(s,'It had no effect.');visual('immune');return;}
    defender.status=move.effect as Status;defender.sleepTurns=2;note(s,`${nameOf(defender)} now has ${defender.status}.`);visual('status');return;
  }
  let atk=move.category==='physical'?attacker.stats.attack:attacker.stats.spAttack;
  const def=move.category==='physical'?defender.stats.defense:defender.stats.spDefense;
  if(move.category==='physical'){atk*=attacker.attackStage>=0?(2+attacker.attackStage)/2:2/(2-attacker.attackStage);if(attacker.status==='burn')atk*=.5;}
  const stab=DEX[attacker.speciesId].types.includes(move.type)?1.5:1;
  const critRoll=random(s)<1/16;const critical=critRoll&&(player||!(s.depth<2||s.depth===5&&s.room?.kind==='boss'));
  let damage=Math.max(1,Math.floor((((2*attacker.level/5+2)*move.power*atk/def)/50+2)*stab*adjustedEffectiveness(s,mult,!player)*(.85+random(s)*.15)*(critical?1.5:1)*(player&&s.relics.includes('fang')?1.15:1)));
  // The opening guardian teaches multi-turn play without a surprise one-shot.
  if(!player&&s.depth===5&&s.room?.kind==='boss')damage=Math.min(damage,Math.max(1,Math.ceil(defender.stats.hp*PROGRESSION.firstBossHitCap)));
  if(!player&&s.routePlan&&s.depth<2)damage=Math.max(1,Math.floor(damage*PROGRESSION.fixedOpeningDamageMultiplier));
  if(!player&&s.depth<2)damage=Math.min(damage,Math.max(1,Math.ceil(defender.stats.hp*(s.routePlan?PROGRESSION.fixedOpeningHitCap:PROGRESSION.earlyHitCap))));
  if(player&&s.relics.includes('venomfang')&&defender.status==='poison')damage=Math.ceil(damage*TRAIL_RULES.poisonDamage);
  if(player&&s.trail?.rushUid===attacker.uid){damage=Math.ceil(damage*TRAIL_RULES.switchDamage);s.trail.rushUid=null;note(s,'Baton Spark powered the attack!');}
  if(defender.guard){damage=Math.max(1,Math.floor(damage*(1-defender.guard)));defender.guard=0;if(s.trail&&!player)s.trail.stats.guardedHits++;note(s,'The guard softened the hit.');}
  const actualDamage=Math.min(defender.hp,damage);
  defender.hp=Math.max(0,defender.hp-damage);
  note(s,`${damage} damage.${mult>1?' Super effective!':mult<1?' Not very effective.':''}${critical?' Critical hit!':''}`);
  if(move.name==='Struggle'){attacker.hp=Math.max(0,attacker.hp-Math.max(1,Math.floor(attacker.stats.hp/4)));note(s,`${nameOf(attacker)} took recoil damage.`);}
  visual('damage',actualDamage,critical);
  if(!defender.hp)note(s,`${nameOf(defender)} fainted.`);
}
const speed=(p:Pokemon)=>p.stats.speed*(p.status==='paralysis'?.5:1);
const struggle=():Move=>({name:'Struggle',type:'normal',power:50,category:'physical',pp:999,maxPP:999,accuracy:100,priority:0});
function enemyMove(s:GameState):Move{
  const intent=trailIntent(s);if(intent)return intent.move;
  const moves=s.enemy!.moves.filter(m=>m.pp>0);if(!moves.length)return struggle();
  if(s.room?.kind==='boss'||s.room?.kind==='elite'){
    const target=s.party[s.active];const ranked=moves.map(m=>({m,score:m.power*effectiveness(m.type,target)+(m.category==='status'&&target.status==='none'?30:0)+random(s)*20})).sort((a,b)=>b.score-a.score);return ranked[0].m;
  }return pick(s,moves);
}
function endTurn(s:GameState){
  for(const p of [s.party[s.active],s.enemy]){
    if(!p||p.hp<=0)continue;
    if(p.status==='poison'||p.status==='burn'){const damage=Math.max(1,Math.floor(p.stats.hp/(p.status==='poison'?8:16)));const actual=Math.min(p.hp,damage);p.hp=Math.max(0,p.hp-damage);note(s,`${nameOf(p)} took ${damage} ${p.status} damage.`);if(s.trail&&p===s.enemy&&p.status==='poison'&&s.relics.includes('venomheart')){const lead=s.party[s.active];if(lead.hp>0){const heal=Math.min(actual,TRAIL_RULES.poisonHeal,lead.stats.hp-lead.hp);lead.hp+=heal;s.trail.stats.poisonHeals+=heal;if(heal)note(s,`Venom Heart restored ${heal} HP.`);}}}
  }
  if(s.trail){s.party.forEach(p=>p.guard=0);if(s.enemy)s.enemy.guard=0;}
  const active=s.party[s.active];if(active.hp>0&&active.hp<=active.stats.hp*.25&&s.bag.berries>0){s.bag.berries--;active.hp=Math.min(active.stats.hp,active.hp+Math.ceil(active.stats.hp*.3));note(s,`${nameOf(active)} ate an emergency berry.`);}
  // A simultaneous knockout ends the run if no party member survives.
  if(!s.party.some(p=>p.hp>0)){s.phase='lost';note(s,'Your team needs to rest. The expedition ends here.');return;}
  if(s.enemy&&s.enemy.hp<=0){winBattle(s);return;}
  if(active.hp<=0)note(s,'Choose a living teammate to continue. This replacement is free.');
}
export type BattleAction={kind:'move';index:number}|{kind:'switch';index:number}|{kind:'ball';great:boolean}|{kind:'potion'}|{kind:'flee'};
export function battleAction(s:GameState,action:BattleAction,emit?:BattleObserver){
  if(s.phase!=='battle'||!s.enemy)return;
  const performAttack=(attacker:Pokemon,defender:Pokemon,move:Move,player:boolean)=>attack(s,attacker,defender,move,player,emit);
  let active=s.party[s.active];
  if(active.hp<=0){if(action.kind==='switch'&&s.party[action.index]?.hp>0){s.active=action.index;note(s,`Go, ${nameOf(s.party[s.active])}!`);}return;}
  // Enemy action is committed before resolving player intent.
  const foeMove=enemyMove(s);
  if(action.kind==='move'){
    const m=action.index===-1?struggle():active.moves[action.index];if(!m||m.pp<=0||action.index===-1&&active.moves.some(m=>m.pp>0))return;
    const first=m.priority>foeMove.priority||(m.priority===foeMove.priority&&(speed(active)>speed(s.enemy)||(speed(active)===speed(s.enemy)&&random(s)<.5)));
    if(first){performAttack(active,s.enemy,m,true);performAttack(s.enemy,active,foeMove,false);}else{performAttack(s.enemy,active,foeMove,false);performAttack(active,s.enemy,m,true);}
  }else if(action.kind==='switch'){
    if(action.index===s.active||!s.party[action.index]||s.party[action.index].hp<=0)return;
    active.attackStage=0;s.active=action.index;active=s.party[s.active];if(s.trail){s.trail.stats.switches++;if(!s.trail.relayUsed){s.trail.relayUsed=true;if(s.relics.includes('relayguard'))active.guard=TRAIL_RULES.switchGuard;if(s.relics.includes('relayrush'))s.trail.rushUid=active.uid;if(s.relics.includes('relaypatch'))active.hp=Math.min(active.stats.hp,active.hp+Math.ceil(active.stats.hp*TRAIL_RULES.switchHeal));}}note(s,`Go, ${nameOf(active)}! Switching uses your turn.`);performAttack(s.enemy,active,foeMove,false);
  }else if(action.kind==='ball'){
    const key=action.great?'greatBalls':'balls';if(s.bag[key]<=0||!captureChance(s,action.great))return;
    const chance=captureChance(s,action.great);s.bag[key]--;
    if(random(s)<chance){note(s,'One… two… three… click!');winBattle(s,true);return;}
    note(s,`${nameOf(s.enemy)} broke free!`);performAttack(s.enemy,active,foeMove,false);
  }else if(action.kind==='potion'){
    if(s.bag.potions<=0||active.hp>=active.stats.hp)return;s.bag.potions--;active.hp=Math.min(active.stats.hp,active.hp+30);note(s,`${nameOf(active)} recovered up to 30 HP.`);performAttack(s.enemy,active,foeMove,false);
  }else if(action.kind==='flee'){
    if(s.room?.kind!=='wild')return;
    if(random(s)<Math.min(.95,.5+speed(active)/(speed(s.enemy)*4))){note(s,'You escaped safely.');completeRoom(s);return;}
    note(s,'Could not escape!');performAttack(s.enemy,active,foeMove,false);
  }
  if(s.trail&&s.room?.kind==='boss'&&s.turn%3===2&&s.enemy.hp>0&&s.enemy.status!=='none'){s.enemy.status='none';s.enemy.sleepTurns=0;note(s,'Cleansing Gust cleared the guardian’s conditions.');}
  s.turn++;endTurn(s);
}
export function chooseReward(s:GameState,reward:string){
  if(s.phase!=='reward'||!s.rewardOptions.includes(reward))return;
  if(reward==='supplies'){s.bag.balls+=3;s.bag.berries++;note(s,'Packed 3 Poké Balls and an emergency berry.');}
  else if(reward==='medicine'){s.bag.potions+=2;note(s,'Packed 2 potions.');}
  else if(reward==='gold'){s.gold+=35;note(s,'Found 35 gold.');}
  else if(reward in RELICS&&!s.relics.includes(reward as Relic)){s.relics.push(reward as Relic);note(s,`Found ${RELICS[reward as Relic].name}!`);}
  completeRoom(s);
}
export function replaceCapture(s:GameState,index:number){if(s.phase!=='replace'||!s.pendingCapture)return;if(index>=0&&index<s.party.length){s.party[index]=s.pendingCapture;note(s,`${nameOf(s.pendingCapture)} joined the team.`);}else note(s,`${nameOf(s.pendingCapture)} returned to the wild.`);s.pendingCapture=null;s.phase='reward';s.rewardOptions=s.routePlan||s.trail?pickRewards(s):['supplies','medicine','gold'];}
export function camp(s:GameState,choice:'rest'|'train'){
  if(s.phase!=='camp')return;
  s.party.forEach(p=>{if(choice==='rest')refresh(p,true);else if(p.hp>0){p.level=Math.min(50,p.level+1);const old=p.stats.hp;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost,p.trainerHpBonus);p.hp=Math.min(p.stats.hp,p.hp+p.stats.hp-old);p.moves.forEach(m=>m.pp=m.maxPP);evolve(s,p);}});
  note(s,choice==='rest'?'The team is fully rested. HP, conditions, and PP restored.':'A little training goes a long way. Living teammates gained a level.');completeRoom(s);
}
export const SHOP = [{key:'balls',name:'Poké Ball ×5',price:30,amount:5},{key:'greatBalls',name:'Great Ball ×2',price:40,amount:2},{key:'potions',name:'Potion ×2',price:25,amount:2},{key:'revives',name:'Revive',price:50,amount:1}] as const;
export function buy(s:GameState,index:number){if(s.phase!=='shop')return;const item=SHOP[index];if(!item||s.gold<item.price)return;s.gold-=item.price;s.bag[item.key]+=item.amount;note(s,`Bought ${item.name}.`);}
export function leaveRoom(s:GameState){if(['shop','event'].includes(s.phase))completeRoom(s);}
export function eventChoice(s:GameState,choice:'berry'|'shrine'){
  if(s.phase!=='event')return;
  if(choice==='berry'){s.bag.berries+=3;note(s,'A hidden berry grove. Collected 3 emergency berries.');}
  else {const p=s.party[s.active];p.hp=Math.max(1,p.hp-Math.ceil(p.stats.hp*.2));s.bag.greatBalls+=2;s.gold+=25;note(s,'The old shrine accepted a little vitality. Found 2 Great Balls and 25 gold.');}completeRoom(s);
}
export function fieldMedicine(s:GameState,index:number,revive=false){
  if(s.phase==='battle'||['starter','discovery','lost','won','replace'].includes(s.phase))return;const p=s.party[index];if(!p)return;
  if(revive){if(p.hp>0||s.bag.revives<=0)return;s.bag.revives--;p.hp=Math.ceil(p.stats.hp*.5);p.status='none';note(s,`${nameOf(p)} was revived.`);}
  else {if(p.hp<=0||p.hp>=p.stats.hp||s.bag.potions<=0)return;s.bag.potions--;p.hp=Math.min(p.stats.hp,p.hp+30);note(s,`${nameOf(p)} recovered up to 30 HP.`);}
}
export function validateBalance(input:Partial<Balance>):Balance{
  const clamp=(v:unknown,def:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):def;
  return {allShiny:input.allShiny===true,shinyChance:clamp(input.shinyChance,DEFAULT_BALANCE.shinyChance,0,1),shinyStatMultiplier:clamp(input.shinyStatMultiplier,1.15,1,3),captureMultiplier:clamp(input.captureMultiplier,1,.1,5),enemyStrength:clamp(input.enemyStrength,1,.4,2),experienceMultiplier:clamp(input.experienceMultiplier,1,.25,4),weaknessReduction:clamp(input.weaknessReduction,.3,0,.9)};
}
export function loadSave(text:string|null):GameState|null{
  if(!text)return null;try{const s=JSON.parse(text) as GameState;
    const phases:Phase[]=['starter','map','discovery','battle','reward','camp','shop','event','replace','won','lost'];
    if(![1,SAVE_VERSION].includes(s.version)||!phases.includes(s.phase)||!Array.isArray(s.party)||s.party.length>6||!Array.isArray(s.map)||s.map.length!==RUN_LENGTH||!Number.isInteger(s.depth)||s.depth<0||s.depth>RUN_LENGTH||!Number.isInteger(s.rng)||!s.config||!s.bag||!Array.isArray(s.log)||!Array.isArray(s.relics))return null;
    if(s.phase!=='starter'&&!s.party.length||s.phase==='battle'&&!s.enemy)return null;
    if(!Number.isInteger(s.active)||s.active<0||s.party.length>0&&s.active>=s.party.length||s.depth===trailLength(s)&&s.phase!=='won'||s.phase==='replace'&&!s.pendingCapture)return null;
    if(!s.map.every(row=>Array.isArray(row)&&row.length>0&&row.every(r=>typeof r?.id==='string'&&['wild','elite','treasure','camp','shop','event','boss'].includes(r.kind))))return null;
    if(s.phase==='discovery'&&(!s.room||!s.map[s.depth]?.some(r=>r.id===s.room!.id)))return null;
    if(!['balls','greatBalls','potions','berries','revives'].every(k=>Number.isFinite(s.bag[k as keyof typeof s.bag])&&s.bag[k as keyof typeof s.bag]>=0)||!Number.isFinite(s.gold)||s.gold<0||!Array.isArray(s.rewardOptions)||!Array.isArray(s.visited)||!Array.isArray(s.seen))return null;
    if(s.enemyTeam!==undefined&&(!Array.isArray(s.enemyTeam)||s.enemyTeam.length>2))return null;
    for(const p of [...s.party,...(s.enemy?[s.enemy]:[]),...(s.pendingCapture?[s.pendingCapture]:[]),...(s.caughtPokemon??[]),...(s.enemyTeam??[])]){
      if(p.sourceSpecimenId!==undefined&&typeof p.sourceSpecimenId!=='string')return null;
      if(!DEX[p.speciesId]||!p.stats||!p.ivs||!Array.isArray(p.moves)||!Number.isFinite(p.hp)||p.hp<0||p.hp>p.stats.hp||!Number.isFinite(p.shinyBoost)||!Number.isInteger(p.level)||p.level<1||p.level>100)return null;
      if(!Object.values(p.stats).every(v=>Number.isFinite(v)&&v>0)||!Object.values(p.ivs).every(v=>Number.isInteger(v)&&v>=0&&v<=31)||!p.moves.every(m=>Number.isFinite(m.pp)&&m.pp>=0&&m.pp<=m.maxPP))return null;
    }
    if(s.routePlan!==undefined){const p=s.routePlan;if(!p||p.version!==1||!Array.isArray(p.encounters)||p.encounters.length!==RUN_LENGTH||!p.encounters.every((id,i)=>Number.isInteger(id)&&(i%6===5?id===BIOMES[Math.floor(i/6)].boss:[0,1,3].includes(i%6)?BIOMES[Math.floor(i/6)].pool.includes(id):id===0))||!s.map.every((row,i)=>row.length===1&&row[0].kind===ROUTE_SEQUENCE[i%6]))return null;}
    if(s.trail!==undefined){if(!s.trail||typeof s.trail!=='object')return null;const t=s.trail;if(t.version!==1||!['venom','relay'].includes(t.style)||!Object.hasOwn(HUNTS,t.hunt)||!Array.isArray(t.knownSpecies)||!t.knownSpecies.every(id=>DEX[id])||typeof t.completed!=='boolean'||!Array.isArray(t.scoutedDepths)||t.scoutedDepths.length>TRAIL_RULES.scouts||new Set(t.scoutedDepths).size!==t.scoutedDepths.length||!t.scoutedDepths.every(d=>Number.isInteger(d)&&d>=0&&d<6&&d<=s.depth)||!['venom','brace'].includes(t.technique)||typeof t.lessonLearned!=='boolean'||typeof t.relayUsed!=='boolean'||t.rushUid!==null&&typeof t.rushUid!=='string'||!t.stats||!['poisonHeals','guardedHits','switches'].every(k=>Number.isSafeInteger(t.stats[k as keyof typeof t.stats])&&t.stats[k as keyof typeof t.stats]>=0)||s.depth>6||t.completed&&t.hunt==='none')return null;}
    if([...s.party,...(s.enemy?[s.enemy]:[])].some(p=>p.guard!==undefined&&(!Number.isFinite(p.guard)||p.guard<0||p.guard>1)))return null;
    if(new Set(s.relics).size!==s.relics.length||!s.relics.every(id=>Object.hasOwn(RELICS,id)&&(s.trail||!isTrailCharm(id))))return null;
    s.config=validateBalance(s.config);
    if(s.version===1||s.rulesVersion!==2){
      const routes=buildMap({...s,rng:hash(`${s.seed}:routes-v2`)});const firstFuture=s.depth+(s.phase==='map'||s.phase==='starter'?0:1);
      s.map=s.map.map((row,i)=>i>=firstFuture?routes[i]:row);s.version=SAVE_VERSION;s.rulesVersion=2;s.runId??=`run:legacy:${s.seed}`;s.difficulty??=0;s.upgradeSnapshot??=emptyUpgrades();s.defeatedBosses??=[5,11,17].filter(d=>d<s.depth);
      s.caughtPokemon??=[...s.party,...(s.pendingCapture?[s.pendingCapture]:[])].filter(p=>p.shiny||![1,4,7].includes(BASE_FORMS[p.speciesId]??p.speciesId)||Object.values(p.ivs).some(v=>v!==18)).map(p=>structuredClone(p));
    }
    s.teamRule??=s.phase==='starter'?'open':'budget';s.startingTeamSize??=s.phase==='starter'?0:1;s.enemyTeam??=[];s.bossTeamTotal??=s.room?.kind==='boss'?1:0;s.bossTeamDefeated??=0;
    if(!['open','budget'].includes(s.teamRule)||!Number.isInteger(s.startingTeamSize)||s.startingTeamSize<0||s.startingTeamSize>PARTY_SIZE||s.phase!=='starter'&&s.startingTeamSize===0)return null;
    if(!Number.isInteger(s.bossTeamTotal)||s.bossTeamTotal<0||s.bossTeamTotal>3||!Number.isInteger(s.bossTeamDefeated)||s.bossTeamDefeated<0||s.bossTeamDefeated>s.bossTeamTotal)return null;
    if(s.enemyTeam.length&&(s.phase!=='battle'||s.room?.kind!=='boss')&&s.phase!=='lost')return null;
    if(s.phase==='battle'&&s.room?.kind==='boss'&&s.bossTeamTotal!==s.bossTeamDefeated+s.enemyTeam.length+1)return null;
    const opponentIds=[...(s.enemy?[s.enemy.uid]:[]),...s.enemyTeam.map(p=>p.uid)];if(new Set(opponentIds).size!==opponentIds.length)return null;
    s.runId??=`run:legacy:${s.seed}`;s.caughtPokemon??=[];s.defeatedBosses??=[];s.upgradeSnapshot??=emptyUpgrades();s.difficulty??=0;
    if(!Number.isInteger(s.difficulty)||s.difficulty<0||s.difficulty>PROGRESSION.maxChallenge||!Array.isArray(s.caughtPokemon)||!Array.isArray(s.defeatedBosses)||!s.defeatedBosses.every(d=>[5,11,17].includes(d)))return null;
    for(const key of ['potions','balls','hp'] as const)if(!Number.isInteger(s.upgradeSnapshot[key])||s.upgradeSnapshot[key]<0||s.upgradeSnapshot[key]>(key==='hp'?2:1))return null;
    return s;
  }catch{return null;}
}
