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
  graphics,
  draw,
  $backgroundV
} from '../state';
import { object, getObjectBoundary, vector, vectorOp, getActionProgress, alternateProgress } from '../utils';
import { easeInOutQuad, easeInOutCirc, easeInQuint, easeOutQuint, easeInQuad, easeOutQuad } from '../easing';
import { display } from '../modules/display';

const graphic = (x, y, draw) => ({
  ...object(x, y, 0, 0),
  [KEY_OBJECT_ON_UPDATE]: [
    draw,
  ],
});

const effect = (x, y, duration, draw) => graphic(x, y, (graphic) => {
  const progress = getActionProgress(graphic[KEY_OBJECT_FRAME], duration, false);
  if(progress >= 1) graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH] = true;
  if(!graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH]) draw(progress, graphic);
});

export const wipe = side => effect(0, 0, 2000, (progress) => {
  draw(61, ctx => {
    const axis = side === SIDE_T ? 'y' : 'x';
    const pos = cameraFrameSize[axis] - cameraFrameSize[axis] * Math.min(1, easeInQuad(progress / 0.25));
    const size = progress < 0.75 ? cameraFrameSize[axis] : cameraFrameSize[axis] * Math.max(0, 1 - easeOutQuad((progress - 0.75) / 0.25));
    ctx.fillStyle = '#000';
    if(side === SIDE_T) {
      ctx.fillRect(0, pos, cameraFrameSize.x, size)
    } else {
      ctx.fillRect(pos, 0, size, cameraFrameSize.y)
    }
  });
})

const background = (draw, v) => 
  Array(3).fill().map((_, i) => 
    graphic(i * DEFAULT_FRAME_WIDTH - DEFAULT_FRAME_WIDTH, 0, (graphic) => {
      if(graphic.p.x < DEFAULT_FRAME_WIDTH * -1.5 ) graphic.p.x = DEFAULT_FRAME_WIDTH * 1.5;
      else graphic.p.x-= v * $timeRatio.$ * $backgroundV.$; 
      draw(graphic.p.x - DEFAULT_FRAME_WIDTH / 2, i);
    }))
    
const bamboo = (x, y, h, amount, distance, zIndex, amplitude) => {
  const sectionHeight = 50;
  const sections = h / sectionHeight;
  const minSections = h / sectionHeight * 0.8;
  const amountSeed = Array(amount).fill().map(() => Math.random());
  const progress = Array(amount).fill(0);
  return offset => draw(zIndex, ctx => {
    const bright = 10 + 50 * easeInQuad(distance > 1 ? 0.7 : distance);
    ctx.strokeStyle = `rgb(${bright}, ${bright}, ${bright})`;
    ctx.lineWidth = transform(8 + 2 * distance, distance);
    for(let i = 0; i < amount; i++) {
      const seed = amountSeed[i];
      progress[i] = progress[i] >= 1 ? 0 : progress[i] + 0.001 + 0.002 * seed;
      ctx.beginPath();
      for(let j = 0; j < minSections + (sections - minSections) * seed; j++) {
        ctx.setLineDash([transform(30 * seed + 70, distance), transform(1, distance)]);
        ctx.lineTo(...transform(vector(x + offset + DEFAULT_FRAME_WIDTH / amount * i + 50 * seed + (seed < 0.5 ? easeInQuad : easeOutQuad)(j) * (easeInOutQuad(alternateProgress(progress[i])) * amplitude / 2 * seed + amplitude / 2), y + sectionHeight * j - 10 * seed), distance));
      }
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  });
}

export const staticBamboo = (x, y, h, amount, distance, zIndex, amplitude) => {
  const drawBamboo = bamboo(x - DEFAULT_FRAME_WIDTH / 2, y, h, amount, distance, zIndex, amplitude);
  return graphic(0, 0, () => drawBamboo(0));
}

export const movingBamboo = (x, y, h, amount, distance, zIndex=10, amplitude=0.2) => {
  const drawBamboo = Array(3).fill().map(() => bamboo(x, y, h, amount, distance, zIndex, amplitude));
  return background((offset, index) => {
    drawBamboo[index](offset);
  }, 2 * distance);
};