import {
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_PLAYER_DEATH_FRAME,
  PLAYER_DEATH_ANIMATION_DURATION,
  SIDE_T,
  SIDE_R,
  SIDE_L,
  KEY_PLAYER_ATTACK_FRAME,
  KEY_PLAYER_STOP_FRAME
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
  $backgroundV,
  getReleaseVelocity,
  $playerCollisionSide,
} from '../state';
import {
  getActionProgress,
  getObjectBoundary,
  objectEvent,
  vector,
  vectorOp,
  decompressPath,
  vectorDistance,
  alternateProgress,
  vectorMagnitude,
} from '../utils';
import { enemy } from '../helper/enemy';
import { easeInOutQuint, easeInOutQuad, easeInQuad, easeOutQuad, easeOutQuint, easeInQuint } from '../easing';

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
//   if(key === 'c') i = (i + 1) % joints.length;
//   if(key === 'v') {
//     if(i == 0) i = joints.length - 1;
//     else i--;
//   }
// });
// setInterval(() => {
//   if (pressingKeys.has('z')) joints[i][1] += 0.001;
//   if (pressingKeys.has('x')) joints[i][1] -= 0.001;
//   // console.log(name[i], joints.map(([_, angle]) => +angle.toFixed(3)));
// }, 16);

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

const body = [vector(0, 11.9), 0];
const head = [vector(0, 12.7), 0];
const rightLeg = [vector(-2.3, -6.7), 0];
const leftLeg = [vector(1.9, -7), 0];
const rightArm = [vector(-5.2, 5.1), 0];
const leftArm = [vector(5.6, 5.8), 0];
const leftKnee = [vector(2.9, -12), 0];
const rightKnee = [vector(-0.8, -11.9), 0];
const swordJoint = [vector(3.9, -14), -1.124];

const parts = [
  [leftUpperArm, '#666', [body, leftArm]],
  [sword, '#111', [body, leftArm, swordJoint]],
  [leftHand, '#c4c4c4', [body, leftArm, [vector(3,-13.7), 0, leftArm]]],
  [bodyImg, '#333', [body]],
  [faceImg, '#c4c4c4', [body, head]],
  [hatImg, '#333', [body, head, [vector(0.2, 3), 0, head]]],
  [leftCalf, '#333', [body, leftLeg, leftKnee]],
  [leftThigh, '#333', [body, leftLeg]],
  [rightCalf, '#333', [body, rightLeg, rightKnee]],
  [rightThigh, '#333', [body, rightLeg]],
  [rightUpperArm, '#888', [body, rightArm]],
  [rightHand, '#c4c4c4', [body, rightArm, [vector(0.4, -16.3), 0, rightArm]]]
];
const joints = [body, head, rightLeg, leftLeg, rightArm, leftArm, leftKnee, rightKnee, swordJoint];

const lerp = (a, b, p) => a + (b - a) * p;

let facing = 1;

function drawPath(ctx, img, color, offset, angle) {
  ctx.fillStyle = color;
  ctx.beginPath();
  img.p.forEach(p => {
    ctx.lineTo(...transform(rotate(offset, vector(p.x * facing + offset.x, p.y + offset.y), angle)));
  })
  ctx.fill();
}

const drawParts = (ctx, player) => parts.forEach(([img, color, joints]) => {
  let pos = vector(player.p.x, player.p.y);
  joints.forEach(([offset], index) => {
    const prevPos = vector(pos.x, pos.y);
    pos.x += offset.x * facing;
    pos.y += offset.y;
    if(index > 0) pos = rotate(prevPos, pos, joints[index - 1][1] * facing);
  })
  const angle = joints[joints.length - 1][2] ? joints[joints.length - 1][2][1] : joints[joints.length - 1][1];
  drawPath(ctx, img, color, pos, angle * facing); 
});

function setPose(angles) {
  angles.forEach((angle, index) => joints[index][1] = angle);
}

