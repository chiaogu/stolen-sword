import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_COMPUND_GENERATE_CHILDREN,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  FRAME_DURAITON,
  SIDE_L,
  KEY_ENEMY_IS_DEAD,
  KEY_ENEMY_DEAD_FRAME,
  KEY_OBJECT_FRAME,
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
} from '../state';
import { alternateProgress, vector, objectAction, vectorOp } from '../utils';
import { enemy, compund, fire, switchMode, shell } from '../helper/enemy';
import {
  water,
  boundary,
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

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    $g.$ = 0.3;
    $maxReleaseVelocity.$ = 12;
    player.p.x = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(
        player.p.y - player.s.y / 2 + 200,
        cameraCenter.y
      );
      cameraCenter.y = Math.max(200, cameraCenter.y);
    };
    platforms.push(
      water(0, -50, player.s.x * 10, 100, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(0, -100, player.s.x * 10, 0, {
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
      enemy(10, 400, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          fire(6000, 3000),
          slideIn(3500, 0, 550),
          circularMovement(6000, 100, 5, 3500)
        ]
      }),
      shell(100, 250, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(2000, -250, 500),
          circularMovement(3000, 10, 5, 2000)
        ]
      }),
      shell(-100, 300, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          slideIn(2500, 250, 500),
          circularMovement(4000, 10, 5, 2500)
        ]
      }),
    ),
    () => {
      const core = enemy(0, 200, 30, 30, {
        [KEY_ENEMY_IS_UNTOUCHABLE]: true,
        [KEY_OBJECT_ON_UPDATE]: [
          slideIn(1800, 0, 550),
          parabolas(10000, 300, 1800),
          checkChildren,
        ],
      });

      const children = [
        shell(-40, 200, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            slideIn(1800, -250, 400),
            follow(core, vector(-40, 0), 1800),
          ],
        }),
        shell(40, 200, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            slideIn(1800, 250, 400),
            follow(core, vector(40, 0), 1800),
          ],
        }),
        shell(0, 240, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            slideIn(1800, 250, 550),
            follow(core, vector(0, 40), 1800),
          ],
        }),
        shell(0, 160, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            slideIn(1800, -250, 550),
            follow(core, vector(0, -40), 1800),
          ],
        }),
      ];

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
          slideIn(2000, -250, 400),
          // circularMovement(4000, 100, 50, 1000),
          lemniscateMovement(8000, 500, 2000)
          // follow(core, vector(-40, 0), 1800),
        ],
      });
      enemies.push(
        head,
        ...chase(head, [300, 600, 900, 1200]).map((doChase) =>
          enemy(-250, 200, 30, 30, {
            [KEY_OBJECT_ON_UPDATE]: [doChase],
          })
        )
      );
    },
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && player.p.y <= player.s.y / 2;
  },
  [KEY_STAGE_TRANSITION](progress) {
    $cameraZoom.$ = 1 - (1 - easeInOutQuart(alternateProgress(progress))) * 0.1;
    player.v.y = 0;
    player.p.y =
      (1 - easeInQuad(alternateProgress(progress))) * 200 + player.s.y / 2;
    if (progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
    else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  },
};
