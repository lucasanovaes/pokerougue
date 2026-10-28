import {DEFAULT_BALANCE,type Balance} from './config';
import {loadSave,newGame,type GameState} from './game';
import {loadProfile,newProfile,syncProfile,type Profile} from './profile';
export type Session={schema:1;game:GameState;profile:Profile};
export function loadSession(raw:string|null,legacyRun:string|null,config:Balance=DEFAULT_BALANCE):Session{
  if(raw){try{const parsed=JSON.parse(raw);if(parsed.schema===1){const profile=loadProfile(parsed.profile),game=loadSave(JSON.stringify(parsed.game));if(profile){const recovered=game??loadSave(legacyRun)??newGame(config);return {schema:1,game:recovered,profile:syncProfile(profile,recovered)};}if(game)return {schema:1,game,profile:syncProfile(newProfile(),game)};}}catch{/* Try the previous standalone run below. */}}
  const game=loadSave(legacyRun)??newGame(config),profile=syncProfile(newProfile(),game);
  return {schema:1,game,profile};
}
export function serializeSession(session:Session){return JSON.stringify(session);}

// Named test slots make browser QA independent from real and earlier test saves.
export function storageKeys(search:string){
  const params=new URLSearchParams(search),test=params.has('playtest');
  const slot=(params.get('playtest')??'').replace(/[^a-zA-Z0-9-]/g,'').slice(0,40);
  const suffix=test&&slot?`.${slot}`:'';
  return {run:test?`verdant.playtest.v1${suffix}`:'verdant.run.v1',config:test?`verdant.playtest.balance.v1${suffix}`:'verdant.balance.v1',session:test?`verdant.playtest.session.v2${suffix}`:'verdant.session.v2'};
}

export function resetProgress(storage:Pick<Storage,'setItem'|'removeItem'>,keys:ReturnType<typeof storageKeys>):Session{
  const fresh:Session={schema:1,game:newGame({...DEFAULT_BALANCE},undefined,{runId:crypto.randomUUID()}),profile:newProfile()};
  // Commit the empty profile before clearing fallbacks; a failed write preserves progress.
  storage.setItem(keys.session,serializeSession(fresh));
  storage.removeItem(keys.run);
  storage.removeItem(keys.config);
  return fresh;
}
