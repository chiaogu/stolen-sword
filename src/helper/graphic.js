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
  $backgroundV,
  $reflectionY,
  effects
} from '../state';
import { object, getObjectBoundary, vector, vectorOp, getActionProgress, alternateProgress, vectorMagnitude } from '../utils';
import { easeInOutQuad, easeInOutCirc, easeInQuint, easeOutQuint, easeInQuad, easeOutQuad, easeInOutQuart, easeInCirc, easeOutCirc } from '../easing';
import { display } from '../modules/display';
import { circular } from '../animation';

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

export const ripple = (x, y, maxR) => effect(x, y, 3000, (progress, graphic) => {
  graphic.p.x -= $backgroundV.$ * $timeRatio.$;
  const r = transform(maxR) * (progress + 0.1);
  const color = (a = 0) => `rgba(70,70,70,${a})`;
  const drawRipple = (ctx, colors, ...args) => {
    const grad = ctx.createRadialGradient(
      ...transform(graphic.p),
      r * progress,
      ...transform(graphic.p),
      r
    );
    colors.forEach(color => grad.addColorStop(...color));
    ctx.fillStyle = grad;
    ctx.lineWidth = transform(10) * easeInQuint(1 - progress);
    ctx.save();
    ctx.translate(0, transform(graphic.p)[1] * 0.7);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.ellipse(...transform(graphic.p), r, r, 0, ...args);
    ctx.fill();
    ctx.restore();  
  }
  
  draw(10, ctx => drawRipple(ctx, [
    [0.1, color()],
    [0.6, color(easeInQuint(1 - progress))],
    [0.61, color()],
  ], Math.PI, 2 * Math.PI));
  draw(52, ctx => drawRipple(ctx, [
    [0.6, color()],
    [0.61, color(easeInQuint(1 - progress))],
    [1, color()],
  ], 2 * Math.PI, Math.PI));
})

export const checkRipple = isUnderWater => object => {
  if(object[KEY_OBJECT_FRAME] > 0 && $reflectionY.$) {
    const isNowUnderWater = object.p.y - object.s.y / 2 <= 0;
    if(isUnderWater !== isNowUnderWater) {
      if(isUnderWater !== undefined) effects.push(ripple(object.p.x, 0, vectorMagnitude(object.v) * 5 + 100));
      isUnderWater = isNowUnderWater;
    }
  }
}

const background = (draw, v) => 
  Array(3).fill().map((_, i) => 
    graphic(i * DEFAULT_FRAME_WIDTH - DEFAULT_FRAME_WIDTH, 0, (graphic) => {
      if(graphic.p.x < DEFAULT_FRAME_WIDTH * -1.5 ) graphic.p.x = DEFAULT_FRAME_WIDTH * 1.5;
      else graphic.p.x-= v * $timeRatio.$ * $backgroundV.$; 
      draw(graphic.p.x - DEFAULT_FRAME_WIDTH / 2, i);
    }))
    
const bamboo = (x, y, h, amount, distance, zIndex, amplitude) => {
  const progress = Array(amount).fill().map(() => Math.random());
  const seeds = progress.map(() => Math.random());
  const lineDashes = seeds.map(seed => 30 * seed + 70, distance);
  const bright = 10 + 40 * easeInQuad(distance > 1 ? 0.5 : distance);
  const strokeStyle = `rgb(${bright}, ${bright}, ${bright})`;
  return offset => draw(zIndex, ctx => {
    ctx.strokeStyle = strokeStyle;
    for(let i = 0; i < amount; i++) {
      const seed = seeds[i];
      progress[i] = progress[i] >= 1 ? 0 : progress[i] + (0.0005 + 0.001 * seed) * $timeRatio.$;
      ctx.lineWidth = transform(2 + 10 * distance * (0.4 + 0.6 * seed), distance);
      ctx.setLineDash([transform(lineDashes[i]), 1]);
      ctx.beginPath();
      const rootX = x + offset + DEFAULT_FRAME_WIDTH / amount * i + 70 * seed;
      const rootY = y - 20 * seed;
      ctx.moveTo(...transform(vector(rootX, rootY), distance));
      ctx.quadraticCurveTo(
        ...transform(circular(
          rootX,
          rootY + h / 2,
          0,
          h / 8,
          progress[i]
        ), distance),
        ...transform(circular(
          rootX,
          rootY + h * 0.8 + h * seed * 0.2,
          amplitude / 2 + amplitude / 2 * seed,
          0,
          progress[i]
        ), distance)
      );
      ctx.stroke();
    }
  });
}

export const staticBamboo = (x, y, h, amount, distance, zIndex) => {
  const drawBamboo = bamboo(x - DEFAULT_FRAME_WIDTH / 2, y, h, amount, distance, zIndex, 50);
  return graphic(0, 0, () => drawBamboo(0));
}

export const movingBamboo = (x, y, h, amount, distance, zIndex = 10) => {
  const drawBamboo = Array(3).fill().map(() => bamboo(x, y, h, amount, distance, zIndex, 100));
  return background((offset, index) => {
    drawBamboo[index](offset);
  }, 2 * distance);
};

export const gradient = (y, h, z, colors) => graphic(0, 0, () => draw(z, ctx => {
  const grad = ctx.createLinearGradient(...transform(vector(0, y)), ...transform(vector(0, y - h)));
  colors.forEach(color => grad.addColorStop(...color));
  ctx.fillStyle = grad;
  // ctx.globalAlpha = 0.9;
  ctx.fillRect(
    ...transform(vector(-DEFAULT_FRAME_WIDTH, y)),
    transform(DEFAULT_FRAME_WIDTH * 2),
    transform(h)
  );
  ctx.globalAlpha = 1;
}));