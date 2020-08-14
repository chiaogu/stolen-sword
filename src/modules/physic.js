import { getPlayerBoundary, playerV, playerPos, playerSize } from '../state';
import { beginPath, moveTo, lineTo, stroke } from '../utils';
import { transform } from './camera';
import { timeRatio } from './time';

const groundY = 0;
const G = 0.4;

export default (ctx) => {
  // gravity pulling
  playerV[1] -= G;
  if(getPlayerBoundary()[3] + playerV[1] * timeRatio <= groundY) {
    playerV[1] = 0;
    playerPos[1] = playerSize[1] / 2;
  }

  // draw ground
  const transformedGround = transform([0, groundY]);
  ctx.strokeStyle = '#fff';
  beginPath(ctx);
  moveTo(ctx, 0, transformedGround[1]);
  lineTo(ctx, window.innerWidth, transformedGround[1]);
  stroke(ctx);
};
