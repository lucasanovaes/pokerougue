import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ShinyAura from '../ShinyAura';
import {DEFAULT_BALANCE} from './config';
import {createPokemon,enterRoom,newGame,startRun,validateBalance,loadSave} from './game';
import {claimFirstPartner,newProfile,syncProfile,buyUpgrade} from './profile';
import {loadSession,resetProgress,serializeSession,storageKeys} from './session';

describe('all-shiny developer mode',()=>{
  it('makes every new wild, elite, and guardian shiny with the proper bonus and sprites',()=>{
    const s=newGame({...DEFAULT_BALANCE,shinyChance:0,allShiny:true});startRun(s,1);
    expect(s.party[0].shiny).toBe(false); // A test mode for encounters, not a rewrite of ownership.
    for(const depth of [0,5,8,11,17]){s.depth=depth;s.phase='map';enterRoom(s,`${depth}-0`);expect(s.enemy!.shiny).toBe(true);expect(s.enemy!.shinyBoost).toBe(DEFAULT_BALANCE.shinyStatMultiplier);}
  });
  it('preserves custom rarity while switching the developer override on and off',()=>{
    const s=newGame({...DEFAULT_BALANCE,shinyChance:0,allShiny:true});const shiny=createPokemon(s,25,10);s.config.allShiny=false;
    expect(createPokemon(s,25,10).shiny).toBe(false);expect(shiny.shiny).toBe(true);expect(s.config.shinyChance).toBe(0);
  });
  it('saves the toggle and keeps IV rolls independent from the override',()=>{
    const a=newGame({...DEFAULT_BALANCE,shinyChance:0},'matching'),b=newGame({...DEFAULT_BALANCE,shinyChance:0,allShiny:true},'matching');
    const normal=createPokemon(a,25,15),shiny=createPokemon(b,25,15);expect(shiny.ivs).toEqual(normal.ivs);expect(shiny.stats.hp).toBeGreaterThan(normal.stats.hp);expect(loadSave(JSON.stringify(b))!.config.allShiny).toBe(true);
  });
  it('defaults old saves and malformed values to normal rarity',()=>{expect(validateBalance({}).allShiny).toBe(false);expect(validateBalance({allShiny:'true'} as never).allShiny).toBe(false);expect(validateBalance({allShiny:true}).allShiny).toBe(true);});
  it('keeps the sparkle effect decorative and outside the action focus order',()=>{const html=renderToStaticMarkup(createElement(ShinyAura));expect(html).toContain('aria-hidden="true"');expect(html).toContain('shiny-ring');expect(html).not.toMatch(/button|tabindex/);});
});

describe('complete local progress reset',()=>{
  it('clears the active slot completely and cannot resurrect the legacy save on reload',()=>{
    const keys=storageKeys('?playtest=reset-regression'),other=storageKeys('');
    const s=newGame({...DEFAULT_BALANCE,allShiny:true},'old');startRun(s,4);s.depth=6;s.defeatedBosses=[5];s.caughtPokemon!.push(createPokemon(s,25,8));
    let p=syncProfile(claimFirstPartner(newProfile(),4),s);p=buyUpgrade(p,'potions');
    const data=new Map([[keys.session,serializeSession({schema:1,game:s,profile:p})],[keys.run,JSON.stringify(s)],[keys.config,JSON.stringify(s.config)],[other.session,'regular progress']]);
    const storage={setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};
    const fresh=resetProgress(storage,keys);expect(fresh.profile).toEqual(newProfile());expect(fresh.game.phase).toBe('starter');expect(fresh.game.config).toEqual(DEFAULT_BALANCE);expect(fresh.game.party).toEqual([]);expect(fresh.game.runId).not.toBe(s.runId);expect(data.has(keys.run)).toBe(false);expect(data.has(keys.config)).toBe(false);expect(data.get(other.session)).toBe('regular progress');
    const reloaded=loadSession(data.get(keys.session)!,data.get(keys.run)??null);expect(reloaded.game).toEqual(fresh.game);expect(reloaded.profile).toEqual({...fresh.profile,ledger:reloaded.profile.ledger});expect(Object.values(reloaded.profile.ledger).every(entry=>entry.earned===0&&!entry.started)).toBe(true);
  });
  it('preserves previous progress when the fresh save cannot be written',()=>{const removed:string[]=[];expect(()=>resetProgress({setItem:()=>{throw new Error('Storage unavailable');},removeItem:k=>removed.push(k)},storageKeys(''))).toThrow();expect(removed).toEqual([]);});
});
