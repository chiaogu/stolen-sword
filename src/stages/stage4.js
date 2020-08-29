import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  FRAME_DURAITON,
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
  water,
  platform,
  boundary,
  followPlayerX,
  followPlayerY,
  penetrablePlatform,
  flow,
} from '../helper/platform';
import { enemy, compund, recover } from '../helper/enemy';
import { easeInQuint } from '../easing';
import { circularMovement } from '../animation';
import { collision, object, vectorMagnitude, vector } from '../utils';

export default {
  [KEY_STAGE_INITIATE]() {
    // player.p.x = 0;
    player.p.x = 138;
    player.p.y = 1561;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = 
        Math.max(player.p.y - player.s.y / 2, Math.min(200, cameraCenter.y))
    };
    platforms.push(
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      water(0, -50, player.s.x * 10, 50, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      platform(0, -50, player.s.x * 10, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      platform(200, 75, 0, 250),
      platform(-175, 135, 50, 370),
      platform(175, 250, 50, 100),
      platform(150, 325, 100, 50),
      platform(110, 410, 180, 120),
      platform(-200, 370, 0, 100),
      platform(-175, 520, 50, 200),
      platform(130, 490, 140, 40),
      platform(150, 530, 100, 40),
      platform(200, 600, 90, 100),
      platform(-130, 590, 40, 100),
      platform(-90, 650, 40, 90),
      platform(-30, 715, 80, 120),
      platform(25, 760, 30, 30),
      platform(-30, 875, 240, 200),
      platform(-160, 1015, 100, 80),
      platform(-190, 1130, 40, 150),
      platform(210, 1130, 40, 40),
      platform(190, 1200, 80, 100),
      platform(170, 1400, 120, 300),
      platform(-220, 1455, 20, 500),
      platform(220, 1850, 20, 600),
      platform(155, 2170, 150, 40),
      platform(105, 2200, 250, 20),
      flow(-40, 1600, 40, 1250, vector(0, -0.4))
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        enemy(24, 499, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 545, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(121, 604, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(191, 675, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-180, 1230, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 1402, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-172, 1632, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-224, 1742, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-136, 2099, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        }),
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
    // player.p.x = -500 * easeInQuint(1 - progress);
  },
};
