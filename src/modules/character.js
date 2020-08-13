import { pressDownPos, isPressing, cursorPos, addOnPressUpListener } from './interaction';
import time, { timeRatio } from './time';
import { transform } from './camera';
import { display } from './display';
import { toFixed } from '../utils';

export const pos = [0, 0];
export let v = [0, 0];
const size = [30, 30];

display(() => `pos: ${pos.map(toFixed)}`);
display(() => `v: ${getReleaseVelocity().map(toFixed)}`, () => isPressing);

addOnPressUpListener(() => {
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
  
  const [l, t] = getBoundary();
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform([l, t]), ...size);
  
  if(isPressing) {
    const estimateV = getReleaseVelocity();
    const posOnCanvas = transform(pos);
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...posOnCanvas);
    ctx.lineTo(
      posOnCanvas[0] + estimateV[0] * 10,
      posOnCanvas[1] - estimateV[1] * 10
    );
    ctx.stroke();
  }
};
