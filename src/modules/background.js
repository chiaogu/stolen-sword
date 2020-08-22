import { cameraCenter, cameraFrameSize } from '../state';

const interval = 200;

export default ctx => {
  ctx.clearRect(0, 0, cameraFrameSize.x + 1, cameraFrameSize.y);
  // const count = Math.round(Math.max(cameraFrameSize.x / interval, cameraFrameSize.y / interval));
  // const offset = [cameraCenter.x % interval, cameraCenter.y % interval];
  
  // for(let i = 0; i <= count; i++) {
  //   const x = i * interval - offset[0];
  //   ctx.strokeStyle = '#666';
  //   ctx.beginPath();
  //   ctx.moveTo(x, 0);
  //   ctx.lineTo(x, cameraFrameSize.y);
  //   ctx.stroke();
  // }
  // for(let i = 0; i < count; i++) {
  //   ctx. strokeStyle = '#666';
  //   ctx.beginPath();
  //   ctx.moveTo(0, i * interval + offset[1]);
  //   ctx.lineTo(cameraFrameSize.x, i * interval + offset[1]);
  //   ctx.stroke();
  // }
}