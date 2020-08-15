import { pressingKeys, cameraCenter, cameraFrameSize, $cameraZoom, $isFocusingOnPlayer } from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';

listen(PLAYER_POS_CHANGE, pos => {
  if(!$isFocusingOnPlayer.$) return;
  cameraCenter.x = pos.x;
  cameraCenter.y = pos.y;
});

export function transform(value) {
  if(typeof value === 'number') {
    return value * $cameraZoom.$;
  } else if(Array.isArray(value)) {
    return [
      (cameraFrameSize.x / 2 - cameraCenter.x + value[0]) * $cameraZoom.$,
      (cameraFrameSize.y / 2 + cameraCenter.y - value[1]) * $cameraZoom.$,
    ];
  } else {
    return [
      (cameraFrameSize.x / 2 - cameraCenter.x + value.x) * $cameraZoom.$,
      (cameraFrameSize.y / 2 + cameraCenter.y - value.y) * $cameraZoom.$,
    ];
  }
}

export default (ctx) => {
  cameraFrameSize.x = ctx.canvas.width;
  cameraFrameSize.y = ctx.canvas.height;
  $isFocusingOnPlayer.$ = !pressingKeys.has('Shift');
  if(pressingKeys.has('W')) cameraCenter.y += 10;
  if(pressingKeys.has('A')) cameraCenter.x -= 10;
  if(pressingKeys.has('S')) cameraCenter.y -= 10;
  if(pressingKeys.has('D')) cameraCenter.x += 10;
}