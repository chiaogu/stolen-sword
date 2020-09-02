import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  FRAME_DURAITON,
  SIDE_L,
  KEY_ENEMY_IS_DEAD,
  KEY_ENEMY_DEAD_FRAME,
  KEY_OBJECT_FRAME,
  DEFAULT_FRAME_HEIGHT,
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom,
  $g,
  $maxReleaseVelocity,
  $reflectionY,
  graphics,
  $backgroundV,
  $backgroundColor,
  $reflectionGradient
} from '../state';
import { alternateProgress, vector, objectAction, vectorOp } from '../utils';
import { enemy, compund, fire, switchMode, shell, recover, firework } from '../helper/enemy';
import {
  water,
  boundary,
  platform,
  followPlayerX,
  followPlayerY,
} from '../helper/platform';
import { easeInOutQuad, easeInOutQuart, easeInQuad } from '../easing';
import {
  circularMovement,
  lemniscateMovement,
  slideIn,
  parabolas,
  follow,
  chase,
} from '../animation';
import { gradient, ripple, movingMountain } from '../helper/graphic';
import { listen, PRESS_DOWN } from '../events';

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    $g.$ = 0.3;
    $maxReleaseVelocity.$ = 12;
    cameraCenter.y = player.p.y + 100;
    $reflectionY.$ = 0;
    $reflectionGradient.$ = [0, 230, [
      [0.1, 'rgba(154, 154, 154, 1)'],
      [0.4, 'rgba(125, 125, 125, 0.8)'],
      [1, 'rgba(72, 72, 72, 1)'],
    ]];
    $backgroundV.$ = 1;
    $backgroundColor.$ = 'rgb(200,200,200)';
    player.p.x = -DEFAULT_FRAME_WIDTH;
    $cameraLoop.$ = () => {
      cameraCenter.y = 
        Math.max(player.p.y - player.s.y / 2 - 200, Math.min(100, cameraCenter.y))
    };
    graphics.push(
      gradient(100, 400, 0, 0.4, [
        [0, 'rgb(200,200,200)'],
        [0.5, 'rgb(110,110,110, 1)'],
        [0.6, 'rgb(92,92,92, 0.9)'],
        [1, 'rgb(34, 34, 34, 0.9)'],
      ]),
      ...movingMountain(0, -30, 10, 0.5, 2, 2),
      ...movingMountain(0, -10, 10, 0.4, 1.2, 1.2),
    )
    platforms.push(
      water(0, -200, DEFAULT_FRAME_WIDTH * 2, 400, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      platform(0, -230, player.s.x * 10, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    () => enemies.push(
      shell(50, 300, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(1000, 100, 550),
          circularMovement(3000, 10, 5, 1000)
        ]
      })
    ),
    () => enemies.push(
      enemy(10, 350, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          fire(6000, 3000),
          slideIn(3500, 0, 550),
          circularMovement(8000, 100, 30, 3500)
        ]
      }),
      shell(-100, 100, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(2000, -100, -150),
          recover(3000, 3),
          circularMovement(5000, 10, 15, 2000)
        ]
      }),
      shell(100, 200, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          recover(3000, 3),
          slideIn(2500, 100, -150),
          circularMovement(6000, 10, 15, 2500)
        ]
      }),
    ),
    () => {
      const core = enemy(0, 200, 30, 30, {
        [KEY_ENEMY_IS_UNTOUCHABLE]: true,
        [KEY_OBJECT_ON_UPDATE]: [
          slideIn(1700, 0, 550),
          parabolas(10000, 300, 2300),
          checkChildren,
        ],
      });

      const children = [
        vector(-40, 0),
        vector(0, -40),
        vector(40, 0),
        vector(0, 40),
      ].map((offset, index) => 
        shell(offset.x, 200 + offset.y, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            slideIn(2000 + index * 100, 250 * (index > 1 ? 1 : -1), index % 2 === 1 ? 400 : 550),
            follow(core, offset, 2300),
          ],
        })
      )

      function checkChildren(enemy) {
        if (
          !enemy[KEY_ENEMY_DEAD_FRAME] &&
          children.filter((child) => child[KEY_ENEMY_IS_DEAD]).length ===
            children.length
        ) {
          enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
        }
      }

      enemies.push(core, ...children);
    },
    () => {
      const head = shell(0, 300, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]: [
          recover(3000, 3),
          slideIn(2000, 250, 450),
          firework(10, 6000, 1000),
          lemniscateMovement(12000, 500, 2000)
        ],
      });
      enemies.push(
        ...compund(
          head,
          ...chase(head, Array(6).fill().map((_, i) => (i + 1) * 300)).map((doChase, i) =>
            enemy(250, 450, 30, 30, {
              [KEY_ENEMY_IS_UNTOUCHABLE]: i === 0,
              [KEY_OBJECT_ON_UPDATE]: [doChase],
            })
          )
        )
      );
    },
    () => {
      const coreIndex = 0;
      const length = 6;
      const head = enemy(0, 250, 30, 30, {
        [KEY_ENEMY_IS_UNTOUCHABLE]: true,
        [KEY_OBJECT_ON_UPDATE]: [
          slideIn(2000, 250, 450),
          firework(10, 6000, 1000),
          circularMovement(10000, 200, 250, 2000)
        ],
      });
      const nodes = chase(head, Array(length).fill().map((_, i) => (i + 1) * 300)).map((doChase, i) =>
        (i === coreIndex ? shell : enemy)(250, 450, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: i === length - 1,
          [KEY_OBJECT_ON_UPDATE]: [
            doChase,
            ...(i === coreIndex ? [recover(2500, 3)] : []),
          ],
        }))
      const dragon = compund(
        ...nodes.splice(coreIndex, 1),
        head,
        ...nodes
      );
      enemies.push(
        ...dragon.slice(1, coreIndex + 2),
        dragon[0],
        ...dragon.slice(coreIndex + 2, dragon.length),
      );
    },
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && player.p.y <= player.s.y / 2;
  },
  [KEY_STAGE_TRANSITION](progress) {
    const movementProgress = (1 - easeInOutQuad(alternateProgress(progress)));
    $cameraZoom.$ = 1 - movementProgress * 0.1;
    $backgroundV.$ = 1 + movementProgress * 3;
    player.v.y = 0;
    player.p.y =
      (1 - easeInQuad(alternateProgress(progress))) * 200 + player.s.y / 2;
    if (progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
    else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  },
};
