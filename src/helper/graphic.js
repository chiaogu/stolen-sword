import {
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_FRAME,
  KEY_GRAPHIC_IS_ANIMATION_FINISH,
  SIDE_T,
  DEFAULT_FRAME_WIDTH,
  POSE_CHARGE,
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
  $theft,
  pressDownPos,
  needTutorial,
  $stage,
  $isPressing,
  enemies,
  $titleY
} from '../state';
import { object, vector, getActionProgress, vectorMagnitude, decompressPath, rotate, lerp } from '../utils';
import { easeInQuint, easeInQuad, easeOutQuad, easeInOutQuint, easeOutQuint, easeInOutQuad } from '../easing';
import { circular, slideIn } from '../animation';

export const graphic = (x, y, draw, animations = []) => ({
  ...object(x, y, 0, 0),
  [KEY_OBJECT_ON_UPDATE]: [
    graphic => graphic[KEY_OBJECT_FRAME] > 0 && draw(graphic),
    ...animations
  ],
});

export const effect = (x, y, duration, draw) => graphic(x, y, (graphic) => {
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
    if(distance < 1 || index !== 1) drawBamboo[index](offset);
  }, (distance > 1 ? 3 : 2) * distance);
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

const mountainImg = decompressPath(`	qaK^LWZMGGOWGOGGO`);
mountainImg.p[0].y = mountainImg.p[mountainImg.p.length - 1].y;
const getMountainColor = (bright, distance, a = 1) => `rgba(${bright * (0.64 + 0.3 * (1 - distance / 0.3))}, ${bright * (0.8 + 0.1 * (1 - distance / 0.3))}, ${bright}, ${a})`;
const drawMountain = (x, y, z, scale = 1, distance, fillGradient = true) => {
  let bright = 157 + 70 * (1 - distance / 0.4);
  draw(z, ctx => {
    ctx.fillStyle = fillGradient ? createLinearGradient(y + 400 * (1 - distance / 0.4),  -mountainImg.h, [
      [0, getMountainColor(bright * 0.9, distance)],
      [0.1, getMountainColor(bright, distance)]
    ], distance) : getMountainColor(bright, distance);
    ctx.beginPath();
    mountainImg.p.forEach(p => {
      ctx.lineTo(...transform(vector((x + p.x) * scale, (y + p.y + mountainImg.h / 2) * scale), distance));
    })
    ctx.fill();
    
    if($reflectionY.$ != undefined) {
      ctx.fillStyle = createLinearGradient(y + 500 * (1 - distance / 0.35),  mountainImg.h, [
        [0, getMountainColor(bright * 0.8, distance)],
        [0.1, getMountainColor(bright * 0.9, distance)],
        [1, getMountainColor(bright * 0.9, distance, 0.3)],
      ], distance);
      ctx.beginPath();
      mountainImg.p.forEach(p => {
        ctx.lineTo(...transform(vector((x + p.x) * scale, (y - p.y - mountainImg.h / 2 + 56) * scale), distance));
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
  ctx.setLineDash([]);
  ctx.lineWidth = transform(0.7);
  ctx.fillStyle = '#eec918';
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.font = `${transform(22)}px serif`;
  const args = [text, cameraFrameSize.x / 2, cameraFrameSize.y - transform(120)];
  ctx.fillText(...args);
  ctx.strokeText(...args);
});

export const summonTheft = (x, y, z) => () => {
  const skeleton = createSkeletion();
  $theft.$ = [graphic(x, y, graphic => draw(z, ctx => {
    skeleton.p($theft.$[2]);
    skeleton.d(ctx, graphic.p, ['#8a302c', '#DB6157', '#e8e8e8', '#a4413d', '#c57777'], $theft.$[1], $theft.$[3]);
    ['33', '66', '88', 'c4', '00', '11']
  }), [checkRipple()]), 1, POSE_CHARGE, 1]
  graphics.push($theft.$[0]);
};

export const moveTheft = (x, y, facing = 1, pose = POSE_CHARGE, flip = 1) => {
  $theft.$[0].p.x = x;
  $theft.$[0].p.y = y;;
  $theft.$[1] = facing;
  $theft.$[2] = pose;
  $theft.$[3] = flip;
}

export function drawPath(ctx, img, color, offset, angle, facing, flip, func = 'fill') {
  ctx[`${func}Style`] = color;
  ctx.beginPath();
  img.p.forEach(p => {
    ctx.lineTo(...transform(rotate(offset, vector(p.x * facing + offset.x, p.y * flip + offset.y), angle)));
  })
  ctx[func]();
}

const hatImg = decompressPath(`4#+};K1BLild`, -105, -35, 0.108);
const faceImg = decompressPath(`F[is'4N`, -43, -30, 0.141);
const bodyImg = decompressPath(`ge_G?>GOE4/'~`, -35, -170, 0.109);
const rightThigh = decompressPath(`reks&<?;GGK`, -20, 70, 0.108);
const rightCalf = decompressPath(`p'>GDJGG;OJge~`, -50, -115, 0.1);
const leftThigh = decompressPath(`,te{%=DODOEJ`, -63, 55, 0.1);
const leftCalf = decompressPath(`+;Lcgk}r+5G;MGO`, -57, 60, 0.1);
const leftHand = decompressPath(` )nN/`, -15, -20, 0.102);
const leftUpperArm = decompressPath(`WLjKl&G>=`, -27, 13, 0.108);
const rightHand = decompressPath(`,.+Eek"`, -70, -45, 0.1145);
const rightUpperArm = decompressPath('+??=OO`Od#', -37, -90, 0.103);
const sword = decompressPath(`aAeA%B!%''''cggggc`, -113, 10, 0.216);

export function createSkeletion() {
  const body = [vector(0, 11.9), 0];
  const head = [vector(0, 12.7), 0];
  const rightLeg = [vector(-2.3, -6.7), 0];
  const leftLeg = [vector(1.9, -7), 0];
  const rightArm = [vector(-5.2, 5.1), 0];
  const leftArm = [vector(5.6, 5.8), 0];
  const leftKnee = [vector(2.9, -12), 0];
  const rightKnee = [vector(-0.8, -11.9), 0];
  const swordJoint = [vector(3.9, -14), -1.124];
  
  const j = [body, head, rightLeg, leftLeg, rightArm, leftArm, leftKnee, rightKnee, swordJoint];
  
  const p = [
    [leftUpperArm, 0, [j[0], j[5]]],
    [sword, 1, [j[0], j[5], j[8]]],
    [leftHand, 2, [j[0], j[5], [vector(3,-13.7), 0, j[5]]]],
    [bodyImg, 3, [j[0]]],
    [faceImg, 2, [j[0], j[1]]],
    [hatImg, 3, [j[0], j[1], [vector(0.2, 3), 0, j[1]]]],
    [leftCalf, 3, [j[0], j[3], j[6]]],
    [leftThigh, 3, [j[0], j[3]]],
    [rightCalf, 3, [j[0], j[2], j[7]]],
    [rightThigh, 3, [j[0], j[2]]],
    [rightUpperArm, 4, [j[0], j[4]]],
    [rightHand, 2, [j[0], j[4], [vector(0.4, -16.3), 0, j[4]]]]
  ];
  
  return {
    j,
    d: (ctx, center, colors, facing = 1, flip = 1) => p.forEach(([img, colorIndex, joints]) => {
      const rotationDirection = (facing / Math.abs(facing)) * (flip / Math.abs(flip));
      let pos = vector(center.x, center.y);
      joints.forEach(([offset], index) => {
        const prevPos = vector(pos.x, pos.y);
        pos.x += offset.x * facing;
        pos.y += offset.y * flip;
        if(index > 0) pos = rotate(prevPos, pos, joints[index - 1][1] * rotationDirection);
      })
      const angle = joints[joints.length - 1][2] ? joints[joints.length - 1][2][1] : joints[joints.length - 1][1];
      drawPath(ctx, img, colors[colorIndex], pos, angle * rotationDirection, facing, flip); 
    }),
    p: angles => angles.forEach((angle, index) => j[index][1] = angle)
  };
}

export function drawDragTrack(fromX, fromY, toX, toY, opacity = 0.2) {
  draw(61, ctx => {
    // visualize drag track
    const grad = ctx.createLinearGradient(fromX, fromY, toX, toY);
    grad.addColorStop(0, `rgba(255,255,255,${opacity})`);
    grad.addColorStop(0.75, `rgba(255,255,255,0)`);
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.lineCap = 'butt';
  });
}

const LETTER_S = `4DUME<#`;
const LETTER_O = `r":<FDOJa`;
const scale = 0.6;
const letters = [
  decompressPath(LETTER_S, -10, 0, scale),
  decompressPath(`	 'fe%`, -70, 85, scale),
  decompressPath(LETTER_O, -150, 88, scale),
  decompressPath(`#`, -230, 97, scale),
  decompressPath(`%c#c`, -275, 90, scale),
  decompressPath(`GOOM`, -290, 90, scale),
  decompressPath(LETTER_S, -340, 0, scale),
  decompressPath(`GGGE|GFNL`, -380, 5, scale),
  decompressPath(LETTER_O, -500, 88, scale),
  decompressPath(`[BD3OML`, -545, 95, scale),
  decompressPath(`[UFF?,`, -580, 90, scale)
];

export function drawTitle(opacity) {
  draw(61, ctx => {
    const color = `#fff`;
    ctx.lineJoin = 'bevel';
    ctx.lineWidth = easeInQuad(opacity) * transform(3);
    ctx.setLineDash([50 * easeInOutQuint(opacity), transform(100) * easeInOutQuad(1 - opacity)])
    letters.forEach(img => drawPath(ctx, img, color, vector(-160, $titleY.$), 0, 1, 1, 'stroke'));
    ctx.lineJoin = 'miter';
  })
}