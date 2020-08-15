import { $timeRatio, player } from '../state';
import { transform } from './camera';
import { vector, toZero, getObjectBoundary } from '../utils';

const GROUND_Y = 0;
const G = 0.4;
const GROUND_FRICTION = 0.2;

function isJumping() {
  return getObjectBoundary(player).b + player.v.y * $timeRatio.$ > GROUND_Y;
}

export default (ctx) => {
  // gravity pulling
  player.v.y -= G * $timeRatio.$;
  if(!isJumping()) {
    player.v.y = 0;
    player.p.y = player.s.y / 2;
    const vXMagnitude = Math.abs(player.v.x);
    if(vXMagnitude > 0) player.v.x = toZero(player.v.x, vXMagnitude * (GROUND_FRICTION * $timeRatio.$));
  }

  // draw ground
  const transformedGround = transform(vector(0, GROUND_Y));
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, transformedGround[1]);
  ctx.lineTo(window.innerWidth, transformedGround[1]);
  ctx.stroke();
};
