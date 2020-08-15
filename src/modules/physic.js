import { getPlayerBoundary, playerV, playerPos, playerSize, $timeRatio } from '../state';
import { transform } from './camera';
import { vector, toZero } from '../utils';

const GROUND_Y = 0;
const G = 0.4;
const GROUND_FRICTION = 0.2;

function isJumping() {
  return getPlayerBoundary().b + playerV.y * $timeRatio.$ > GROUND_Y;
}

export default (ctx) => {
  // gravity pulling
  playerV.y -= G * $timeRatio.$;
  if(!isJumping()) {
    playerV.y = 0;
    playerPos.y = playerSize.y / 2;
    const vXMagnitude = Math.abs(playerV.x);
    if(vXMagnitude > 0) playerV.x = toZero(playerV.x, vXMagnitude * (GROUND_FRICTION * $timeRatio.$));
  }

  // draw ground
  const transformedGround = transform(vector(0, GROUND_Y));
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, transformedGround[1]);
  ctx.lineTo(window.innerWidth, transformedGround[1]);
  ctx.stroke();
};
