import {Sparkles} from 'lucide-react';
import {DEX,sprite,titleCase,type Pokemon} from './engine/game';
import type {Profile} from './engine/profile';
import {captureHighlights} from './engine/collection';
import ShinyAura from './ShinyAura';
export default function CaptureReveal({pokemon,profile,onInspect}:{pokemon:Pokemon;profile:Profile;onInspect:()=>void}){
 const result=captureHighlights({...pokemon,id:pokemon.uid},profile);
 return <div className={`capture-reveal ${pokemon.shiny?'shiny-capture':''}`}><span className="capture-ribbon">{pokemon.shiny?<><Sparkles size={15}/>SHINY!</>:result.first?'NEW POKÉMON!':result.personalBest?'PERSONAL BEST!':'GOTCHA!'}</span><div className="capture-portrait"><div className="capture-circle"/><img className="pokemon-image" src={sprite(pokemon)} alt={`${pokemon.shiny?'Shiny ':''}${titleCase(DEX[pokemon.speciesId].name)}`} draggable={false}/>{pokemon.shiny&&<ShinyAura/>}</div><h2>{titleCase(DEX[pokemon.speciesId].name)}</h2><button className="button subtle capture-summary" onClick={onInspect} aria-label={`Summary of caught ${titleCase(DEX[pokemon.speciesId].name)}`}>SUMMARY</button></div>;
}
