import {
  cameraFrameSize,
  $cameraZoom,
  pressingKeys,
  player,
} from '../state';

export default (ctx) => {
  cameraFrameSize.x = Math.floor(ctx.canvas.width / window.devicePixelRatio);
  cameraFrameSize.y = Math.floor(ctx.canvas.height / window.devicePixelRatio);

  if (pressingKeys.has('w')) player.v.y = 10;
  if (pressingKeys.has('a')) player.v.x = -5;
  if (pressingKeys.has('s')) player.v.y = -10;
  if (pressingKeys.has('d')) player.v.x = 5;
  if (pressingKeys.has('q')) $cameraZoom.$ += 0.01;
  if (pressingKeys.has('e')) $cameraZoom.$ -= 0.01;
};
