import {
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_PLAYER_DEATH_FRAME,
  PLAYER_DEATH_ANIMATION_DURATION,
} from '../constants';
import { checkRipple } from '../helper/graphic';
import { setStage } from '../helper/stage';
import {
  $dash,
  $g,
  $health,
  $isPressing,
  $stageIndex,
  $stageWave,
  $timeRatio,
  draw,
  getReflection,
  isAbleToDash,
  isPlayerInvincibleAfterDamage,
  isReleaseVelocityEnough,
  player,
  playerTrajectory,
  transform,
  $cameraLoop,
  $reflectionGradient,
  pressingKeys,
} from '../state';
import {
  getActionProgress,
  getObjectBoundary,
  objectEvent,
  vector,
  vectorOp,
  decompressPath,
} from '../utils';

function drawPath(ctx, img, color, offset, scale) {
  ctx.fillStyle = color;
  ctx.beginPath();
  img.p.forEach(p => {
    ctx.lineTo(...transform(vector(p.x * scale + offset.x, p.y * scale + offset.y)));
  })
  ctx.fill();
}

const rotate = (center, pos, angle) => {
  const cos = Math.cos(angle * 2 * Math.PI);
  const sin = Math.sin(angle * 2 * Math.PI);
  return vector(
    (cos * (pos.x - center.x)) + (sin * (pos.y - center.y)) + center.x,
    (cos * (pos.y - center.y)) - (sin * (pos.x - center.x)) + center.y
  )
}

// let i = 0;
// window.addEventListener('keydown', ({ key }) => {
//   if(key === '2') i = (i + 1) % parts.length;
// });
// setInterval(() => {
//   draw(0, () => {
//     if (pressingKeys.has('i')) parts[i][2][parts[i][2].length - 1].y += 0.1;
//     if (pressingKeys.has('j')) parts[i][2][parts[i][2].length - 1].x += -0.1;
//     if (pressingKeys.has('k')) parts[i][2][parts[i][2].length - 1].y += -0.1;
//     if (pressingKeys.has('l')) parts[i][2][parts[i][2].length - 1].x += 0.1;
//     if (pressingKeys.has('u')) parts[i][3] += 0.001;
//     if (pressingKeys.has('o')) parts[i][3] -= 0.001;
//     console.log(i, parts[i][2][parts[i][2].length - 1], parts[i][3])
//   })
// }, 16);

const hatImg = decompressPath(`4#+};K1BLild`);
const faceImg = decompressPath(`F[is'4N`);
const bodyImg = decompressPath(`ge_G?>GOE4/'~`);
const rightThigh = decompressPath(`reks&<?;GGK`);
const rightCalf = decompressPath(`lWHG??GDMG'"ve`);
const leftThigh = decompressPath(`,te{%=DODOEJ`);
const leftCalf = decompressPath(`+;Lcgk}r+5G;MGO`);
const leftHand = decompressPath(` )nN/`);
const leftUpperArm = decompressPath(`WLjKl&G>=`);
const rightHand = decompressPath(`,.+Eek"`);
const rightUpperArm = decompressPath('+??=OO`Od#');
const sword = decompressPath(`aAeA%B!%''''cggggc`);

const body = vector(3, 28);
const head = vector(2.8, -1.6);
const rightLeg = vector(-5, -31);
const leftLeg = vector(4, -29.5);
const rightArm = vector(-5.2, -5.1);
const leftArm = vector(4.3, -16.6);

const parts = [
  [sword, '#111', [body, rightArm, vector(37, -26.4)], 0.216],
  [leftUpperArm, '#666', [body, leftArm], 0.108],
  [leftHand, '#c4c4c4', [body, leftArm, vector(1.4, -10.2)], 0.102],
  [bodyImg, '#333', [body], 0.109],
  [faceImg, '#c4c4c4', [body, head], 0.141],
  [hatImg, '#333', [body, head, vector(5.5, 2.8)], 0.108],
  [leftCalf, '#333', [body, leftLeg, vector(2.4, -11.7)], 0.1],
  [leftThigh, '#333', [body, leftLeg], 0.1],
  [rightCalf, '#333', [body, rightLeg, vector(0.3, 6.8)], 0.1],
  [rightThigh, '#333', [body, rightLeg], 0.108],
  [rightUpperArm, '#888', [body, rightArm], 0.103],
  [rightHand, '#c4c4c4', [body, rightArm, vector(4.8, -20.5)], 0.1145]
];

