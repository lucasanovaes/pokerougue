import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import BattleEffects from '../BattleEffects';
import {battleAction,newGame,startRun,enterRoom,createPokemon,type BattleVisualEvent,type Move} from './game';
import {applyVisualImpact,effectFor,EFFECTS,ATTACK_TIMING} from './presentation';
function move(type='normal',power=40):Move{return {name:'Test move',type,power,category:'physical',pp:20,maxPP:20,accuracy:100,priority:0};}
function setup(){const s=newGame(undefined,'effects-test');startRun(s,4);enterRoom(s,'0-0');s.bag.berries=0;for(const p of [s.party[0],s.enemy!]){p.hp=500;p.stats.hp=500;p.status='none';p.moves=[move()];}s.party[0].stats.speed=100;s.enemy!.stats.speed=1;return s;}
function perform(s=setup()){const events:BattleVisualEvent[]=[];battleAction(s,{kind:'move',index:0},e=>events.push(e));return events;}

describe('battle presentation observes actual outcomes',()=>{
  it('leaves RNG, damage, turns, and saves identical with an observer attached',()=>{for(let seed=0;seed<30;seed++){const a=setup();a.rng+=seed;const b=structuredClone(a);battleAction(a,{kind:'move',index:0});perform(b);expect(b).toEqual(a);}});
  it('emits both moves in speed order with the real damage and target',()=>{const s=setup(),hp=s.enemy!.hp,events=perform(s);expect(events.map(e=>e.actor)).toEqual(['player','enemy']);expect(events[0].damage).toBe(hp-s.enemy!.hp);expect(events[0].targetId).toBe(s.enemy!.uid);const fast=setup();fast.enemy!.stats.speed=200;expect(perform(fast).map(e=>e.actor)).toEqual(['enemy','player']);});
  it('shows a miss without a damage impact and an immunity without fake damage',()=>{const miss=setup();miss.party[0].moves[0].accuracy=0;expect(perform(miss)[0]).toMatchObject({result:'miss',damage:0});const immune=setup();immune.enemy!.speciesId=92;expect(perform(immune)[0]).toMatchObject({result:'immune',damage:0});});
  it('shows a status application and a status failure as different results',()=>{const s=setup();s.party[0].moves=[{...move('grass',0),category:'status',effect:'sleep'}];s.enemy!.speciesId=19;expect(perform(s)[0]).toMatchObject({result:'status',targetStatus:'sleep'});const immune=setup();immune.party[0].moves=s.party[0].moves;immune.enemy!.speciesId=1;expect(perform(immune)[0].result).toBe('immune');});
  it('never animates a counterattack after the enemy has fainted',()=>{const s=setup();s.enemy!.hp=1;const events=perform(s);expect(events).toHaveLength(1);expect(events[0]).toMatchObject({actor:'player',damage:1,targetHp:0});expect(s.phase).toBe('reward');});
  it('targets the switched-in Pokémon and animates only the enemy for a potion',()=>{const s=setup();s.party.push(createPokemon(s,7,5));const events:BattleVisualEvent[]=[];battleAction(s,{kind:'switch',index:1},e=>events.push(e));expect(events).toHaveLength(1);expect(events[0].targetId).toBe(s.party[1].uid);const healed=setup();healed.party[0].hp=100;const hit:BattleVisualEvent[]=[];battleAction(healed,{kind:'potion'},e=>hit.push(e));expect(hit.map(e=>e.actor)).toEqual(['enemy']);});
  it('does not replay invalid commands and marks sleep as a blocked move',()=>{const s=setup(),events:BattleVisualEvent[]=[];battleAction(s,{kind:'move',index:50},e=>events.push(e));expect(events).toEqual([]);s.party[0].status='sleep';s.party[0].sleepTurns=2;expect(perform(s)[0].result).toBe('blocked');});
});

describe('local effect assets and playback snapshots',()=>{
  it('records a source and matching content hash for every imported effect',()=>{const manifest=JSON.parse(readFileSync('public/assets/fx/sources.json','utf8')) as {file:string;source:string;sha256:string}[];expect(manifest).toHaveLength(14);for(const asset of manifest){expect(asset.source).toBe(`https://play.pokemonshowdown.com/fx/${asset.file}`);expect(createHash('sha256').update(readFileSync(`public/assets/fx/${asset.file}`)).digest('hex')).toBe(asset.sha256);}});
  it('covers all 18 types using local PNG files',()=>{expect(Object.keys(EFFECTS)).toHaveLength(18);for(const fx of Object.values(EFFECTS)){const path=`public/assets/fx/${fx.asset}.png`;expect(existsSync(path)).toBe(true);expect(readFileSync(path).subarray(1,4).toString()).toBe('PNG');}expect(ATTACK_TIMING.duration).toBeLessThanOrEqual(500);});
  it('applies HP and status only to the matching individual without mutating the saved state',()=>{const before=setup(),after=structuredClone(before),event=perform(after)[0],snapshot=structuredClone(before),view=applyVisualImpact(before,event);expect(view.enemy!.hp).toBe(event.targetHp);expect(before).toEqual(snapshot);expect(view.party[0].moves[0].pp).toBe(20);});
  it('keeps misses free of hit graphics and effects outside the keyboard focus order',()=>{const s=setup();s.party[0].moves[0].accuracy=0;const event=perform(s)[0];const html=renderToStaticMarkup(createElement(BattleEffects,{event,impact:true}));expect(html).toContain('Miss');expect(html).not.toContain('fx-impact-ring');expect(html).toContain('aria-hidden="true"');expect(html).not.toContain('tabindex');});
  it('chooses status visuals from the actual condition',()=>{const event=perform()[0];for(const effect of ['sleep','burn','paralysis','poison','weaken'] as const){const fx=effectFor({...event,move:{...event.move,category:'status',effect}});expect(existsSync(`public/assets/fx/${fx.asset}.png`)).toBe(true);}});
});
