import{
  getReleaseVelocity,
  $isPressing,
  $timeRatio,
  player,
  transform,
  playerTrajectory,
  dash,
  isAbleToDash,
} from '../state';
import { PLAYER_POS_CHANGE, PRESS_UP, emit, listen } from '../events';
import { vectorOp, vector, vectorStringify, getObjectBoundary } from '../utils';
import { G } from '../constants';
import { display } from './display';

listen(PRESS_UP, dash);

display(() => `releaseV: ${vectorStringify(getReleaseVelocity())}`);

export default (ctx) => {
  // gravity pulling
  player.v.y -= G * $timeRatio.$;
  
  // update position
  vectorOp((pos, v) => pos + v * $timeRatio.$, [player.p, player.v], player.p);
  emit(PLAYER_POS_CHANGE, player.p);
  
  // draw character
  ctx.fillStyle = '#fff';
  const { l, t } = getObjectBoundary(player);
  ctx.fillRect(...transform(vector(l, t)), transform(player.s.x), transform(player.s.y));
    
  // visualize velocity
  ctx.strokeStyle = '#f0f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...transform(player.p));
  ctx.lineTo(...transform(vectorOp((pos, v) => pos + v * 5, [player.p, player.v])));
  ctx.stroke();
  
  if($isPressing.$ && isAbleToDash()) {
    // draw character positioin on next frame
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(player.p));
    playerTrajectory().map(pos => {
      ctx.lineTo(...transform(vector(pos.x, pos.y)));
      // ctx.strokeRect(...transform(vector(pos.x - player.s.x / 2, pos.y + player.s.y / 2)), transform(player.s.x), transform(player.s.y));
    })
    ctx.stroke();
  } 
};
