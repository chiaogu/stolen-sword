import { center, frameSize } from './camera';
import { beginPath, moveTo, lineTo, stroke } from '../utils';

const interval = 158;
const count = Math.round(Math.max(frameSize[0] / interval, frameSize[1] / interval));

export default ctx => {
  const offset = [center[0] % interval, center[1] % interval];
  
  for(let i = 0; i <= count; i++) {
    const x = i * interval - offset[0];
    ctx.strokeStyle = x % 100 === 0 ? '#aaa' : '#666';
    beginPath(ctx);
    moveTo(ctx, x, 0);
    lineTo(ctx, x, frameSize[1]);
    stroke(ctx);
  }
  for(let i = 0; i < count; i++) {
    ctx. strokeStyle = '#666';
    beginPath(ctx);
    moveTo(ctx, 0, i * interval + offset[1]);
    lineTo(ctx, frameSize[0], i * interval + offset[1]);
    stroke(ctx);
  }
}