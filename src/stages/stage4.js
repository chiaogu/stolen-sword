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
import { enemy, compund, recover, shell } from '../helper/enemy';
import { easeInQuint } from '../easing';
import { circularMovement } from '../animation';
import { collision, object, vectorMagnitude, vector } from '../utils';

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = 0;
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
      flow(-40, 1602.5, 40, 1255, vector(0, -0.5)),
      flow(105, 2220, 250, 20, vector(-0.2, 0)),
      platform(-215, 2595, 31, 382),
      platform(-110, 2638, 179, 199),
      platform(-21, 2538, 0, 0),
      platform(7, 2705, 55, 208),
      platform(61, 2766, 51, 225),
      platform(224, 2773, 8, 1124),
      platform(57, 3032, 12, 309),
      platform(84, 3388, 287, 110),
      platform(-62, 3245, 11, 293),
      platform(-75, 3107, 13, 361),
      platform(81, 3158, 37, 126),
      platform(-90, 2953, 17, 170),
      platform(-94, 3513, 67, 244),
      platform(-69, 3740, 64, 212),
      platform(-47, 3919, 58, 149),
      platform(6, 4008, 124, 28),
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
        
        enemy(136, 2900, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 3205, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-40, 3203, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(30, 3076, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-50, 2980, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(33, 2890, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-8, 2829, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-8, 2829, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        ...Array(4).fill().map((_, i) =>
          enemy(-183 + i * 50 * (Math.random() * 0.2 + 0.8), 2750, 30, 30, {
            [KEY_ENEMY_IS_UNTOUCHABLE]: true
          })
        ),
        enemy(-208, 2814, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-183, 2905, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        }),
        shell(-173, 3397, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(2000, 3)]
        }),
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(6, 4222, 124, 400);
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
