import { toFixed } from '../utils'
import { display } from './display';
import { pressingKeys } from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';

let isFocusingOnPlayer = true;
export const center = [0, 0];
export const frameSize = [window.innerWidth, window.innerHeight];

display(() => `camera: ${center.map(toFixed)}`);
listen(PLAYER_POS_CHANGE, pos => {
  if(!isFocusingOnPlayer) return;
  center[0] = pos[0];
  center[1] = pos[1];
});

export function transform(vector) {
  return [
    frameSize[0] / 2 - center[0] + vector[0],
    frameSize[1] / 2 + center[1] - vector[1],
  ];
}

export default (ctx) => {
  // ctx.fillStyle = '#0ff';
  // ctx.fillRect(...transform(center), 5, 5);
  
  isFocusingOnPlayer = !pressingKeys.has('Shift');
  if(pressingKeys.has('W')) center[1] += 10;
  if(pressingKeys.has('A')) center[0] -= 10;
  if(pressingKeys.has('S')) center[1] -= 10;
  if(pressingKeys.has('D')) center[0] += 10;
}