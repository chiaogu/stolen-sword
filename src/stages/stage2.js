import { circularMovement } from '../animation';
import {
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
  POSE_RUN,
  POSE_STOP,
  POSE_CHARGE,
} from '../constants';
import { easeInOutQuad, easeInQuint, easeOutQuad, easeInCirc } from '../easing';
import { enemy } from '../helper/enemy';
import {
  drawCaption,
  gradient,
  letterBox,
  moveTheft,
  staticBamboo,
  summonTheft,
  wipe,
} from '../helper/graphic';
import {
  boundarySet,
  horizontalBamboo,
  verticalBamboo,
} from '../helper/platform';
import {
  $backgroundColor,
  $cameraLoop,
  $g,
  $stageWave,
  $tempPlayerPos,
  cameraCenter,
  collision,
  effects,
  graphics,
  platforms,
  player,
  $forceFacing,
} from '../state';
import { alternateProgress, object, vector, vectorMagnitude, lerp } from '../utils';

let tempCamCenter;

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = -260;
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
      gradient(
        3000,
        4000,
        1,
        0.6,
        [
          [0, '#ddeaf0'],
          [0.5, 'rgba(144,198,151,0.2)'],
          [1, 'rgba(221,234,240,0)'],
        ],
        true
      ),
      staticBamboo(330, -20, 2900, 1, 1.5, 51),
      staticBamboo(30, -10, 2900, 2, 1.2, 51),
      staticBamboo(0, 0, 2900, 3, 0.9, 10),
      staticBamboo(-67, 0, 3000, 5, 0.8, 10),
      staticBamboo(67, 60, 3100, 5, 0.7, 10)
    );
    platforms.push(
      ...boundarySet(),
      horizontalBamboo(-50, 150, 150),
      horizontalBamboo(120, 300, 200),
      horizontalBamboo(-120, 450, 200),
      horizontalBamboo(-50, 610, 180),
      verticalBamboo(-180, 800, 200),
      horizontalBamboo(50, 870, 150),
      verticalBamboo(150, 1100, 200),
      verticalBamboo(-100, 1400, 500),
      horizontalBamboo(220, 1350, 100),
      horizontalBamboo(150, 1620, 150),
      horizontalBamboo(-50, 1920, 150),
      horizontalBamboo(-220, 2220, 75),
      verticalBamboo(190, 2500, 500),
      horizontalBamboo(-136, 2900, 200)
    );
  },
  [KEY_STAGE_WAVES]: [
    () => {
      return [
        enemy('卡', 25, 790, [circularMovement(3000, 50, 5)], true),
        enemy('ㄚ', -20, 1150, [circularMovement(6000, 5, 10)], true),
        enemy('中', 150, 1580, [circularMovement(3000, 50, 5)], true),
        enemy('串', 75, 1800, [circularMovement(4000, 5, 50)], true),
        enemy('申', -120, 2220, [circularMovement(6000, 80, 80)], true),
        enemy('屮', -120, 2800, [circularMovement(6000, 5, 20)]),
      ]
    },
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(-136, 2900, 200, 30);
    const collidedSide = collision(player, goalArea);
    return (
      $stageWave.$ === -1 ||
      (collidedSide && Math.abs(vectorMagnitude(player.v)) < 0.01)
    );
  },
  [KEY_STAGE_TRANSITION](progress) {
    player.p.x = -260 * easeInCirc(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [
      () => {
        $cameraLoop.$ = undefined;
        tempCamCenter = vector(cameraCenter.x, cameraCenter.y);
        $tempPlayerPos.$ = vector(player.p.x, player.p.y);
        graphics.push(...letterBox());
        $forceFacing.$ = 1;
      },
    ],
    [() => drawCaption('Still not found the theft.'), 500, true],
    [
      (progress) => {
        cameraCenter.y = lerp(tempCamCenter.y, player.p.y - 120, easeInOutQuad(progress));
      },
      2000,
    ],
    [summonTheft(-56, 2504, 3)],
    [
      (progress) =>
        moveTheft(-56 + 135 * progress, 2504 + 96 * easeOutQuad(progress)),
      500,
    ],
    [
      (progress) =>
        moveTheft(79 - 141 * progress, 2600 + 100 * easeOutQuad(progress), -1, POSE_RUN),
      500,
    ],
    [
      (progress) => {
        progress *= 1.4;
        moveTheft(
          -62 + 248 * progress,
          2700 + 100 * easeOutQuad(1 - alternateProgress(progress)),
          1, progress > 0.5 ? POSE_STOP : POSE_CHARGE
        );
      },
      1600,
    ],
    [
      (progress) => {
        $g.$ = 0;
        progress *= 1.6;
        player.p.x = lerp($tempPlayerPos.$.x, 180, progress);
        player.p.y = $tempPlayerPos.$.y + 50 * easeOutQuad(1 - alternateProgress(progress));
      },
      1000,
    ],
    [() => {
      effects.push(wipe());
      $forceFacing.$ = undefined;
    }],
    [() => {}, 1000],
  ],
};
