import type {CSSProperties} from 'react';

// A short starburst entrance followed by a quiet orbit, like a rare encounter reveal.
export default function ShinyAura(){
  return <span className="shiny-aura" aria-hidden="true"><span className="shiny-halo"/><span className="shiny-ring"/>{Array.from({length:10},(_,i)=><span key={i} className="shiny-star" style={{'--angle':`${i*36}deg`,'--delay':`${i*.035}s`,'--orbit-delay':`${i*-.47}s`} as CSSProperties}>✦</span>)}</span>;
}
