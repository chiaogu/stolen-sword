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
  playerV[0] = v[0];
  playerV[1] = v[1];
});

function getReleaseVelocity() {
  const factor = 5;
  return [
    (pressDownPos[0] - cursorPos[0]) / factor,
    (cursorPos[1] - pressDownPos[1]) / factor,
  ]
}

export default (ctx) => {
  // update position
  playerPos[0] += playerV[0] * $timeRatio.$;
  playerPos[1] += playerV[1] * $timeRatio.$; 
  emit(PLAYER_POS_CHANGE, playerPos);
  
  const estimateV = getReleaseVelocity();
  const [l, t] = getPlayerBoundary();
  
  // draw character
  ctx.fillStyle = '#fff';
  ctx.fillRect(...transform([l, t]), ...playerSize);
    
  // visualize velocity
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(...transform(playerPos));
  ctx.lineTo(...transform([
    playerPos[0] + playerV[0] * 5,
    playerPos[1] + playerV[1] * 5
  ]));
  ctx.stroke();
  
  if($isPressing.$) {
    // visualize force direction
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(playerPos));
    ctx.lineTo(...transform([
      playerPos[0] + estimateV[0] * 10,
      playerPos[1] + estimateV[1] * 10
    ]));
    ctx.stroke();
  } 
};
