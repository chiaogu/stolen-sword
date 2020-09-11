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
  KEY_PLAYER_STOP_FRAME,
  KEY_PLAYER_DAMAGE_FRAME,
  KEY_PLAYER_CHARGE_FRAME,
  POSE_RUN,
  POSE_CHARGE,
  POSE_IDLE,
  POSE_STOP,
  POSE_ATTACK,
  POSE_DAMAGED,
  POSE_DIE,
  POSE_SWIM,
} from '../constants';
import { checkRipple, wipe, drawPath, createSkeletion } from '../helper/graphic';
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
  slowDown,
  effects,
  $reflectionY,
  isUnderWater,
  $isForceStopping,
  $forceFacing,
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
  lerp,
  rotate
} from '../utils';
import { enemy } from '../helper/enemy';
import { easeInOutQuint, easeInOutQuad, easeInQuad, easeOutQuad, easeOutQuint, easeInQuint } from '../easing';

const defaultColor = ['#666', '#111', '#c4c4c4', '#333', '#888'];

let facing = 1;
const skeleton = createSkeletion();

function setAngle(index, angle) {
  skeleton.j[index][1] = angle;
}

function animateToPose(frameKey, duration, from, to, timing, removeKey = 1) {
  const progress = getActionProgress(player[KEY_OBJECT_FRAME] - player[frameKey], duration, false);
  if(progress > 1 || !player[frameKey]) {
    skeleton.p(to);
    if(removeKey) player[frameKey] = undefined;
  } else {
    skeleton.p(from.map((angle, index) => lerp(angle, to[index], timing(progress))));
  }
}

player[KEY_OBJECT_ON_UPDATE] = [
  // check death
  objectEvent(
    () => setStage($stageIndex.$, $stageWave.$),
    PLAYER_DEATH_ANIMATION_DURATION,
    { [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) => stage[KEY_PLAYER_DEATH_FRAME] }
  ),
  // update properties
  () => {
    // check death
    if (!player[KEY_PLAYER_DEATH_FRAME] && $health.$ === 0) {
      player[KEY_PLAYER_DEATH_FRAME] = player[KEY_OBJECT_FRAME];
      effects.push(wipe());
    }
  
    // gravity pulling
    player.v.y -= $g.$ * $timeRatio.$;
  
    // update position
    vectorOp((pos, v) => pos + v * $timeRatio.$, [player.p, player.v], player.p);
    if($cameraLoop.$) $cameraLoop.$();
    
    // update facing
    const vFacing = player.v.x / Math.abs(player.v.x) || 1;
    if($forceFacing.$) {
      facing = $forceFacing.$;
    } else if($isPressing.$) {
      const { x } = getReleaseVelocity();
      facing = x / Math.abs(x) || 1;
    } else if(player[KEY_PLAYER_DEATH_FRAME] || player[KEY_PLAYER_CHARGE_FRAME] < player[KEY_PLAYER_DAMAGE_FRAME]) {
      facing = -vFacing;
    } else if($playerCollisionSide.$[SIDE_R]) {
      facing = 1;
    } else if($playerCollisionSide.$[SIDE_L]) {
      facing = -1;
    } else {
      facing = vFacing;
    }
  
    // update pose
    if(player[KEY_PLAYER_DEATH_FRAME]) {
      // die
      animateToPose(KEY_PLAYER_DEATH_FRAME, 1000, POSE_DAMAGED, POSE_DIE, easeOutQuint, false);
    } else if(player[KEY_PLAYER_ATTACK_FRAME]) {
      // attack
      animateToPose(KEY_PLAYER_ATTACK_FRAME, 300, POSE_ATTACK, POSE_CHARGE, easeInQuint);
    } else if(player.p.y < $reflectionY.$) {
      // swim
      skeleton.p(POSE_SWIM);
      const progress = getActionProgress(player[KEY_OBJECT_FRAME], 600);
      const p = easeInOutQuad(alternateProgress(progress));
      setAngle(2, lerp(POSE_SWIM[2], 0.032, p));
      setAngle(3, lerp(POSE_SWIM[3], 0.2, p));
      setAngle(6, lerp(POSE_SWIM[6], 0.246, alternateProgress(easeInQuad(progress))));
      setAngle(7, lerp(POSE_SWIM[7], 0.134, alternateProgress(easeInQuad(progress))));
    } else if($playerCollisionSide.$[SIDE_T]) {
      if(vectorMagnitude(player.v) <= 0.6 && !$isForceStopping.$) {
        if($backgroundV.$ > 0) {
          // run
          if(player[KEY_PLAYER_STOP_FRAME]) {
            animateToPose(KEY_PLAYER_STOP_FRAME, 200, POSE_STOP, POSE_RUN, easeInQuint);
          } else {
            if($isPressing.$) skeleton.p(POSE_CHARGE);
            else skeleton.p(POSE_RUN);
            const progress = getActionProgress(player[KEY_OBJECT_FRAME], 600);
            const p = easeInOutQuad(alternateProgress(progress));
            skeleton.j[0][0].y = 4 + 2 * alternateProgress(p);
            setAngle(2, lerp(POSE_RUN[2], -0.16, p));
            setAngle(3, lerp(POSE_RUN[3], 0.172, p));
            setAngle(6, lerp(POSE_RUN[6], 0.2, alternateProgress(easeInQuad(progress))));
            setAngle(7, lerp(0.2, 0, alternateProgress(easeInQuad(progress))));
          }
          facing = 1;
        } else {
          // idle
          skeleton.j[0][0].y = 11.9;
          animateToPose(KEY_PLAYER_STOP_FRAME, 200, POSE_STOP, POSE_IDLE, easeOutQuint);
        }
      } else {
        // stopping
        player[KEY_PLAYER_STOP_FRAME] = player[KEY_OBJECT_FRAME];
        skeleton.p(POSE_STOP);
      }
    } else if(player[KEY_PLAYER_CHARGE_FRAME] < player[KEY_PLAYER_DAMAGE_FRAME] && isPlayerInvincibleAfterDamage()) {
      skeleton.p(POSE_DAMAGED);
    } else {
      skeleton.p(POSE_CHARGE);
    }
    defaultColor[2] = ($health.$ == 2 ? '#c4c4c4' : '#ec5751');
  }, 
  // rendering
  () => {
    draw(26, ctx => {
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
    } );
    draw(25, ctx => {
      // draw character
      // ctx.lineWidth = 1;
      // ctx.strokeStyle = '#000';
      // const { l, t } = getObjectBoundary(player);
      // ctx.strokeRect(...transform(vector(l, t)), transform(player.s.x), transform(player.s.y));
    
      if(isPlayerInvincibleAfterDamage()) {
        ctx.globalAlpha = Math.round(player[KEY_OBJECT_FRAME]) % 8 > 3 ? 0.1 : 1;
      }
      skeleton.d(ctx, player.p, defaultColor, facing);
      ctx.globalAlpha = 1;
  
      // water mask
      if (isUnderWater(player)) {
        skeleton.d(ctx, player.p, defaultColor.map(() => $reflectionGradient.$), facing);
      }
  
      // reflection
      if ($reflectionY.$ !== undefined) {
        ctx.globalAlpha = 0.3 * easeInQuad(Math.max(0, Math.min(1, player.p.y / player.s.y * 2)));
        skeleton.d(ctx, vector(
          player.p.x - Math.random() * 4 * $timeRatio.$,
          -player.p.y
        ), defaultColor, facing, -1);
        ctx.globalAlpha = 1;
      }
    });
  },
  checkRipple()
];
