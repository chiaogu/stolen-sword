import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_OBJECT_Z_INDEX,
  DEFAULT_FRAME_HEIGHT,
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom,
  graphics,
  effects,
  $backgroundV,
  slowDown
} from '../state';
import { alternateProgress, vector, objectAction, approach, vectorOp } from '../utils';
import { enemy, compund, fire } from '../helper/enemy';
import { platform, boundary, followPlayerX, followPlayerY } from '../helper/platform';
import { easeInOutQuad, easeOutCubic, easeOutQuad, easeInCubic, easeInQuad, easeOutCirc, easeOutQuint, easeInQuint } from '../easing';
import { circularMovement, slideIn } from '../animation';
import { wipe, movingBamboo } from '../helper/graphic';

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = -240;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(player.p.y - player.s.y / 2 + 200,
        Math.max(player.p.y + player.s.y / 2 - 200, cameraCenter.y)
      )
    }
    $backgroundV.$ = 1;
    platforms.push(
      platform(0, -player.s.y / 2, DEFAULT_FRAME_WIDTH * 2, 0),
      boundary(DEFAULT_FRAME_WIDTH / 2 - 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2 + 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      })
    );
    graphics.push(
      ...movingBamboo(0, -20, 1250, 1, 1.5, 51),
      ...movingBamboo(50, -40, 1250, 2, 1.1, 51),
      ...movingBamboo(0, 30, 1250, 5, 0.9),
      ...movingBamboo(50, 30, 1250, 5, 0.75, 8),
      ...movingBamboo(20, 30, 1250, 5, 0.6, 8)
    );
  },
  [KEY_STAGE_WAVES]: [
    () => enemies.push(
      enemy(50, 150, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(1000, 250, 200),
          circularMovement(3000, 10, 5, 1000)
        ]
      })
    ),
    () => enemies.push(
      enemy(-100, 300, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(1000, 250, 350),
          circularMovement(5000, 10, 5, 1000)
        ]
      }),
      enemy(75, 350, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(1000, 250, 450),
          circularMovement(3000, 10, 5, 1000)
        ]
      })
    ),
    () => enemies.push(
      ...compund(
        enemy(0, 450, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]:[
            slideIn(2000, 250, 330),
            circularMovement(5000, 10, 0, 2000)
          ]
        }),
        enemy(0, 300, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]:[
            slideIn(1000, 250, 300),
            circularMovement(6000, 100, 50, 1000)
          ]
        })
      )
    ),
    () => enemies.push(
      enemy(0, 350, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(1000, 250, 400),
          fire(3000, 500),
          circularMovement(10000, 100, 10, 1000)
        ]
      })
    ),
    () => enemies.push(
      ...compund(
        enemy(0, 300, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            fire(3000, 500),
            slideIn(2000, 250, 300),
            circularMovement(6000, 150, 10, 2000)
          ]
        }),
        enemy(0, 220, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]:[
            slideIn(1000, 250, 220),
            circularMovement(5000, 100, 10, 1000)
          ],
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        })
      )
    ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && player.p.y <= 0;
  },
  [KEY_STAGE_TRANSITION](progress) {
    const movementProgress = (1 - easeInOutQuad(alternateProgress(progress)));
    $backgroundV.$ = 1 + movementProgress * 3;
    $cameraZoom.$ = 1 + movementProgress * 0.1;
    if(progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
    else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [() => tempPlayerPos = vector(player.p.x, player.p.y)],
    [progress => {
      $backgroundV.$ = 1 + easeOutQuad(progress) * 3;
      player.p.x = tempPlayerPos.x + (-140 - tempPlayerPos.x) * easeInOutQuad(progress);
    }, 2000],
    [() => enemies.push(
      enemy(-250, 100, 20, 20, {
        [KEY_OBJECT_Z_INDEX]: 9
      })
    )],
    [progress => {
      enemies[0].p.x = -250 + 200 * progress;
      enemies[0].p.y = 200 * easeOutQuad(1 - alternateProgress(progress * 0.8));
    }, 1000],
    [progress => {
      enemies[0].p.x = -50 + 100 * progress;
      enemies[0].p.y = 160 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8));
    }, 500],
    [progress => {
      enemies[0].p.x = 50 + 140 * progress;
      enemies[0].p.y = 240 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8));
    }, 500],
    [progress => {
      enemies[0].p.x = 190 + 120 * progress;
      enemies[0].p.y = 320 + 300 * easeOutQuad(1 - alternateProgress(progress * 0.8));
    }, 1000],
    [progress => {
      player.p.x = -140 + 390 * easeInQuad(progress);
      $backgroundV.$ = 4 + easeOutQuad(progress) * 2;
    }, 1000],
    [() => effects.push(wipe())],
    [() => {}, 1000]
  ]
};