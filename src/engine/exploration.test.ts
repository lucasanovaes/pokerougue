import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import PathChoice from '../PathChoice';
import {choosePath,loadSave,newGame as createGame,resolveDiscovery,startRun} from './game';
import {swipeDirection,SWIPE_DISTANCE} from './exploration';

// Compatibility coverage for saved blind-route expeditions.
const newGame:typeof createGame=(config,seed,options)=>createGame(config,seed,{...options,navigation:'legacy'});

describe('blind path commitment',()=>{
  it('maps a right swipe to Path A and a left swipe to Path B',()=>{for(const direction of ['right','left'] as const){const s=newGame(undefined,'directions');startRun(s,4);const expected=s.map[0][direction==='right'?0:1];choosePath(s,direction);expect(s.phase).toBe('discovery');expect(s.room!.id).toBe(expected.id);expect(s.pathDirection).toBe(direction);expect(s.enemy).toBeNull();expect(s.depth).toBe(0);}});
  it('locks the choice immediately and cannot switch paths during the reveal',()=>{const s=newGame();startRun(s,4);choosePath(s,'right');const selected=s.room!.id;const rng=s.rng;choosePath(s,'left');choosePath(s,'right');expect(s.room!.id).toBe(selected);expect(s.rng).toBe(rng);});
  it('persists the committed choice across a refresh and resolves it once',()=>{const s=newGame(undefined,'resume-path');startRun(s,4);choosePath(s,'left');const resumed=loadSave(JSON.stringify(s))!;expect(resumed.phase).toBe('discovery');expect(resumed.room).toEqual(s.room);resolveDiscovery(resumed);expect(resumed.phase).not.toBe('discovery');expect(resumed.visited).toEqual([s.room!.id]);const resolved=structuredClone(resumed);resolveDiscovery(resumed);expect(resumed).toEqual(resolved);});
  it('converges either direction on the biome checkpoint',()=>{for(const d of ['left','right'] as const){const s=newGame();startRun(s,1);s.depth=5;choosePath(s,d);expect(s.room!.kind).toBe('boss');resolveDiscovery(s);expect(s.phase).toBe('battle');expect(s.enemy!.speciesId).toBe(133);}});
  it('shuffles which side contains each room category across seeds',()=>{const outcomes=new Set(Array.from({length:30},(_,i)=>newGame(undefined,`paths-${i}`).map[2][0].kind));expect(outcomes.has('event')).toBe(true);expect(outcomes.has('treasure')).toBe(true);});
  it('does not change a battle when a path command is repeated',()=>{const s=newGame();startRun(s,7);choosePath(s,'right');resolveDiscovery(s);const snapshot=structuredClone(s);choosePath(s,'left');expect(s).toEqual(snapshot);});
  it('rejects an invalid saved discovery instead of resuming the wrong room',()=>{const s=newGame();startRun(s,1);s.phase='discovery';s.room=null;expect(loadSave(JSON.stringify(s))).toBeNull();});
});

describe('gesture intent',()=>{
  it('requires a deliberate horizontal gesture',()=>{expect(swipeDirection(SWIPE_DISTANCE,0)).toBe('right');expect(swipeDirection(-SWIPE_DISTANCE,0)).toBe('left');expect(swipeDirection(SWIPE_DISTANCE-1,0)).toBeNull();expect(swipeDirection(0,0)).toBeNull();});
  it('does not navigate for vertical scrolling or steep diagonals',()=>{expect(swipeDirection(20,200)).toBeNull();expect(swipeDirection(100,120)).toBeNull();expect(swipeDirection(-100,-120)).toBeNull();expect(swipeDirection(90,20)).toBe('right');});
  it('ignores malformed gesture inputs',()=>{expect(swipeDirection(NaN,0)).toBeNull();expect(swipeDirection(Infinity,0)).toBeNull();});
  it('renders direction choices without outcome clues',()=>{const html=renderToStaticMarkup(createElement(PathChoice,{onChoose:()=>{}}));expect(html).toContain('Take Path A, swipe right');expect(html).toContain('Take Path B, swipe left');expect(html).toContain('tabindex="0"');expect(html).not.toMatch(/Wild encounter|Elite encounter|Forgotten cache|Quiet clearing|Wandering merchant|Biome guardian/);});
});
