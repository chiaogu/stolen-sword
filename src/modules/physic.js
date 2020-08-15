import { getPlayerBoundary, playerV, playerPos, playerSize, $timeRatio } from '../state';
import { transform } from './camera';

const groundY = 0;
const G = 0.4;

export default (ctx) => {
  // gravity pulling
  playerV[1] -= G;
  if(getPlayerBoundary()[3] + playerV[1] * $timeRatio.$ <= groundY) {
    playerV[1] = 0;
    playerPos[1] = playerSize[1] / 2;
  }

  // draw ground
  const transformedGround = transform([0, groundY]);
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, transformedGround[1]);
  ctx.lineTo(window.innerWidth, transformedGround[1]);
  ctx.stroke();
};
