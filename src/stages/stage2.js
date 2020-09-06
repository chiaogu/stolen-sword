import { circularMovement } from '../animation';
import {
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
  KEY_STAGE_ENDING_CUT_SCENE_FRAME,
  KEY_STAGE_ENDING_CUT_SCENE_INDEX,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_Z_INDEX,
} from '../constants';
import { easeInQuint, easeInOutQuint, easeInOutQuad, easeOutQuint, easeOutQuad, easeInQuad } from '../easing';
import {  bug, enemy } from '../helper/enemy';
import { staticBamboo, wipe, gradient, letterBox, drawCaption } from '../helper/graphic';
import {
  boundary,
  followPlayerY,
  horizontalBamboo,
  platform,
  verticalBamboo,
} from '../helper/platform';
import {
  $cameraLoop,
  $stageWave,
  cameraCenter,
  collision,
  enemies,
  graphics,
  platforms,
  player,
  $backgroundColor,
  effects,
  $stage,
  projectiles,
  draw,
  $g,
} from '../state';
import { object, vectorMagnitude, vector, alternateProgress } from '../utils';

let tempCamCenter;
let tempPlayerPos;


export default {
  [KEY_STAGE_INITIATE]() {
    // player.p.x = -240;
    player.p.x = -124;
    player.p.y = 2968;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(
        player.p.y - player.s.y / 2 + 200,
        Math.max(player.p.y + player.s.y / 2, cameraCenter.y)
      );
    };
    $backgroundColor.$ = '#ddeaf0';
    graphics.push(
      gradient(200, 400, 0, 0.4, [
        [0, '#ddeaf0'],
        [0.9, 'rgba(104,158,131,0.6)'],
      ]),
      gradient(3000, 4000, 1, 0.6, [
        [0, '#ddeaf0'],
        [0.5, 'rgba(144,198,151,0.2)'],
        [1, 'rgba(221,234,240,0)'],
      ], true),
      staticBamboo(330, -20, 2900, 1, 1.5, 51),
      staticBamboo(30, -10, 2900, 2, 1.2, 51),
      staticBamboo(0, 0, 2900, 3, 0.9, 10),
      staticBamboo(-67, 0, 3000, 5, 0.8, 10),
      staticBamboo(67, 60, 3100, 5, 0.7, 10),
    );
    platforms.push(
      platform(0, -player.s.y / 2, DEFAULT_FRAME_WIDTH * 2, 0),
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      horizontalBamboo(-50, 150, 150),
      horizontalBamboo(120, 300, 200),
      horizontalBamboo(-120, 450, 200),
      horizontalBamboo(-50, 610, 180),
      verticalBamboo(-180, 800, 200),
      horizontalBamboo(50, 870, 150),
      verticalBamboo(150, 1100, 200),
      verticalBamboo(-100, 1400, 500),
      horizontalBamboo(225, 1350, 100),
      horizontalBamboo(150, 1620, 150),
      horizontalBamboo(-50, 1920, 150),
      horizontalBamboo(-225, 2220, 75),
      verticalBamboo(190, 2500, 500),
      horizontalBamboo(-136, 2900, 200)
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        bug('卡', 25, 790, [circularMovement(3000, 50, 5)], true),
        bug('ㄚ', -20, 1150, [circularMovement(6000, 5, 10)], true),
        bug('中', 150, 1580, [circularMovement(3000, 50, 5)], true),
        bug('串', 75, 1800, [circularMovement(4000, 5, 50)], true),
        bug('申', -120, 2220, [circularMovement(6000, 80, 80)], true),
        bug('屮', -120, 2800, [circularMovement(6000, 5, 20)])
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(-136, 2900, 200, 30);
    const collidedSide = collision(player, goalArea);
    return (
      $stageWave.$ === -1 ||
      (collidedSide && Math.round(vectorMagnitude(player.v)) === 0)
    );
  },
  [KEY_STAGE_TRANSITION](progress) {
    // player.p.x = -500 * easeInQuint(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [() => {
      $cameraLoop.$ = undefined;
      tempCamCenter = vector(cameraCenter.x, cameraCenter.y);
      tempPlayerPos = vector(player.p.x, player.p.y);
      graphics.push(...letterBox());
    }],
    [progress => {
      player.p.x =
        tempPlayerPos.x + (-100 - tempPlayerPos.x) * easeInOutQuad(progress);
    }, 1000],
    [() => drawCaption('Still not found the theft.'), 500, true],
    [progress => {
      cameraCenter.y = tempCamCenter.y + (player.p.y - tempCamCenter.y - 120) * easeInOutQuad(progress)
    }, 2000],
    [
      () =>
        enemies.push(
          enemy(-56, 2504, 20, 20, {
            [KEY_OBJECT_Z_INDEX]: 3,
          })
        ),
    ],
    [
      (progress) => {
        enemies[0].p.x = -56 + 135 * progress;
        enemies[0].p.y =
        2504 + 96 * easeOutQuad(progress);
      },
      500,
    ],
    [
      (progress) => {
        enemies[0].p.x = 79 - 141 * progress;
        enemies[0].p.y =
        2600 + 100 * easeOutQuad(progress);
      },
      500,
    ],
    [
      (progress) => {
        progress *= 1.4;
        enemies[0].p.x = -62 + 248 * progress;
        enemies[0].p.y =
          2700 + 100 * easeOutQuad(1 - alternateProgress(progress));
      },
      1600,
    ],
    [
      (progress) => {
        $g.$ = 0;
        progress *= 1.6;
        player.p.x = -100 + 240 * progress;
        player.p.y =
          2913 + 50 * easeOutQuad(1 - alternateProgress(progress));
      },
      1000,
    ],
    [() => effects.push(wipe())],
    [() => {}, 1000],
  ],
};
