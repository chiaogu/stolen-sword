import { getPlayerBoundary, playerV, playerPos, playerSize, $timeRatio } from '../state';
import { transform } from './camera';

const groundY = 0;
const G = 0.4;

export default (ctx) => {
  // gravity pulling
  playerV.y -= G;
  if(getPlayerBoundary().b + playerV.y * $timeRatio.$ <= groundY) {
    playerV.y = 0;
    playerPos.y = playerSize.y / 2;
  }

  // draw ground
  const transformedGround = transform([0, groundY]);
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, transformedGround[1]);
  ctx.lineTo(window.innerWidth, transformedGround[1]);
  ctx.stroke();
};
