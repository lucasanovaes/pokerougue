import {DEFAULT_BALANCE} from './config';
import {newGame,startCollectedTeam,calculateStats,enterRoom,configureTrail,camp,battleAction} from './game';
import {claimFirstPartner,newProfile,syncProfile} from './profile';
import type {Session} from './session';
// Explicit development-only fixtures. Never replace an existing save or populate normal accounts.
export function playtestFixture(search:string,development:boolean,hasSave:boolean):Session|null{
  const params=new URLSearchParams(search),fixture=params.get('fixture');
  if(!development||hasSave||!params.has('playtest')||!['full-team','guardian-team','collection-duplicates','evolution-camp','evolution-overdue','discovery-trail','trail-guardian','trail-camp','trail-finish','trail-fork','upgrade-rewards','upgrade-lobby'].includes(fixture??''))return null;
  const profile=claimFirstPartner(newProfile(),1);
  profile.collection=[1,4,7,25,74,41].map((speciesId,i)=>({id:`test-owned-${i}`,speciesId,shiny:speciesId===25,ivs:{hp:18,attack:18,defense:18,spAttack:18,spDefense:18,speed:18}}));
  if(fixture==='collection-duplicates'){
    const ivs={hp:25,attack:29,defense:20,spAttack:18,spDefense:20,speed:26};
    const uniform=(value:number)=>({hp:value,attack:value,defense:value,spAttack:value,spDefense:value,speed:value});
    profile.collection=[profile.collection[0],
      {id:'qa-keeper',speciesId:25,shiny:false,ivs:{...ivs}},
      {id:'qa-low',speciesId:25,shiny:false,ivs:uniform(10)},
      {id:'qa-role',speciesId:25,shiny:false,ivs:{...uniform(0),attack:31,speed:31}},
      {id:'qa-equal',speciesId:25,shiny:false,ivs:{...ivs}},
      {id:'qa-favorite',speciesId:25,shiny:false,favorite:true,ivs:uniform(12)},
      {id:'qa-shiny',speciesId:25,shiny:true,ivs:uniform(8)}];
  }
  const game=newGame({...DEFAULT_BALANCE},'full-party-browser-fixture',{runId:`playtest-${fixture}`});
  if(fixture==='guardian-team'){
    startCollectedTeam(game,profile,profile.collection.map(p=>p.id));game.depth=5;
    game.party.forEach(p=>{p.level=8;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp=p.stats.hp;});
  }
  if(fixture==='evolution-camp'||fixture==='evolution-overdue'){
    profile.collection=[{...profile.collection[0],speciesId:41,shiny:true}];
    startCollectedTeam(game,profile,[profile.collection[0].id]);game.depth=4;
    const p=game.party[0];p.level=fixture==='evolution-overdue'?30:11;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp=p.stats.hp-3;
    enterRoom(game,'4-0');
  }
  if(['discovery-trail','trail-guardian','trail-camp','trail-finish','trail-fork'].includes(fixture??'')){
    profile.collection=[41,74,54].map((speciesId,i)=>({...profile.collection[i],speciesId,shiny:i===0}));
    if(fixture!=='discovery-trail'){
      configureTrail(game,fixture==='trail-finish'?'evolve':'careful',fixture==='trail-guardian'?'relay':'venom',profile.collection.map(p=>p.speciesId));
      startCollectedTeam(game,profile,profile.collection.slice(0,2).map(p=>p.id));game.depth=fixture==='trail-camp'?4:fixture==='trail-fork'?2:5;
      game.party.forEach(p=>{p.level=12;p.stats=calculateStats(p.speciesId,p.level,p.ivs,p.shinyBoost);p.hp=p.stats.hp;});
      if(fixture!=='trail-fork')enterRoom(game,`${game.depth}-0`);
      if(fixture==='trail-finish'){
        game.phase='camp';game.depth=4;game.party[0].level=11;camp(game,'train');enterRoom(game,'5-0');
        game.enemy!.hp=1;game.party[0].moves[0].priority=99;game.party[0].moves[0].power=999;battleAction(game,{kind:'move',index:0});
      }
    }
  }
  if(fixture==='upgrade-lobby')profile.research=30;
  if(fixture==='upgrade-rewards'){
    startCollectedTeam(game,profile,[profile.collection[0].id]);game.depth=2;enterRoom(game,'2-0');
    game.rewardOptions=['medicine','fang','grounding'];game.party[0].hp=Math.max(1,game.party[0].hp-5);
  }
  return {schema:1,game,profile:syncProfile(profile,game)};
}
