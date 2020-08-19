import {
  cameraCenter,
  cameraFrameSize,
  $cameraZoom,
  $cameraType,
  player,
  pressingKeys,
  cameraFramePadding,
} from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';
import { vectorOp } from '../utils';
import {
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
  CAMERA_TYPE_FOCUS_ON_PLAYER,
  CAMERA_TYPE_GOD_MODE,
} from '../constants';


function focusOnPlayer() {
  vectorOp((playerPos) => playerPos, [player.p], cameraCenter);
}

function focusWhenOutOfScreen() {
  vectorOp(
    (playerPos, padding, cameraCenter, frameSize, playerSize) => {
      const offset = (frameSize / 2 - padding) / $cameraZoom.$;
      return Math.min(
        playerPos - playerSize + offset,
        Math.max(playerPos + playerSize - offset, cameraCenter)
      );
    },
    [player.p, cameraFramePadding, cameraCenter, cameraFrameSize, player.s],
    cameraCenter
  );
}

listen(PLAYER_POS_CHANGE, () => {
  if ($cameraType.$ === CAMERA_TYPE_FOCUS_ON_PLAYER) {
    focusOnPlayer();
  } else if ($cameraType.$ === CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN) {
    focusWhenOutOfScreen();
  }
});

let tempType;
window.addEventListener('keydown', ({ key }) => {
  if (key === 'Shift') {
    if ($cameraType.$ === CAMERA_TYPE_GOD_MODE) {
      $cameraType.$ = tempType;
    } else {
      tempType = $cameraType.$;
      $cameraType.$ = CAMERA_TYPE_GOD_MODE;
    }
  }
});

export default (ctx) => {
  cameraFrameSize.x = ctx.canvas.width;
  cameraFrameSize.y = ctx.canvas.height;

  if (pressingKeys.has('w')) cameraCenter.y += 10;
  if (pressingKeys.has('a')) cameraCenter.x -= 10;
  if (pressingKeys.has('s')) cameraCenter.y -= 10;
  if (pressingKeys.has('d')) cameraCenter.x += 10;
  if (pressingKeys.has('q')) $cameraZoom.$ += 0.01;
  if (pressingKeys.has('e')) $cameraZoom.$ -= 0.01;
};
