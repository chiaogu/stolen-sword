import{
  playerPos,
  playerV,
  playerSize,
  getPlayerBoundary,
  pressDownPos,
  cursorPos,
  $isPressing,
  $timeRatio,
  $cameraZoom
} from '../state';
import { transform } from './camera';
import { PLAYER_POS_CHANGE, PRESS_UP, emit, listen } from '../events';
import { vectorOp, vector } from '../utils';

listen(PRESS_UP, () => {
  const v = getReleaseVelocity();
  playerV.x = v.x;
  playerV.y = v.y;
});

export function getReleaseVelocity() {
  return vector(
    (pressDownPos.x - cursorPos.x) / 10,
    (cursorPos.y - pressDownPos.y) / 15,
  )
}

export default (ctx) => {
  // update position
  vectorOp((pos, v) => pos + v * $timeRatio.$, [playerPos, playerV], playerPos);
  emit(PLAYER_POS_CHANGE, playerPos);
  
  const estimateV = getReleaseVelocity();
  const { l, t } = getPlayerBoundary();
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform(vector(l, t)), transform(playerSize.x), transform(playerSize.y));
    
  // visualize velocity
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...transform(playerPos));
  ctx.lineTo(...transform(vectorOp((pos, v) => pos + v * 5, [playerPos, playerV])));
  ctx.stroke();
  
  if($isPressing.$) {
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(playerPos));
    ctx.lineTo(...transform(vectorOp((pos, v) => pos + v * 10, [playerPos, estimateV])));
    ctx.stroke();
  } 
};
