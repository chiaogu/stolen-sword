import {
  cameraCenter,
  cameraFrameSize,
  $cameraZoom,
  pressingKeys,
  $cameraLoop,
} from '../state';
import { PLAYER_POS_CHANGE, listen } from '../events';

listen(PLAYER_POS_CHANGE, () => {
  if($cameraLoop.$) $cameraLoop.$();
});

export default (ctx) => {
  cameraFrameSize.x = Math.floor(ctx.canvas.width / window.devicePixelRatio);
  cameraFrameSize.y = Math.floor(ctx.canvas.height / window.devicePixelRatio);

  if (pressingKeys.has('w')) cameraCenter.y += 10;
  if (pressingKeys.has('a')) cameraCenter.x -= 10;
  if (pressingKeys.has('s')) cameraCenter.y -= 10;
  if (pressingKeys.has('d')) cameraCenter.x += 10;
  if (pressingKeys.has('q')) $cameraZoom.$ += 0.01;
  if (pressingKeys.has('e')) $cameraZoom.$ -= 0.01;
};
