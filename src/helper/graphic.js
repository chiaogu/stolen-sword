import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PROJECTILE_IS_COMSUMED,
  KEY_OBJECT_FRAME,
  KEY_GRAPHIC_IS_ANIMATION_FINISH
} from '../constants';
import {
  transform,
  $timeRatio,
  playerDamage,
  projectiles,
  cameraFrameSize
} from '../state';
import { object, getObjectBoundary, vector, vectorOp, getActionProgress } from '../utils';
import { easeInOutQuad, easeInOutCirc, easeInQuint, easeOutQuint, easeInQuad, easeOutQuad } from '../easing';

const graphic = (x, y, draw) => ({
  ...object(x, y, 0, 0),
  [KEY_OBJECT_ON_UPDATE]: [
    draw,
  ],
});

export const effect = (x, y, duration, draw) => graphic(x, y, (graphic, ctx) => {
  const progress = getActionProgress(graphic[KEY_OBJECT_FRAME], duration, false);
  if(progress >= 1) graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH] = true;
  if(!graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH]) draw(ctx, progress, graphic);
});

export const wipe = side => effect(0, 0, 2000, (ctx, progress) => {
  const x = cameraFrameSize.x - cameraFrameSize.x * Math.min(1, easeInQuad(progress / 0.25));
  const y = 0;
  const w = progress < 0.75 ? cameraFrameSize.x : cameraFrameSize.x * Math.max(0, 1 - easeOutQuad((progress - 0.75) / 0.25));
  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, w, cameraFrameSize.y)
})