function setAngle(index, angle) {
  joints[index][1] = angle;
}

// const name = [
//   'body',
//   'head',
//   'rightLeg',
//   'leftLeg',
//   'rightArm',
//   'leftArm',
//   'leftKnee',
//   'rightKnee',
//   'swordJoint',
// ]

function animateToPose(frameKey, duration, from, to, timing) {
  const progress = getActionProgress(player[KEY_OBJECT_FRAME] - player[frameKey], duration, false);
  if(progress > 1 || !player[frameKey]) {
    setPose(to);
    player[frameKey] = undefined;
  } else {
    setPose(from.map((angle, index) => lerp(angle, to[index], timing(progress))));
  }
}

function idle() {
  body[0].y = 11.9;
  animateToPose(KEY_PLAYER_STOP_FRAME, 200, stoppinAngle, idleAngle, easeOutQuint);
}

function run() {
  if(player[KEY_PLAYER_STOP_FRAME]) {
    animateToPose(KEY_PLAYER_STOP_FRAME, 200, stoppinAngle, runAngles, easeInQuint);
  } else {
    if($isPressing.$) setPose(chargingAngle);
    else setPose(runAngles);
    const progress = getActionProgress(player[KEY_OBJECT_FRAME], 600);
    const p = easeInOutQuad(alternateProgress(progress));
    body[0].y = 4 + 2 * alternateProgress(p);
    setAngle(2, lerp(runAngles[2], -0.16, p));
    setAngle(3, lerp(runAngles[3], 0.172, p));
    setAngle(6, lerp(runAngles[6], 0.2, alternateProgress(easeInQuad(progress))));
    setAngle(7, lerp(0.2, 0, alternateProgress(easeInQuad(progress))));
  }
}

function attack() {
  animateToPose(KEY_PLAYER_ATTACK_FRAME, 300, attacking, chargingAngle, easeInQuint);
}

function stop() {
  player[KEY_PLAYER_STOP_FRAME] = player[KEY_OBJECT_FRAME];
  setPose(stoppinAngle);
}

const runAngles = [0.109, 0.021, 0.08, -0.13, 0.119, 0.051, 0, 0.148, -0.968];
const chargingAngle = [0.08, 0, -0.056, -0.068, -0.073, -0.002, 0.231, 0.091, 0.078];
const idleAngle = [0,0,0,0,0,0,0,0,-1.025];
const stoppinAngle =  [0.025, 0, -0.109, -0.085, 0.027, -0.027, 0.107, -0.073, -1.062];
const attacking = [0.069, 0.025, 0.068, -0.235, -0.172, -0.514, 0.066, 0.089, 0.424];
setPose(attacking);

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
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = '#000';
  // const { l, t } = getObjectBoundary(player);
  // ctx.strokeRect(...transform(vector(l, t)), transform(player.s.x), transform(player.s.y));
  
  if($playerCollisionSide.$[SIDE_R]) {
    facing = 1;
  } else if($playerCollisionSide.$[SIDE_L]) {
    facing = -1;
  } else if($isPressing.$) {
    const { x } = getReleaseVelocity();
    facing = x / Math.abs(x) || 1;
  } else {
    facing = player.v.x / Math.abs(player.v.x) || 1;
  }

  if($playerCollisionSide.$[SIDE_T]) {
    if(vectorMagnitude(player.v) <= 0.6) {
      if($backgroundV.$ > 0) {
        run();
        facing = 1;
      } else {
        idle();
      }
    } else {
      stop();
    }
  } else if(player[KEY_PLAYER_ATTACK_FRAME]) {
    attack();
  }  else {
    setPose(chargingAngle);
  }
  drawParts(ctx, player);
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

const getPlayerDeathProgress = player => Math.min(1, getActionProgress(
  player[KEY_OBJECT_FRAME] - player[KEY_PLAYER_DEATH_FRAME],
  PLAYER_DEATH_ANIMATION_DURATION,
  false
)) || 0;

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
