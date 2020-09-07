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
} from '../state';
import {
  getActionProgress,
  getObjectBoundary,
  objectEvent,
  vector,
  vectorOp,
} from '../utils';

function drawPlayer(player) {
  draw(26, (ctx) => {
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
  });

  draw(25, (ctx) => {
    const { l, t, b } = getObjectBoundary(player);
    let height = transform(player.s.y);
    if (player[KEY_PLAYER_DEATH_FRAME]) {
      const deathProgress = Math.min(
        1,
        getActionProgress(
          player[KEY_OBJECT_FRAME] - player[KEY_PLAYER_DEATH_FRAME],
          PLAYER_DEATH_ANIMATION_DURATION,
          false
        )
      );
      height *= 1 - 0.7 * deathProgress;
    }

    // draw character
    if (isPlayerInvincibleAfterDamage()) {
      ctx.fillStyle =
        Math.round(player[KEY_OBJECT_FRAME]) % 8 > 3
          ? 'rgba(255,255,255, 0.1)'
          : '#000';
    } else if ($dash.$ === 0) {
      ctx.fillStyle = '#444';
    } else {
      ctx.fillStyle = '#000';
    }
    ctx.fillRect(...transform(vector(l, t)), transform(player.s.x), height);

    // const waterMask = getWaterMask(player);
    // if (waterMask) {
    //   ctx.fillStyle = waterMask.g;
    //   ctx.fillRect(waterMask.x, waterMask.y, waterMask.w, waterMask.h);
    // }

    const reflection = getReflection(player);
    if (reflection) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(
        reflection.x,
        reflection.y,
        transform(player.s.x),
        reflection.h
      );
    }
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
