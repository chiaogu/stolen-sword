import { pressingKeys, cameraCenter, cameraFrameSize, $cameraZoom, $isFocusingOnPlayer } from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';

listen(PLAYER_POS_CHANGE, pos => {
  if(!$isFocusingOnPlayer.$) return;
  cameraCenter[0] = pos[0];
  cameraCenter[1] = pos[1];
});

export function transform(vector) {
  return [
    (cameraFrameSize[0] / 2 - cameraCenter[0] + vector[0]) * $cameraZoom.$,
    (cameraFrameSize[1] / 2 + cameraCenter[1] - vector[1]) * $cameraZoom.$,
  ];
}

export default (ctx) => {
  $isFocusingOnPlayer.$ = !pressingKeys.has('Shift');
  if(pressingKeys.has('W')) cameraCenter[1] += 10;
  if(pressingKeys.has('A')) cameraCenter[0] -= 10;
  if(pressingKeys.has('S')) cameraCenter[1] -= 10;
  if(pressingKeys.has('D')) cameraCenter[0] += 10;
}