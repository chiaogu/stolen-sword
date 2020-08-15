import { cameraCenter, cameraFrameSize } from '../state';

const interval = 158;
const count = Math.round(Math.max(cameraFrameSize[0] / interval, cameraFrameSize[1] / interval));

export default ctx => {
  const offset = [cameraCenter[0] % interval, cameraCenter[1] % interval];
  
  for(let i = 0; i <= count; i++) {
    const x = i * interval - offset[0];
    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, cameraFrameSize[1]);
    ctx.stroke();
  }
  for(let i = 0; i < count; i++) {
    ctx. strokeStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, i * interval + offset[1]);
    ctx.lineTo(cameraFrameSize[0], i * interval + offset[1]);
    ctx.stroke();
  }
}