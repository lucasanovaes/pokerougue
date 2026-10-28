import type {Direction} from './game';

export const SWIPE_DISTANCE = 64;
export function swipeDirection(dx:number,dy:number):Direction|null{
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.abs(dx)<SWIPE_DISTANCE||Math.abs(dx)<Math.abs(dy)*1.35)return null;
  return dx>0?'right':'left';
}
