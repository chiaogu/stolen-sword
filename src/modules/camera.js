import { pressingKeys, cameraCenter, cameraFrameSize, $cameraZoom, $isFocusingOnPlayer, playerSize, playerPos } from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';
import { vector, vectorOp } from '../utils';

const padding = vector(60, 60);

function focusOnPlayer() {
  vectorOp(playerPos => playerPos, [playerPos], cameraCenter);
}

function focusWhenOutOfScreen() {
  vectorOp(
    (playerPos, padding, cameraCenter, frameSize, playerSize) => {
      const offset = (frameSize / 2 - padding) / $cameraZoom.$;
      return Math.min(playerPos - playerSize + offset, Math.max(playerPos + playerSize - offset, cameraCenter));
    },
    [playerPos, padding, cameraCenter, cameraFrameSize, playerSize],
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

export function transform(value) {
  if(typeof value === 'number') {
    return value * $cameraZoom.$;
  } else {
    return [
      cameraFrameSize.x / 2 - (cameraCenter.x - value.x) * $cameraZoom.$,
      cameraFrameSize.y / 2 + (cameraCenter.y - value.y) * $cameraZoom.$,
    ];
  }
}

export default (ctx) => {
  // if($isPressing.$) {
  //   const vision = vectorOp(playerPos, getReleaseVelocity(), (pos, v) => pos + v * 5);
  //   vectorOp(vision, {}, pos => pos, cameraCenter);
  // }
  
  cameraFrameSize.x = ctx.canvas.width;
  cameraFrameSize.y = ctx.canvas.height;
  if(pressingKeys.has('w')) cameraCenter.y += 10;
  if(pressingKeys.has('a')) cameraCenter.x -= 10;
  if(pressingKeys.has('s')) cameraCenter.y -= 10;
  if(pressingKeys.has('d')) cameraCenter.x += 10;
  if(pressingKeys.has('q')) $cameraZoom.$ += 0.01;
  if(pressingKeys.has('e')) $cameraZoom.$ -= 0.01;
}