import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PROJECTILE_IS_COMSUMED,
  KEY_OBJECT_FRAME,
  KEY_GRAPHIC_IS_ANIMATION_FINISH,
  SIDE_R,
  SIDE_T,
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT
} from '../constants';
import {
  transform,
  $timeRatio,
  playerDamage,
  projectiles,
  cameraFrameSize,
  detransform,
  graphics
} from '../state';
import { object, getObjectBoundary, vector, vectorOp, getActionProgress } from '../utils';
import { easeInOutQuad, easeInOutCirc, easeInQuint, easeOutQuint, easeInQuad, easeOutQuad } from '../easing';
import { display } from '../modules/display';

const graphic = (x, y, draw) => ({
  ...object(x, y, 0, 0),
  [KEY_OBJECT_ON_UPDATE]: [
    draw,
  ],
});

const effect = (x, y, duration, draw) => graphic(x, y, (graphic, ctx) => {
  const progress = getActionProgress(graphic[KEY_OBJECT_FRAME], duration, false);
  if(progress >= 1) graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH] = true;
  if(!graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH]) draw(ctx, progress, graphic);
});

export const wipe = side => effect(0, 0, 2000, (ctx, progress) => {
  const axis = side === SIDE_T ? 'y' : 'x';
  const pos = cameraFrameSize[axis] - cameraFrameSize[axis] * Math.min(1, easeInQuad(progress / 0.25));
  const size = progress < 0.75 ? cameraFrameSize[axis] : cameraFrameSize[axis] * Math.max(0, 1 - easeOutQuad((progress - 0.75) / 0.25));
  ctx.fillStyle = '#000';
  if(side === SIDE_T) {
    ctx.fillRect(0, pos, cameraFrameSize.x, size)
  } else {
    ctx.fillRect(pos, 0, size, cameraFrameSize.y)
  }
})

const background = (draw, v) => 
  Array(3).fill().map((_, i) => 
    graphic(i * DEFAULT_FRAME_WIDTH - DEFAULT_FRAME_WIDTH, 0, (graphic, ctx) => {
      if(graphic.p.x < DEFAULT_FRAME_WIDTH * -1.5 ) graphic.p.x = DEFAULT_FRAME_WIDTH * 1.5;
      else graphic.p.x-= v * $timeRatio.$; 
      draw(ctx, graphic.p.x - DEFAULT_FRAME_WIDTH / 2, i);
    }))

export const bamboo = (x, y, amount, distance) => {
  const sectionHeight = 50;
  const sections = 25;
  const minSections = 12;
  const amountSeed = Array(3).fill().map(() => Array(amount).fill().map(() => Math.random()));
  return background((ctx, offset, index) => {
    const bright = 20 + 80 * easeInQuad(distance);
    ctx.strokeStyle = `rgb(${bright}, ${bright}, ${bright})`;
    ctx.lineWidth = transform(5 + 5 * distance, distance);
    for(let i = 0; i < amount; i++) {
      const seed = amountSeed[index][i];
      ctx.beginPath();
      for(let j = 0; j < minSections + (sections - minSections) * seed; j++) {
        ctx.setLineDash([transform(30 * seed + 70, distance), transform(1, distance)]);
        ctx.lineTo(...transform(vector(x + offset + DEFAULT_FRAME_WIDTH / amount * i + 30 * seed + (seed < 0.5 ? easeInQuad : easeOutQuad)(j) * (0.1 * seed + 0.1), y + sectionHeight * j), distance));
      }
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  }, 2 * distance);
};