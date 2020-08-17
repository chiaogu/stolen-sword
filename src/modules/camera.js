import { cameraCenter, cameraFrameSize, $cameraZoom, $isFocusingOnPlayer, player } from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';
import { vector, vectorOp } from '../utils';

const padding = vector(60, 60);

function focusOnPlayer() {
  vectorOp(playerPos => playerPos, [player.p], cameraCenter);
}

function focusWhenOutOfScreen() {
  vectorOp(
    (playerPos, padding, cameraCenter, frameSize, playerSize) => {
      const offset = (frameSize / 2 - padding) / $cameraZoom.$;
      return Math.min(playerPos - playerSize + offset, Math.max(playerPos + playerSize - offset, cameraCenter));
    },
    [player.p, padding, cameraCenter, cameraFrameSize, player.s],
    cameraCenter
  );
}

listen(PLAYER_POS_CHANGE, () => {
  if($isFocusingOnPlayer.$) {
    focusOnPlayer();
  }
});

window.addEventListener('keydown', ({ key }) => {
  if(key === 'Shift') $isFocusingOnPlayer.$ = !$isFocusingOnPlayer.$;
});

export default (ctx) => {
  // if($isPressing.$) {
  //   const vision = vectorOp(playerPos, getReleaseVelocity(), (pos, v) => pos + v * 5);
  //   vectorOp(vision, {}, pos => pos, cameraCenter);
  // }
  
  cameraFrameSize.x = ctx.canvas.width;
  cameraFrameSize.y = ctx.canvas.height;
}