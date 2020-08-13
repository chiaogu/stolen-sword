import { pressDownPos, isPressing, cursorPos, addOnPressUpListener } from './interaction';
import { timeRatio } from './time';
import { toFixed } from '../utils';

export const pos = [0, 0];
export let v = [0, 0];

const width = 30;
const height = 30;

function getReleaseVelocity() {
  const factor = 20;
  return cursorPos.map((pos, index) => (pos - pressDownPos[index]) / factor);
}

addOnPressUpListener(() => {
  v = getReleaseVelocity();
});

export default (ctx) => {
  // update position
  pos[0] -= v[0] * timeRatio;
  pos[1] -= v[1] * timeRatio;
  
  // bounce off the walls
  if(pos[0] + width > ctx.canvas.width || pos[0] < 0) v[0] *= -1;
  if(pos[1] + height > ctx.canvas.height || pos[1] < 0) v[1] *= -1;  
  
  // display data
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${v.map(toFixed)}`, 30, 30);
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...pos, width, height);
  
  if(isPressing) {
    const estimateV = getReleaseVelocity();
    
    ctx.fillText(`${estimateV.map(toFixed)}`, 30, 50);
    
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pos[0] + width / 2, pos[1] + height / 2);
    ctx.lineTo(pos[0] - estimateV[0] * 10, pos[1] - estimateV[1] * 10);
    ctx.stroke();
  }
};
