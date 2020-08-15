import{
  playerPos,
  playerV,
  playerSize,
  getPlayerBoundary,
  pressDownPos,
  cursorPos,
  $isPressing,
  $timeRatio
} from '../state';
import { transform } from './camera';
import { PLAYER_POS_CHANGE, PRESS_UP, emit, listen } from '../events';

listen(PRESS_UP, () => {
  const v = getReleaseVelocity();
  playerV.x = v[0];
  playerV.y = v[1];
});

function getReleaseVelocity() {
  const factor = 5;
  return [
    (pressDownPos.x - cursorPos.x) / factor,
    (cursorPos.y - pressDownPos.y) / factor,
  ]
}

export default (ctx) => {
  // update position
  playerPos.x += playerV.x * $timeRatio.$;
  playerPos.y += playerV.y * $timeRatio.$; 
  emit(PLAYER_POS_CHANGE, playerPos);
  
  const estimateV = getReleaseVelocity();
  const { l, t } = getPlayerBoundary();
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform([l, t]), transform(playerSize.x), transform(playerSize.y));
    
  // visualize velocity
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...transform(playerPos));
  ctx.lineTo(...transform([
    playerPos.x + playerV.x * 5,
    playerPos.y + playerV.y * 5
  ]));
  ctx.stroke();
  
  if($isPressing.$) {
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(playerPos));
    ctx.lineTo(...transform([
      playerPos.x + estimateV[0] * 10,
      playerPos.y + estimateV[1] * 10
    ]));
    ctx.stroke();
  } 
};
