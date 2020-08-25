import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_COMPUND_GENERATE_CHILDREN,
  KEY_ENEMY_IS_UNTOUCHABLE
} from '../constants';
import {
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom,
  $stageWave,
  enemies,
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
      penetrablePlatform(0, 150, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(9000, 0, 15)],
      }),
      penetrablePlatform(-120, 400, 150, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(10000, 0, 15)],
      }),
      penetrablePlatform(50, 700, 80, 0, {
        [KEY_OBJECT_ON_UPDATE]: [circularMovement(8000, 0, 15)],
      }),
      platform(-180, 1250, 0, 500),
      platform(180, 1650, 0, 600),
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        compund(-300, 0, 0, 0, {
          [KEY_ENEMY_COMPUND_GENERATE_CHILDREN]: [
            () => enemy(-50, 1000, 30, 30, {
              [KEY_OBJECT_ON_UPDATE]: [circularMovement(3000, 10, 10)],
            }),
            () => enemy(-130, 1500, 30, 30, {
              [KEY_ENEMY_IS_UNTOUCHABLE]: true,
              [KEY_OBJECT_ON_UPDATE]: [circularMovement(3000, 10, 10)],
            })
          ]
        })
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return $stageWave.$ === -1;
  },
  [KEY_STAGE_TRANSITION](progress) {
    player.p.x = -500 * easeInQuint(1 - progress);
  },
};
