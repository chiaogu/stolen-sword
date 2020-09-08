import {
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_FRAME,
  KEY_GRAPHIC_IS_ANIMATION_FINISH,
  SIDE_T,
  DEFAULT_FRAME_WIDTH,
} from '../constants';
import {
  transform,
  $timeRatio,
  cameraFrameSize,
  draw,
  $backgroundV,
  $reflectionY,
  effects,
  createLinearGradient,
  $backgroundColor,
  graphics,
  $theft
} from '../state';
import { object, vector, getActionProgress, vectorMagnitude, decompressPath } from '../utils';
import { easeInQuint, easeInQuad, easeOutQuad } from '../easing';
import { circular, slideIn } from '../animation';

export const graphic = (x, y, draw, animations = []) => ({
  ...object(x, y, 0, 0),
  [KEY_OBJECT_ON_UPDATE]: [
    graphic => graphic[KEY_OBJECT_FRAME] > 0 && draw(graphic),
    ...animations
  ],
});

const effect = (x, y, duration, draw) => graphic(x, y, (graphic) => {
  const progress = getActionProgress(graphic[KEY_OBJECT_FRAME], duration, false);
  if(progress >= 1) graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH] = true;
  if(!graphic[KEY_GRAPHIC_IS_ANIMATION_FINISH]) draw(progress, graphic);
});

export const wipe = () => effect(0, 0, 2400, (progress) => {
  draw(61, ctx => {
    const pos = cameraFrameSize.x - cameraFrameSize.x * Math.min(1, easeInQuad(progress / 0.3));
    const size = progress < 0.7 ? (cameraFrameSize.x + 10) : cameraFrameSize.x * Math.max(0, 1 - easeOutQuad((progress - 0.7) / 0.3));
    ctx.fillStyle = '#000';
    ctx.fillRect(pos, 0, size, cameraFrameSize.y)
  });
})

export const ripple = (x, y, maxR) => effect(x, y, 3000, (progress, graphic) => {
  graphic.p.x -= $backgroundV.$ * $timeRatio.$;
  const r = transform(maxR) * progress;
  const color = (a = 0) => `rgba(70,90,110,${a})`;
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
  if(object[KEY_OBJECT_FRAME] > 0 && $reflectionY.$ !== undefined) {
    const isNowUnderWater = object.p.y - object.s.y / 2 <= 0;
    if(isUnderWater !== isNowUnderWater) {
      if(isUnderWater !== undefined && effects.length < 10) effects.push(ripple(object.p.x, $reflectionY.$, vectorMagnitude(object.v) * 5 + 100));
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
  const lineDashes = seeds.map(seed => 40 * seed + 120 * (distance / 1.5));
  const bright = 180 + 60 * (distance > 1 ? -0.3 : easeOutQuad(1 - distance));
  const strokeStyle = `rgb(${bright * 0.82}, ${bright}, ${bright * 0.96})`;
  return offset => draw(zIndex, ctx => {
    ctx.strokeStyle = strokeStyle;
    for(let i = 0; i < amount; i++) {
      const seed = seeds[i];
      progress[i] = progress[i] >= 1 ? 0 : progress[i] + (0.0005 + 0.001 * seed) * $timeRatio.$;
      ctx.lineWidth = transform(2 + 10 * distance * (0.4 + 0.6 * seed), distance);
      ctx.setLineDash([transform(lineDashes[i]), transform(1.5)]);
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
      ctx.globalAlpha = distance > 1 ? 0.6 : 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.setLineDash([]);
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

export const gradient = (y, h, z, distance, colors, depth) => graphic(0, 0, () => draw(z, ctx => {
  const grad = createLinearGradient(y, h, colors, distance, depth);
  ctx.fillStyle = grad;
  ctx.fillRect(
    0, transform(vector(0, y), distance)[1],
    cameraFrameSize.x * 2,
    transform(h, depth ? distance : undefined)
  );
}));

const mountainSprite = decompressPath(`	qaK^LWZMGGOWGOGGO`);
mountainSprite.p[0].y = mountainSprite.p[mountainSprite.p.length - 1].y;
const getMountainColor = (bright, distance, a = 1) => `rgba(${bright * (0.64 + 0.3 * (1 - distance / 0.3))}, ${bright * (0.8 + 0.1 * (1 - distance / 0.3))}, ${bright}, ${a})`;
const drawMountain = (x, y, z, scale = 1, distance, fillGradient = true) => {
  let bright = 157 + 70 * (1 - distance / 0.4);
  draw(z, ctx => {
    ctx.fillStyle = fillGradient ? createLinearGradient(y + 400 * (1 - distance / 0.4),  -mountainSprite.h, [
      [0, getMountainColor(bright * 0.9, distance)],
      [0.1, getMountainColor(bright, distance)]
    ], distance) : getMountainColor(bright, distance);
    ctx.beginPath();
    mountainSprite.p.forEach(p => {
      ctx.lineTo(...transform(vector((x + p.x) * scale, (y + p.y + mountainSprite.h / 2) * scale), distance));
    })
    ctx.fill();
    
    if($reflectionY.$ != undefined) {
      ctx.fillStyle = createLinearGradient(y + 500 * (1 - distance / 0.35),  mountainSprite.h, [
        [0, getMountainColor(bright * 0.8, distance)],
        [0.1, getMountainColor(bright * 0.9, distance)],
        [1, getMountainColor(bright * 0.9, distance, 0.3)],
      ], distance);
      ctx.beginPath();
      mountainSprite.p.forEach(p => {
        ctx.lineTo(...transform(vector((x + p.x) * scale, (y - p.y - mountainSprite.h / 2 + 56) * scale), distance));
      })
      ctx.fill();
    }
  })  
}

export const staticMountain = (x, y, z, distance, scale) => 
  graphic(x, y,
    () => drawMountain(x, y, z, scale, distance, false)
  )

export const movingMountain = (x, y, z, distance = 1, scale = 1) => background((offset, index) => {
  drawMountain(x + offset + 100 * index, y, z, scale, distance);
}, $backgroundV.$)

export const letterBox = () => {
  const height = transform(83);
  const drawLetterbox = graphic => draw(61, ctx => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, graphic.p.y, cameraFrameSize.x + 5, height);
  });
  return [
    graphic(0, 0, drawLetterbox, [slideIn(3000, 0, -height)]),
    graphic(0, cameraFrameSize.y - height, drawLetterbox, [slideIn(3000, 0, cameraFrameSize.y)]),
  ]
}

export const drawCaption = text => draw(62, ctx => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineWidth = transform(0.5);
  ctx.fillStyle = '#eec918';
  ctx.strokeStyle = '#000';
  ctx.font = `${transform(24)}px serif`;
  const args = [text, cameraFrameSize.x / 2, cameraFrameSize.y - transform(120)];
  ctx.fillText(...args);
  ctx.strokeText(...args);
});

export const summonTheft = (x, y, z) => () => graphics.push($theft.$ = graphic(x, y, graphic => draw(z, ctx => {
  ctx.fillStyle = '#f00';
  ctx.fillRect(...transform(graphic.p), transform(20), transform(20));
}), [checkRipple()]));

export const moveTheft = (x, y) => {
  $theft.$.p.x = x;
  $theft.$.p.y = y;
}