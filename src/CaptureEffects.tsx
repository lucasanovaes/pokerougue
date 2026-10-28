import type {CSSProperties} from 'react';

// Presentation only: the capture result is already resolved and saved by the engine.
export default function CaptureEffects({great,caught}:{great:boolean;caught:boolean}){
  return <div className={`capture-effects ${caught?'is-caught':'is-escaped'}`} role="status" aria-label={caught?'Throwing ball… Pokémon caught!':'Throwing ball… Pokémon broke free!'}>
    <div className="capture-flight"><div className="capture-ball"><img src={`/assets/items/${great?'great-ball':'poke-ball'}.png`} alt="" draggable={false}/><i className="capture-button-glow"/></div></div>
    <div className="capture-energy"/>
    <div className="capture-finish">{Array.from({length:caught?8:5},(_,i)=><i key={i} style={{'--spark-x':`${Math.cos(i*Math.PI*2/(caught?8:5))*75}px`,'--spark-y':`${Math.sin(i*Math.PI*2/(caught?8:5))*60}px`} as CSSProperties}>{caught?'✦':'•'}</i>)}</div>
    <strong className="capture-result">{caught?'GOTCHA!':'BROKE FREE!'}</strong>
  </div>;
}