const drawParts = (ctx, player) => parts.forEach(([img, color, joints, scale]) => {
  const offset = vectorOp(
    (playerPos, ...offsets) => playerPos + offsets.reduce((sum, v) => sum + v, 0),
    [player.p, ...joints]
  );
  drawPath(ctx, img, color, offset, scale); 
});

function drawCharacter(ctx, player) {
  // if (isPlayerInvincibleAfterDamage()) {
  //   ctx.fillStyle =
  //     Math.round(player[KEY_OBJECT_FRAME]) % 8 > 3
  //       ? 'rgba(255,255,255, 0.1)'
  //       : '#000';
  // } else if ($dash.$ === 0) {
  //   ctx.fillStyle = '#444';
  // } else {
  //   ctx.fillStyle = '#000';
  // }
  // ctx.strokeStyle = '#000';
  // const { l, t } = getObjectBoundary(player);
  // ctx.strokeRect(...transform(vector(l, t)), transform(player.s.x), transform(player.s.y));
  
  drawParts(ctx, player);
}

const getPlayerDeathProgress = player => Math.min(1, getActionProgress(
  player[KEY_OBJECT_FRAME] - player[KEY_PLAYER_DEATH_FRAME],
  PLAYER_DEATH_ANIMATION_DURATION,
  false
)) || 0;

function drawTrajectory(ctx, player) {
  // visualize velocity
  ctx.strokeStyle = '#f0f';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(...transform(player.p));
  ctx.lineTo(
    ...transform(vectorOp((pos, v) => pos + v * 5, [player.p, player.v]))
  );
  ctx.stroke();

  if ($isPressing.$ && isAbleToDash()) {
    ctx.strokeStyle = `rgba(0,255,0,${isReleaseVelocityEnough() ? 1 : 0})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...transform(player.p));
    playerTrajectory().forEach((pos) => {
      ctx.lineTo(...transform(vector(pos.x, pos.y)));
      // ctx.strokeRect(...transform(vector(pos.x - player.s.x / 2, pos.y + player.s.y / 2)), transform(player.s.x), transform(player.s.y));
    });
    ctx.stroke();
  }
} 
  

function drawPlayer(player) {
  draw(26, (ctx) => drawTrajectory(ctx, player));
  draw(25, (ctx) => {
    
    // draw character
    drawCharacter(ctx, player);

    // water mask
    // if ($reflectionGradient.$) {
    //   ctx.fillStyle = $reflectionGradient.$;
    //   ctx.fillRect(...transform(vector(l - 1, t + 1)), transform(player.s.x + 2), height + 2);
    // }

    // reflection
    // const reflection = getReflection(player);
    // if (reflection) {
    //   ctx.fillStyle = `rgba(255,255,255,${0.1 * reflection.d})`;
    //   ctx.fillRect(
    //     reflection.x - transform(player.s.x / 2),
    //     reflection.y,
    //     transform(player.s.x),
    //     transform(player.s.y)
    //   );
    // }
  });
}

function update(player) {
  if (!player[KEY_PLAYER_DEATH_FRAME] && $health.$ === 0) {
    player[KEY_PLAYER_DEATH_FRAME] = player[KEY_OBJECT_FRAME];
  }

  // gravity pulling
  player.v.y -= $g.$ * $timeRatio.$;

  // update position
  vectorOp((pos, v) => pos + v * $timeRatio.$, [player.p, player.v], player.p);
  if($cameraLoop.$) $cameraLoop.$();
}

const death = objectEvent(
  () => {
    setStage($stageIndex.$, $stageWave.$);
  },
  PLAYER_DEATH_ANIMATION_DURATION,
  {
    [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) => stage[KEY_PLAYER_DEATH_FRAME],
  }
);

player[KEY_OBJECT_ON_UPDATE] = [death, update, drawPlayer, checkRipple()];
