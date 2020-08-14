import { pressDownPos, isPressing, cursorPos } from './interaction';
import { timeRatio } from './time';
import { transform } from './camera';
import { display } from './display';
import { toFixed } from '../utils';
import { PLAYER_POS_CHANGE, PRESS_UP, emit, listen } from '../events';

export const pos = [0, 100];
export let v = [0, 0];
export const size = [30, 30];

display(() => `pos: ${pos.map(toFixed)}`);
display(() => `v: ${v.map(toFixed)}`);

listen(PRESS_UP, () => {
  v = getReleaseVelocity();
});

function getReleaseVelocity() {
  const factor = 15;
  return [
    (pressDownPos[0] - cursorPos[0]) / factor,
    (cursorPos[1] - pressDownPos[1]) / factor,
  ]
}


export function getBoundary() {
  return [
    pos[0] - size[0] / 2,
    pos[1] + size[1] / 2,
    pos[0] + size[0] / 2,
    pos[1] - size[1] / 2,
  ];
}

export default (ctx) => {
  // update position
  pos[0] += v[0] * timeRatio;
  pos[1] += v[1] * timeRatio; 
  emit(PLAYER_POS_CHANGE, pos);
  
  // decrease
  // if(Math.hypot(...v) < 0.1) {
  //   v[0] = 0;
  //   v[1] = 0;
  // } else {
  //   v[0] *= 0.95;
  //   v[1] *= 0.95;
  // }
  
  const estimateV = getReleaseVelocity();
  const [l, t] = getBoundary();
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform([l, t]), ...size);
  
  if(isPressing) {
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(pos));
    ctx.lineTo(...transform([
      pos[0] + estimateV[0] * 10,
      pos[1] + estimateV[1] * 10
    ]));
    ctx.stroke();
  } 
};
