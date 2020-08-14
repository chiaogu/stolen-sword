import { center, frameSize } from './camera';

const interval = 158;
const count = Math.round(Math.max(frameSize[0] / interval, frameSize[1] / interval));

export default ctx => {
  const offset = [center[0] % interval, center[1] % interval];
  
  for(let i = 0; i <= count; i++) {
    const x = i * interval - offset[0];
    ctx.strokeStyle = x % 100 === 0 ? '#aaa' : '#666';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, frameSize[1]);
    ctx.stroke();
  }
  for(let i = 0; i < count; i++) {
    ctx. strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, i * interval + offset[1]);
    ctx.lineTo(frameSize[0], i * interval + offset[1]);
    ctx.stroke();
  }
}