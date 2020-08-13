import { toFixed } from '../utils'
import { display } from './display';

export const center = [0, 0];
export const frameSize = [window.innerWidth, window.innerHeight];

const W = 87;
const A = 65;
const S = 83;
const D = 68;
const pressingKeys = [];

display(() => `camera: ${center.map(toFixed)}`);

window.addEventListener('keydown', ({ keyCode }) => pressingKeys[keyCode] = true);
window.addEventListener('keyup', ({ keyCode }) => pressingKeys[keyCode] = false);

export function transform(vector) {
  return [
    frameSize[0] / 2 - center[0] + vector[0],
    frameSize[1] / 2 + center[1] - vector[1],
  ];
}

export default (ctx) => {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(...transform(center), 5, 5);
  
  pressingKeys.map((isPressing, key) => {
    if(!isPressing) return;
    switch(key) {
    case W: return center[1] += 10;
    case A: return center[0] -= 10;
    case S: return center[1] -= 10;
    case D: return center[0] += 10;
    }
  })
}