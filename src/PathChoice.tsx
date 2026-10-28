import {useRef,useState,type PointerEvent} from 'react';
import {ArrowLeft,ArrowRight,Compass,Footprints,MoveHorizontal} from 'lucide-react';
import {swipeDirection,SWIPE_DISTANCE} from './engine/exploration';
import type {Direction} from './engine/game';

export default function PathChoice({onChoose}:{onChoose:(direction:Direction)=>void}){
  const [offset,setOffset]=useState(0);
  const [dragging,setDragging]=useState(false);
  const origin=useRef<{x:number;y:number;pointerId:number}|null>(null);
  const committed=useRef(false);
  const choice=offset>=0?'A':'B';
  function commit(direction:Direction){if(committed.current)return;committed.current=true;onChoose(direction);}
  function begin(e:PointerEvent<HTMLDivElement>){
    if(!e.isPrimary||e.button!==0)return;
    origin.current={x:e.clientX,y:e.clientY,pointerId:e.pointerId};
    e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);
  }
  function move(e:PointerEvent<HTMLDivElement>){
    const start=origin.current;if(!start||start.pointerId!==e.pointerId)return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;
    // Yield to vertical scrolling rather than interpreting it as a path choice.
    if(Math.abs(dy)>16&&Math.abs(dy)>Math.abs(dx)*1.2){cancel();return;}
    setOffset(Math.max(-125,Math.min(125,dx)));
  }
  function finish(e:PointerEvent<HTMLDivElement>){
    const start=origin.current;if(!start||start.pointerId!==e.pointerId)return;
    const direction=swipeDirection(e.clientX-start.x,e.clientY-start.y);
    cancel();if(direction)commit(direction);
  }
  function cancel(){origin.current=null;setDragging(false);setOffset(0);}
  return <div className="unknown-paths">
    <div className={`swipe-field ${dragging?'dragging':''} ${offset>25?'lean-right':offset<-25?'lean-left':''}`} role="group" aria-roledescription="swipe choice" aria-label="Unknown paths. Swipe right for Path A, or left for Path B." tabIndex={0}
      onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel}
      onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();commit(e.key==='ArrowRight'?'right':'left');}}}>
      <h3>Which way?</h3>
      <button className="trail-arrow left" onPointerDown={e=>e.stopPropagation()} onClick={()=>commit('left')} aria-label="Take Path B, swipe left"><ArrowLeft size={30}/></button>
      <button className="trail-arrow right" onPointerDown={e=>e.stopPropagation()} onClick={()=>commit('right')} aria-label="Take Path A, swipe right"><ArrowRight size={30}/></button>
      <div className="swipe-gesture" style={{transform:`translateX(${offset*.45}px)`}}><MoveHorizontal size={25}/><span aria-live="polite">{Math.abs(offset)>=SWIPE_DISTANCE?'Release':'Swipe left or right'}</span></div>
    </div>
  </div>;
}
