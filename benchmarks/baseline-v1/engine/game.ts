import rawPokemon from '../data/pokemon.json';
import rawTypes from '../data/types.json';
import { DEFAULT_BALANCE, PARTY_SIZE, RUN_LENGTH, SAVE_VERSION, type Balance } from './config';

export type Stats = {hp:number; attack:number; defense:number; spAttack:number; spDefense:number; speed:number};
export type StatKey = keyof Stats;
export type Species = {id:number; name:string; types:string[]; baseStats:Stats; captureRate:number};
export const SPECIES = rawPokemon as Species[];
export const DEX = Object.fromEntries(SPECIES.map(p => [p.id,p])) as Record<number, Species>;
export const TYPE_CHART = rawTypes as Record<string,Record<string,number>>;
export type Status = 'none'|'sleep'|'paralysis'|'poison'|'burn';
export type Move = {name:string;type:string;power:number;category:'physical'|'special'|'status';pp:number;maxPP:number;accuracy:number;priority:number;effect?:Status|'weaken'};
export type Pokemon = {uid:string;speciesId:number;level:number;xp:number;ivs:Stats;stats:Stats;hp:number;shiny:boolean;shinyBoost:number;status:Status;sleepTurns:number;attackStage:number;moves:Move[]};
export type RoomKind = 'wild'|'elite'|'treasure'|'camp'|'shop'|'event'|'boss';
export type Room = {id:string;kind:RoomKind;label:string;hint:string;lane:number};
export type Relic = 'grounding'|'fang'|'lens'|'vitality';
export const RELICS:Record<Relic,{name:string;description:string;icon:string}> = {
  grounding:{name:'Grounding Charm',description:'Reduces the extra damage from every type weakness by 30%.',icon:'shield'},
  fang:{name:'Amber Fang',description:'Your team deals 15% more damage.',icon:'zap'},
  lens:{name:'Prismatic Lens',description:'Capture chances are 25% higher.',icon:'sparkles'},
  vitality:{name:'Verdant Seed',description:'Living Pokémon recover 12% max HP after each battle.',icon:'leaf'},
};
export type Direction = 'left'|'right';
export type Phase = 'starter'|'map'|'discovery'|'battle'|'reward'|'camp'|'shop'|'event'|'replace'|'won'|'lost';
export type GameState = {
  version:number;seed:string;rng:number;config:Balance;phase:Phase;depth:number;party:Pokemon[];active:number;
  enemy:Pokemon|null;room:Room|null;map:Room[][];visited:string[];gold:number;bag:{balls:number;greatBalls:number;potions:number;berries:number;revives:number};
  relics:Relic[];log:string[];rewardOptions:string[];pendingCapture:Pokemon|null;captures:number;seen:number[];shinySeen:number;turn:number;forceShiny:boolean;pathDirection?:Direction;
};
export const BIOMES = [
  {name:'Viridian Wilds',subtitle:'Where every adventure takes root.',tag:'FOREST',accent:'#356653',pool:[10,12,16,19,23,25,27,35,37,39,41,43,46,48,52,54,56,58,63,69,74],boss:95},
  {name:'Cerulean Coast',subtitle:'Follow the tide into the unknown.',tag:'COAST',accent:'#397c88',pool:[7,25,54,60,72,79,81,84,88,92,96,100,104,109,116,120,129,133],boss:130},
  {name:'Ember Highlands',subtitle:'A final climb. A story worth telling.',tag:'HIGHLANDS',accent:'#9b6952',pool:[5,8,26,37,58,66,77,93,94,111,114,123,131,134,135,136,143,147,148],boss:149},
];
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
  return [create('Quick Attack','normal',35,25,100,1),create(moveNames[primary][0],primary,45,25),status,create(moveNames[secondary][1],secondary,65,10,90)];
}
export function calculateStats(id:number,level:number,ivs:Stats,boost=1):Stats{
  const base=DEX[id].baseStats;return Object.fromEntries((Object.keys(base) as StatKey[]).map(k=>[k,Math.max(1,Math.floor((Math.floor((2*base[k]+ivs[k])*level/100)+(k==='hp'?level+10:5))*boost))])) as Stats;
}
export function createPokemon(s:GameState,id:number,level:number,starter=false):Pokemon{
  const ivs=Object.fromEntries(['hp','attack','defense','spAttack','spDefense','speed'].map(k=>[k,starter?18:Math.floor(random(s)*32)])) as Stats;
  const shiny=!starter&&(s.forceShiny||random(s)<s.config.shinyChance);if(shiny&&s.forceShiny)s.forceShiny=false;
  const shinyBoost=shiny?s.config.shinyStatMultiplier:1;
  const stats=calculateStats(id,level,ivs,shinyBoost);
  return {uid:`${s.seed}-${s.depth}-${Math.floor(random(s)*1e9)}`,speciesId:id,level,xp:0,ivs,stats,hp:stats.hp,shiny,shinyBoost,status:'none',sleepTurns:0,attackStage:0,moves:buildMoves(id)};
}
function buildMap(s:GameState):Room[][]{
  const labels:Record<RoomKind,[string,string]>={wild:['Wild encounter','A new companion, perhaps.'],elite:['Elite encounter','A tough battle. A rare reward.'],treasure:['Forgotten cache','Take one of three field supplies.'],camp:['Quiet clearing','Rest, recover, and regroup.'],shop:['Wandering merchant','Trade a little gold for peace of mind.'],event:['Something curious','The wilds have a story to tell.'],boss:['Biome guardian','Prove your team is ready.']};
  return Array.from({length:RUN_LENGTH},(_,i)=>{
    const rooms=Array.from({length:i%6===5?1:2},(_,lane)=>{
    const step=i%6;
    let kind:RoomKind=step===5?'boss':step===4?(lane===0?'camp':'shop'):step===0?(lane===0?'wild':'treasure'):step===1?(lane===0?'wild':pick(s,['treasure','event'] as RoomKind[])):step===2?(lane===0?'elite':'wild'):(lane===0?'wild':pick(s,['treasure','event'] as RoomKind[]));
    return {id:`${i}-${lane}`,kind,label:labels[kind][0],hint:labels[kind][1],lane};
    });
    // Neither direction consistently means safety, supplies, or danger.
    if(rooms.length===2&&random(s)<.5)rooms.reverse();
    return rooms;
  });
}
export function newGame(config:Balance={...DEFAULT_BALANCE},seed=`${Date.now().toString(36).toUpperCase()}`):GameState{
  const state:GameState={version:SAVE_VERSION,seed,rng:hash(seed),config:{...config},phase:'starter',depth:0,party:[],active:0,enemy:null,room:null,map:[],visited:[],gold:45,bag:{balls:10,greatBalls:2,potions:4,berries:2,revives:1},relics:[],log:['Your field journal is waiting for its first story.'],rewardOptions:[],pendingCapture:null,captures:0,seen:[],shinySeen:0,turn:0,forceShiny:false};
  state.map=buildMap(state);return state;
}
export function startRun(s:GameState,id:number){if(s.phase!=='starter'||![1,4,7].includes(id))return;s.party=[createPokemon(s,id,5,true)];s.phase='map';note(s,`${nameOf(s.party[0])} joined you. Choose your first path.`);}
export function effectiveness(moveType:string,defender:Pokemon):number{return DEX[defender.speciesId].types.reduce((m,t)=>m*(TYPE_CHART[moveType]?.[t]??1),1);}
export function adjustedEffectiveness(s:GameState,m:number,isPlayerDefender:boolean):number{return m>1&&isPlayerDefender&&s.relics.includes('grounding')?1+(m-1)*(1-s.config.weaknessReduction):m;}
export function captureChance(s:GameState,great=false):number{
  const p=s.enemy;if(!p||s.room?.kind==='boss'||s.room?.kind==='elite'||p.hp<=0)return 0;
  const status=p.status==='sleep'?2:p.status!=='none'?1.5:1;
  return Math.max(.01,Math.min(.95,DEX[p.speciesId].captureRate/255*((3*p.stats.hp-2*p.hp)/(3*p.stats.hp))*(great?1.5:1)*status*s.config.captureMultiplier*(s.relics.includes('lens')?1.25:1)));
}
function refresh(p:Pokemon,full=false){p.status='none';p.sleepTurns=0;p.attackStage=0;if(full)p.hp=p.stats.hp;p.moves.forEach(m=>m.pp=m.maxPP);}
function completeRoom(s:GameState){
  s.enemy=null;s.pendingCapture=null;s.party.forEach(p=>p.attackStage=0);s.depth++;
  if(s.party[s.active]?.hp===0)s.active=Math.max(0,s.party.findIndex(p=>p.hp>0));
  if(s.depth>=RUN_LENGTH){s.phase='won';note(s,'The expedition is complete. Every path led you here.');return;}
  s.phase='map';s.room=null;
}
export function enterRoom(s:GameState,id:string){
  if(s.phase!=='map')return;const room=s.map[s.depth]?.find(r=>r.id===id);if(!room)return;
  s.room=room;s.visited.push(id);s.turn=0;
  if(['wild','elite','boss'].includes(room.kind)){
    const b=biome(s),level=Math.max(2,Math.round((3+s.depth*.8+(room.kind==='boss'?3:room.kind==='elite'?1:0))*s.config.enemyStrength));
    // The shiny test flag is reserved for catchable wild encounters.
    const force=s.forceShiny;if(room.kind!=='wild')s.forceShiny=false;
    s.enemy=createPokemon(s,room.kind==='boss'?b.boss:pick(s,b.pool),level);
    if(room.kind!=='wild')s.forceShiny=force;
    s.active=s.party[s.active]?.hp>0?s.active:s.party.findIndex(p=>p.hp>0);
    s.seen=[...new Set([...s.seen,s.enemy.speciesId])];if(s.enemy.shiny)s.shinySeen++;
    s.phase='battle';note(s,`${s.enemy.shiny?'✦ A rare shiny':'A wild'} ${nameOf(s.enemy)} appeared!${room.kind==='boss'?' The guardian blocks the way.':''}`);
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
  note(s,`You followed Path ${direction==='right'?'A':'B'}. ${room.label} discovered.`);
}
export function resolveDiscovery(s:GameState){
  if(s.phase!=='discovery'||!s.room)return;
  const id=s.room.id;s.phase='map';enterRoom(s,id);
}
function pickRewards(s:GameState):string[]{const available=(Object.keys(RELICS) as Relic[]).filter(r=>!s.relics.includes(r));return ['supplies','medicine',available.length?pick(s,available):'gold'];}
function winBattle(s:GameState,caught=false){
  const foe=s.enemy!;s.gold+=s.room?.kind==='boss'?60:s.room?.kind==='elite'?35:15;
  const xp=Math.round(foe.level*22*s.config.experienceMultiplier);
  s.party.forEach((p,i)=>{if(p.hp<=0)return;p.xp+=Math.round(xp*(i===s.active?1:.7));
    while(p.xp>=p.level*12&&p.level<50){p.xp-=p.level*12;p.level++;const old=p.stats.hp;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp+=p.stats.hp-old;note(s,`${nameOf(p)} grew to level ${p.level}!`);
      // Short-expedition evolution thresholds; these are deliberately faster than the mainline games.
      const evolution:Record<number,[number,number]>={1:[10,2],2:[18,3],4:[10,5],5:[18,6],7:[10,8],8:[18,9],92:[12,93],147:[12,148],148:[20,149],129:[10,130]};
      if(evolution[p.speciesId]&&p.level>=evolution[p.speciesId][0]){const before=nameOf(p);p.speciesId=evolution[p.speciesId][1];const prev=p.stats.hp;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp+=p.stats.hp-prev;p.moves=buildMoves(p.speciesId);note(s,`${before} evolved into ${nameOf(p)}!`);}
    }
    if(s.relics.includes('vitality'))p.hp=Math.min(p.stats.hp,p.hp+Math.ceil(p.stats.hp*.12));
  });
  note(s,caught?`${nameOf(foe)} was caught! +${xp} field experience.`:`${nameOf(foe)} was defeated. +${xp} experience.`);
  if(caught){
    foe.attackStage=0;s.captures++;
    if(s.party.length>=PARTY_SIZE){s.pendingCapture=foe;s.phase='replace';return;}
    s.party.push(foe);
  }
  s.phase='reward';s.rewardOptions=s.room?.kind==='elite'||s.room?.kind==='boss'?pickRewards(s):['supplies','medicine','gold'];
}
function attack(s:GameState,attacker:Pokemon,defender:Pokemon,move:Move,player:boolean){
  if(attacker.hp<=0||defender.hp<=0)return;
  if(attacker.status==='sleep') {if(attacker.sleepTurns>0){attacker.sleepTurns--;note(s,`${nameOf(attacker)} is fast asleep.`);return;}attacker.status='none';note(s,`${nameOf(attacker)} woke up!`);}
  if(attacker.status==='paralysis'&&random(s)<.25){note(s,`${nameOf(attacker)} is fully paralyzed.`);return;}
  if(move.pp<=0)return;move.pp--;
  note(s,`${nameOf(attacker)} used ${move.name}.`);
  if(random(s)*100>=move.accuracy){note(s,'The move missed!');return;}
  const mult=move.name==='Struggle'?1:effectiveness(move.type,defender);
  if(mult===0&&(move.category!=='status'||move.effect==='paralysis')){note(s,`${nameOf(defender)} is immune.`);return;}
  if(move.category==='status'){
    if(move.effect==='weaken'){defender.attackStage=Math.max(-6,defender.attackStage-1);note(s,`${nameOf(defender)}'s Attack fell.`);return;}
    const types=DEX[defender.speciesId].types;
    if(defender.status!=='none'||(move.effect==='poison'&&(types.includes('poison')||types.includes('steel')))||(move.effect==='burn'&&types.includes('fire'))||(move.effect==='paralysis'&&types.includes('electric'))||(move.effect==='sleep'&&types.includes('grass'))){note(s,'It had no effect.');return;}
    defender.status=move.effect as Status;defender.sleepTurns=2;note(s,`${nameOf(defender)} now has ${defender.status}.`);return;
  }
  let atk=move.category==='physical'?attacker.stats.attack:attacker.stats.spAttack;
  const def=move.category==='physical'?defender.stats.defense:defender.stats.spDefense;
  if(move.category==='physical'){atk*=attacker.attackStage>=0?(2+attacker.attackStage)/2:2/(2-attacker.attackStage);if(attacker.status==='burn')atk*=.5;}
  const stab=DEX[attacker.speciesId].types.includes(move.type)?1.5:1;
  const critical=random(s)<1/16;
  const damage=Math.max(1,Math.floor((((2*attacker.level/5+2)*move.power*atk/def)/50+2)*stab*adjustedEffectiveness(s,mult,!player)*(.85+random(s)*.15)*(critical?1.5:1)*(player&&s.relics.includes('fang')?1.15:1)));
  defender.hp=Math.max(0,defender.hp-damage);
  note(s,`${damage} damage.${mult>1?' Super effective!':mult<1?' Not very effective.':''}${critical?' Critical hit!':''}`);
  if(move.name==='Struggle'){attacker.hp=Math.max(0,attacker.hp-Math.max(1,Math.floor(attacker.stats.hp/4)));note(s,`${nameOf(attacker)} took recoil damage.`);}
  if(!defender.hp)note(s,`${nameOf(defender)} fainted.`);
}
const speed=(p:Pokemon)=>p.stats.speed*(p.status==='paralysis'?.5:1);
const struggle=():Move=>({name:'Struggle',type:'normal',power:50,category:'physical',pp:999,maxPP:999,accuracy:100,priority:0});
function enemyMove(s:GameState):Move{
  const moves=s.enemy!.moves.filter(m=>m.pp>0);if(!moves.length)return struggle();
  if(s.room?.kind==='boss'||s.room?.kind==='elite'){
    const target=s.party[s.active];const ranked=moves.map(m=>({m,score:m.power*effectiveness(m.type,target)+(m.category==='status'&&target.status==='none'?30:0)+random(s)*20})).sort((a,b)=>b.score-a.score);return ranked[0].m;
  }return pick(s,moves);
}
function endTurn(s:GameState){
  for(const p of [s.party[s.active],s.enemy]){
    if(!p||p.hp<=0)continue;
    if(p.status==='poison'||p.status==='burn'){const damage=Math.max(1,Math.floor(p.stats.hp/(p.status==='poison'?8:16)));p.hp=Math.max(0,p.hp-damage);note(s,`${nameOf(p)} took ${damage} ${p.status} damage.`);}
  }
  const active=s.party[s.active];if(active.hp>0&&active.hp<=active.stats.hp*.25&&s.bag.berries>0){s.bag.berries--;active.hp=Math.min(active.stats.hp,active.hp+Math.ceil(active.stats.hp*.3));note(s,`${nameOf(active)} ate an emergency berry.`);}
  // A simultaneous knockout ends the run if no party member survives.
  if(!s.party.some(p=>p.hp>0)){s.phase='lost';note(s,'Your team needs to rest. The expedition ends here.');return;}
  if(s.enemy&&s.enemy.hp<=0){winBattle(s);return;}
  if(active.hp<=0)note(s,'Choose a living teammate to continue. This replacement is free.');
}
export type BattleAction={kind:'move';index:number}|{kind:'switch';index:number}|{kind:'ball';great:boolean}|{kind:'potion'}|{kind:'flee'};
export function battleAction(s:GameState,action:BattleAction){
  if(s.phase!=='battle'||!s.enemy)return;
  let active=s.party[s.active];
  if(active.hp<=0){if(action.kind==='switch'&&s.party[action.index]?.hp>0){s.active=action.index;note(s,`Go, ${nameOf(s.party[s.active])}!`);}return;}
  // Enemy action is committed before resolving player intent.
  const foeMove=enemyMove(s);
  if(action.kind==='move'){
    const m=action.index===-1?struggle():active.moves[action.index];if(!m||m.pp<=0||action.index===-1&&active.moves.some(m=>m.pp>0))return;
    const first=m.priority>foeMove.priority||(m.priority===foeMove.priority&&(speed(active)>speed(s.enemy)||(speed(active)===speed(s.enemy)&&random(s)<.5)));
    if(first){attack(s,active,s.enemy,m,true);attack(s,s.enemy,active,foeMove,false);}else{attack(s,s.enemy,active,foeMove,false);attack(s,active,s.enemy,m,true);}
  }else if(action.kind==='switch'){
    if(action.index===s.active||!s.party[action.index]||s.party[action.index].hp<=0)return;
    active.attackStage=0;s.active=action.index;active=s.party[s.active];note(s,`Go, ${nameOf(active)}! Switching uses your turn.`);attack(s,s.enemy,active,foeMove,false);
  }else if(action.kind==='ball'){
    const key=action.great?'greatBalls':'balls';if(s.bag[key]<=0||!captureChance(s,action.great))return;
    const chance=captureChance(s,action.great);s.bag[key]--;
    if(random(s)<chance){note(s,'One… two… three… click!');winBattle(s,true);return;}
    note(s,`${nameOf(s.enemy)} broke free!`);attack(s,s.enemy,active,foeMove,false);
  }else if(action.kind==='potion'){
    if(s.bag.potions<=0||active.hp>=active.stats.hp)return;s.bag.potions--;active.hp=Math.min(active.stats.hp,active.hp+30);note(s,`${nameOf(active)} recovered up to 30 HP.`);attack(s,s.enemy,active,foeMove,false);
  }else if(action.kind==='flee'){
    if(s.room?.kind!=='wild')return;
    if(random(s)<Math.min(.95,.5+speed(active)/(speed(s.enemy)*4))){note(s,'You escaped safely.');completeRoom(s);return;}
    note(s,'Could not escape!');attack(s,s.enemy,active,foeMove,false);
  }
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
export function replaceCapture(s:GameState,index:number){if(s.phase!=='replace'||!s.pendingCapture)return;if(index>=0&&index<s.party.length){s.party[index]=s.pendingCapture;note(s,`${nameOf(s.pendingCapture)} joined the team.`);}else note(s,`${nameOf(s.pendingCapture)} returned to the wild.`);s.pendingCapture=null;s.phase='reward';s.rewardOptions=['supplies','medicine','gold'];}
export function camp(s:GameState,choice:'rest'|'train'){
  if(s.phase!=='camp')return;
  s.party.forEach(p=>{if(choice==='rest')refresh(p,true);else if(p.hp>0){p.level=Math.min(50,p.level+1);const old=p.stats.hp;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp=Math.min(p.stats.hp,p.hp+p.stats.hp-old);p.moves.forEach(m=>m.pp=m.maxPP);}});
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
  return {shinyChance:clamp(input.shinyChance,DEFAULT_BALANCE.shinyChance,0,1),shinyStatMultiplier:clamp(input.shinyStatMultiplier,1.15,1,3),captureMultiplier:clamp(input.captureMultiplier,1,.1,5),enemyStrength:clamp(input.enemyStrength,1,.4,2),experienceMultiplier:clamp(input.experienceMultiplier,1,.25,4),weaknessReduction:clamp(input.weaknessReduction,.3,0,.9)};
}
export function loadSave(text:string|null):GameState|null{
  if(!text)return null;try{const s=JSON.parse(text) as GameState;
    const phases:Phase[]=['starter','map','discovery','battle','reward','camp','shop','event','replace','won','lost'];
    if(s.version!==SAVE_VERSION||!phases.includes(s.phase)||!Array.isArray(s.party)||s.party.length>6||!Array.isArray(s.map)||s.map.length!==RUN_LENGTH||!Number.isInteger(s.depth)||s.depth<0||s.depth>RUN_LENGTH||!Number.isInteger(s.rng)||!s.config||!s.bag||!Array.isArray(s.log)||!Array.isArray(s.relics))return null;
    if(s.phase!=='starter'&&!s.party.length||s.phase==='battle'&&!s.enemy)return null;
    if(!Number.isInteger(s.active)||s.active<0||s.party.length>0&&s.active>=s.party.length||s.depth===RUN_LENGTH&&s.phase!=='won'||s.phase==='replace'&&!s.pendingCapture)return null;
    if(!s.map.every(row=>Array.isArray(row)&&row.length>0&&row.every(r=>typeof r?.id==='string'&&['wild','elite','treasure','camp','shop','event','boss'].includes(r.kind))))return null;
    if(s.phase==='discovery'&&(!s.room||!s.map[s.depth]?.some(r=>r.id===s.room!.id)))return null;
    if(!['balls','greatBalls','potions','berries','revives'].every(k=>Number.isFinite(s.bag[k as keyof typeof s.bag])&&s.bag[k as keyof typeof s.bag]>=0)||!Number.isFinite(s.gold)||s.gold<0||!Array.isArray(s.rewardOptions)||!Array.isArray(s.visited)||!Array.isArray(s.seen))return null;
    for(const p of [...s.party,...(s.enemy?[s.enemy]:[]),...(s.pendingCapture?[s.pendingCapture]:[])]){
      if(!DEX[p.speciesId]||!p.stats||!p.ivs||!Array.isArray(p.moves)||!Number.isFinite(p.hp)||p.hp<0||p.hp>p.stats.hp||!Number.isFinite(p.shinyBoost)||!Number.isInteger(p.level)||p.level<1||p.level>100)return null;
      if(!Object.values(p.stats).every(v=>Number.isFinite(v)&&v>0)||!Object.values(p.ivs).every(v=>Number.isInteger(v)&&v>=0&&v<=31)||!p.moves.every(m=>Number.isFinite(m.pp)&&m.pp>=0&&m.pp<=m.maxPP))return null;
    }
    s.config=validateBalance(s.config);return s;
  }catch{return null;}
}
