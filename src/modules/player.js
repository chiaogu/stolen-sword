import{
  pressDownPos,
  cursorPos,
  $isPressing,
  $timeRatio,
  player,
  transform,
} from '../state';
import { PLAYER_POS_CHANGE, PRESS_UP, emit, listen } from '../events';
import { vectorOp, vector, vectorStringify, getObjectBoundary } from '../utils';
import { G } from '../constants';
import { display } from './display';

listen(PRESS_UP, () => {
  const v = getReleaseVelocity();
  player.v.x = v.x;
  player.v.y = v.y;
});

export function getReleaseVelocity() {
  return vector(
    (pressDownPos.x - cursorPos.x) / 15,
    (cursorPos.y - pressDownPos.y) / 15,
  )
}
display(() => `releaseV: ${vectorStringify(getReleaseVelocity())}`);

export default (ctx) => {
  // gravity pulling
  player.v.y -= G * $timeRatio.$;
  
  // update position
  vectorOp((pos, v) => pos + v * $timeRatio.$, [player.p, player.v], player.p);
  emit(PLAYER_POS_CHANGE, player.p);
  
  const estimateV = getReleaseVelocity();
  const { l, t } = getObjectBoundary(player);
  
  const nextB = vectorOp((pos, v) => pos + v, [player.p, player.v]);
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform(vector(l, t)), transform(player.s.x), transform(player.s.y));
  ctx.fillStyle = '#fff';
  ctx.strokeRect(...transform(vector(nextB.x - transform(player.s.x / 2), nextB.y + transform(player.s.y / 2))), transform(player.s.x), transform(player.s.y));
    
  // visualize velocity
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...transform(player.p));
  ctx.lineTo(...transform(vectorOp((pos, v) => pos + v * 5, [player.p, player.v])));
  ctx.stroke();
  
  if($isPressing.$) {
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(player.p));
    ctx.lineTo(...transform(vectorOp((pos, v) => pos + v * 10, [player.p, estimateV])));
    ctx.stroke();
  } 
};
