import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import type {BattleVisualEvent} from './engine/game';
import {effectFor} from './engine/presentation';
export default function BattleEffects({event,impact}:{event:BattleVisualEvent;impact:boolean}){
  const svg=useRef<SVGSVGElement>(null),[size,setSize]=useState({width:1000,height:500});
  useLayoutEffect(()=>{const el=svg.current;if(!el)return;const resize=()=>{const box=el.getBoundingClientRect();if(box.width&&box.height)setSize({width:box.width,height:box.height});};resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();},[]);
  const fx=effectFor(event),player=event.actor==='player',blocked=event.result==='blocked';
  const near=[size.width*.23,size.height*.75],far=[size.width*.73,size.height*(size.width<600?.36:.43)];
  const [sx,sy]=player?near:far, [tx,ty]=blocked||event.targetId===event.actorId?[sx,sy]:player?far:near;
  const landed=event.result==='damage'||event.result==='status',status=event.move.category==='status';
  const label=event.result==='damage'?`−${event.damage}${event.critical?'!':''}`:event.result==='miss'?'Miss':event.result==='immune'?'No effect':blocked?'Can’t move':event.move.effect==='guard'?'Guard ↑':event.move.effect==='weaken'?'Attack ↓':event.move.effect==='sleep'?'Sleep':event.move.effect==='paralysis'?'Paralyzed':event.move.effect==='burn'?'Burned':'Poisoned';
  return <div className={`battle-effects ${impact?'has-impact':''}`} aria-hidden="true" data-result={event.result} data-move={event.move.name} style={{'--fx-color':fx.color} as CSSProperties}>
    <div className="move-announcement">{blocked?'':event.move.name}</div>
    <svg ref={svg} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none">
      {!blocked&&<g transform={`translate(${sx} ${sy})`}>{[0,1,2].map(i=><g className={`fx-projectile ${status?'status-projectile':''}`} key={i} style={{'--dx':`${tx-sx}px`,'--dy':`${ty-sy}px`,'--stagger':`${i*28}ms`} as CSSProperties}><image href={`/assets/fx/${fx.asset}.png`} x={-32-i*9} y={-32+i*12} width="64" height="64" preserveAspectRatio="xMidYMid meet"/></g>)}</g>}
      {impact&&<g transform={`translate(${tx} ${ty})`} className="fx-contact">
        {landed&&<><circle className="fx-impact-ring" r={status?30:42}/>{!status&&<image className="fx-impact-sprite" href="/assets/fx/impact.png" x="-65" y="-65" width="130" height="130" preserveAspectRatio="xMidYMid meet"/>}{Array.from({length:6},(_,i)=><circle key={i} className="fx-scatter" r="5" style={{'--px':`${Math.cos(i*Math.PI/3)*85}px`,'--py':`${Math.sin(i*Math.PI/3)*65}px`} as CSSProperties}/>)}</>}
        <text className={`fx-result ${landed?'':'fx-no-hit'}`} y="-46" textAnchor="middle">{label}</text>
      </g>}
    </svg>
  </div>;
}
