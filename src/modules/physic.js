import { getBoundary, v, pos, size } from './character';
import { transform } from './camera';
import { timeRatio } from './time';

const groundY = 0;
const G = 0.4;

export default (ctx) => {
  // gravity pulling
  v[1] -= G;
  if(getBoundary()[3] + v[1] * timeRatio <= groundY) {
    v[1] = 0;
    pos[1] = size[1] / 2;
  }

  // draw ground
  const transformedGround = transform([0, groundY]);
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, transformedGround[1]);
  ctx.lineTo(window.innerWidth, transformedGround[1]);
  ctx.stroke();
};
