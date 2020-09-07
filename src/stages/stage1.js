import { circularMovement, slideIn } from '../animation';
import {
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_Z_INDEX,
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
} from '../constants';
import { easeInOutQuad, easeInQuad, easeOutQuad } from '../easing';
import { bug, compund, enemy, fire } from '../helper/enemy';
import { gradient, movingBamboo, wipe, letterBox, drawCaption } from '../helper/graphic';
import { boundary, followPlayerY, platform, boundarySet } from '../helper/platform';
import {
  $backgroundColor,
  $backgroundV,
  $cameraLoop,
  $cameraZoom,
  cameraCenter,
  effects,
  enemies,
  graphics,
  platforms,
  player,
} from '../state';
import { alternateProgress, vector } from '../utils';

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    $backgroundColor.$ = '#ddeaf0';
    player.p.x = -240;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(
        player.p.y - player.s.y / 2 + 200,
        Math.max(player.p.y + player.s.y / 2 - 200, cameraCenter.y)
      );
    };
    $backgroundV.$ = 1;
    platforms.push(...boundarySet());
    graphics.push(
      gradient(200, 400, 0, 0.5, [
        [0, '#ddeaf0'],
        [0.9, 'rgba(104,158,131,0.6)'],
      ]),
      ...movingBamboo(0, -40, 1250, 1, 1.5, 51),
      ...movingBamboo(50, -50, 1250, 1, 1.1, 51),
      ...movingBamboo(0, 30, 1250, 5, 0.9),
      ...movingBamboo(50, 30, 1250, 5, 0.75, 8),
      ...movingBamboo(20, 30, 1250, 5, 0.6, 8)
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        bug('大', 50, 150, [
          slideIn(2000, 250, 200),
          circularMovement(3000, 10, 5, 2000),
        ])
      ),
    () =>
      enemies.push(
        bug('不', -100, 300, [
          slideIn(2000, 250, 350),
          circularMovement(5000, 10, 5, 2000),
        ]),
        bug('木', 75, 350, [
          slideIn(2000, 250, 450),
          circularMovement(3000, 10, 5, 2000),
        ])
      ),
    () =>
      enemies.push(
        ...compund(
          bug('父', 0, 450, [
            slideIn(2000, 250, 330),
            circularMovement(5000, 10, 0, 2000),
          ]),
          bug('人', 0, 300, [
            slideIn(1000, 250, 300),
            circularMovement(6000, 100, 50, 1000),
          ])
        )
      ),
    () =>
      enemies.push(
        bug('火', 0, 350, [
          slideIn(1000, 250, 400),
          fire(3000, 500),
          circularMovement(10000, 100, 10, 1000),
        ])
      ),
    () =>
      enemies.push(
        ...compund(
          bug('上', 0, 300, [
            fire(3000, 500),
            slideIn(2000, 250, 300),
            circularMovement(6000, 150, 10, 2000),
          ]),
          bug(
            '下',
            0,
            220,
            [slideIn(1000, 250, 220), circularMovement(5000, 100, 10, 1000)],
            true
          )
        )
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && Math.round(player.p.y) <= 0;
  },
  [KEY_STAGE_TRANSITION](progress) {
    const movementProgress = 1 - easeInOutQuad(alternateProgress(progress));
    $backgroundV.$ = 1 + movementProgress * 3;
    $cameraZoom.$ = 1 + movementProgress * 0.1;
    if (progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
    else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [() => {
      tempPlayerPos = vector(player.p.x, player.p.y);
      graphics.push(...letterBox());
    }],
    [
      (progress) => {
        $backgroundV.$ = 1 + easeOutQuad(progress) * 2;
        player.p.x =
          tempPlayerPos.x + (-100 - tempPlayerPos.x) * easeInOutQuad(progress);
      },
      2000,
    ],
    [() => drawCaption("Can't find the theft."), 500, true],
    [
      () =>
        enemies.push(
          enemy(-250, 100, 20, 20, {
            [KEY_OBJECT_Z_INDEX]: 9,
          })
        ),
    ],
    [
      (progress) => {
        enemies[0].p.x = -250 + 200 * progress;
        enemies[0].p.y =
          200 * easeOutQuad(1 - alternateProgress(progress * 0.8));
      },
      1000,
    ],
    [
      (progress) => {
        enemies[0].p.x = -50 + 100 * progress;
        enemies[0].p.y =
          160 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8));
      },
      500,
    ],
    [
      (progress) => {
        enemies[0].p.x = 50 + 140 * progress;
        enemies[0].p.y =
          240 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8));
      },
      500,
    ],
    [
      (progress) => {
        enemies[0].p.x = 190 + 120 * progress;
        enemies[0].p.y =
          320 + 300 * easeOutQuad(1 - alternateProgress(progress * 0.8));
      },
      1000,
    ],
    [
      (progress) => {
        player.p.x = -100 + 390 * easeInQuad(progress);
        $backgroundV.$ = 4 + easeOutQuad(progress) * 2;
      },
      1000,
    ],
    [() => effects.push(wipe())],
    [() => {}, 1000],
  ],
};
