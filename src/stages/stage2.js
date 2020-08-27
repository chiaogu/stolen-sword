import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
} from '../constants';
import {
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom,
  $stageWave,
  enemies,
  $timeRatio,
} from '../state';
import {
  platform,
  boundary,
  followPlayerX,
  followPlayerY,
  penetrablePlatform,
} from '../helper/platform';
import { enemy, compund } from '../helper/enemy';
import { easeInQuint } from '../easing';
import { circularMovement } from '../animation';
import { collision, object, vectorMagnitude } from '../utils';

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(
        player.p.y - player.s.y / 2 + 200,
        Math.max(player.p.y + player.s.y / 2, cameraCenter.y)
      );
    };
    platforms.push(
      platform(0, -player.s.y / 2, player.s.x * 10, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      penetrablePlatform(-50, 150, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(9000, 0, 15)],
      }),
      penetrablePlatform(120, 300, 200, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 0, 15)],
      }),
      penetrablePlatform(-120, 450, 200, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 0, 15)],
      }),
      penetrablePlatform(-50, 610, 180, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 0, 15)],
      }),
      platform(-180, 800, 0, 200, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 15, 0)],
      }),
      penetrablePlatform(50, 870, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(9000, 0, 15)],
      }),
      platform(150, 1100, 0, 200, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 15, 0)],
      }),
      platform(-100, 1400, 0, 500, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 15, 0)],
      }),
      penetrablePlatform(200, 1350, 50, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(9000, 0, 15)],
      }),
      penetrablePlatform(150, 1620, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 0, 15)],
      }),
      penetrablePlatform(-50, 1920, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 0, 15)],
      }),
      penetrablePlatform(-200, 2220, 50, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(9000, 0, 15)],
      }),
      platform(190, 2500, 0, 500, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 15, 0)],
      }),
      penetrablePlatform(-136, 2900, 200, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 0, 15)],
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        enemy(25, 790, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true,
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(3000, 50, 5)],
        }),
        enemy(-20, 1150, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true,
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(6000, 5, 10)],
        }),
        enemy(150, 1580, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true,
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(3000, 50, 5)],
        }),
        enemy(75, 1800, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true,
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(4000, 5, 50)],
        }),
        enemy(-120, 2220, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true,
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(6000, 80, 80)],
        }),
        enemy(-120, 2800, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [circularMovement(6000, 5, 20)],
        })
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(-136, 2900, 200, 30);
    const collidedSide = collision(goalArea, player, $timeRatio.$);
    return (
      $stageWave.$ === -1 ||
      (collidedSide && Math.round(vectorMagnitude(player.v)) === 0)
    );
  },
  [KEY_STAGE_TRANSITION](progress) {
    player.p.x = -500 * easeInQuint(1 - progress);
  },
};
