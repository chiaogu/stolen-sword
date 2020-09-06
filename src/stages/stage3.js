import {
  circularMovement,
  follow,
  lemniscateMovement,
  slideIn,
} from '../animation';
import {
  DEFAULT_FRAME_WIDTH,
  KEY_ENEMY_DEAD_FRAME,
  KEY_ENEMY_IS_DEAD,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
} from '../constants';
import { easeInOutQuad, easeInQuad } from '../easing';
import { chain, enemy, fire, firework, recover, shell, bug } from '../helper/enemy';
import { gradient, movingMountain } from '../helper/graphic';
import {
  boundary,
  followPlayerX,
  followPlayerY,
  platform,
  water,
} from '../helper/platform';
import {
  $backgroundColor,
  $backgroundV,
  $cameraLoop,
  $cameraZoom,
  $g,
  $maxReleaseVelocity,
  $reflectionGradient,
  $reflectionY,
  cameraCenter,
  enemies,
  graphics,
  platforms,
  player,
} from '../state';
import { alternateProgress, vector } from '../utils';

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    $g.$ = 0.3;
    $maxReleaseVelocity.$ = 12;
    cameraCenter.y = player.p.y + 100;
    $reflectionY.$ = 0;
    $reflectionGradient.$ = [
      0,
      230,
      [
        [0, 'rgba(154, 154, 154, 1)'],
        [0.4, 'rgba(125, 125, 125, 0.8)'],
        [1, 'rgba(72, 72, 72, 1)'],
      ],
    ];
    $backgroundV.$ = 0.5;
    $backgroundColor.$ = '#D8DBE6';
    player.p.x = -DEFAULT_FRAME_WIDTH;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.max(
        player.p.y - player.s.y / 2 - 100,
        Math.min(100, cameraCenter.y)
      );
    };
    graphics.push(
      gradient(1100, 1350, 10, 0.1, [
        [0, 'rgba(216,219,230,0)'],
        [0.1, 'rgba(109,130,152, 0)'],
        [0.5, 'rgb(109,130,152, 0.9)'],
        [1, '#2b435b'],
      ]),
      ...movingMountain(177, 0, 9, 0.3, 2.8),
      ...movingMountain(0, 40, 9, 0.2, 3.6),
      ...movingMountain(-37, 60, 9, 0.15, 4)
    );
    platforms.push(
      water(0, -200, DEFAULT_FRAME_WIDTH * 2, 400, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      platform(0, -230, player.s.x * 10, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(DEFAULT_FRAME_WIDTH / 2 - 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2 + 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    // () =>
    //   enemies.push(
    //     shell('丁', 50, 200, [
    //       slideIn(1500, 100, 550),
    //       circularMovement(3000, 10, 5, 1500),
    //     ])
    //   ),
    () =>
      enemies.push(
        bug('丌', 10, 350, [
          fire(6000, 3000),
          slideIn(3500, 0, 550),
          circularMovement(8000, 100, 30, 3500),
        ]),
        shell('士', -100, 100, [
          slideIn(2000, -100, -150),
          recover(3000, 3),
          circularMovement(5000, 10, 15, 2000),
        ]),
        shell('干', 100, 200, [
          recover(3000, 3),
          slideIn(2500, 100, -150),
          circularMovement(6000, 10, 15, 2500),
        ])
      ),
    () => {
      const core = bug('十', 0, 300, [
        slideIn(2300, 0, 550),
        circularMovement(10000, 160, 288, 2300, progress => easeInOutQuad(alternateProgress(progress)) / -2),
        enemy => {
          if (
            !enemy[KEY_ENEMY_DEAD_FRAME] &&
            children.filter((child) => child[KEY_ENEMY_IS_DEAD]).length ===
              children.length
          ) {
            enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
          }
        },
      ], true);

      const children = [
        ['巛', vector(-50, 0)],
        ['三', vector(0, -50)],
        ['川', vector(50, 0)],
        ['彡', vector(0, 50)],
      ].map(([appearance, offset], index) =>
        shell(appearance, offset.x, core.p.y + offset.y, [
          slideIn(
            2000 + index * 100,
            250 * (index > 1 ? 1 : -1),
            index % 2 === 1 ? 400 : 550
          ),
          follow(core, offset, 2290),
        ])
      );
      
      enemies.push(core, ...children)
    },
    () => {
      enemies.push(
        ...chain(
          shell('米', 0, 300, [
            recover(3000, 3),
            slideIn(2000, 250, 450),
            firework(10, 6000, 1000),
            lemniscateMovement(12000, 500, 2000),
          ]),
          10,
          200,
          0,
          (i) => bug(i === 0 ? '十' : '乂', 250, 450, [], i === 0)
        )
      );
    },
    () => {
      enemies.push(
        ...chain(
          bug('由', 0, 250, [
            slideIn(2000, 250, 450),
            firework(10, 6000, 1000),
            circularMovement(10000, 200, 250, 2000),
          ], true),
          10,
          200,
          1,
          (i) =>
            (i === 0 ? shell : bug)(i % 2 == 0 ? '口' : '回', 250, 450, [
              ...(i === 0 ? [recover(2500, 3)] : [])
            ], i === 9)
        )
      );
    },
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && player.p.y <= player.s.y / 2;
  },
  [KEY_STAGE_TRANSITION](progress) {
    const movementProgress = 1 - easeInOutQuad(alternateProgress(progress));
    $cameraZoom.$ = 1 - movementProgress * 0.1;
    $backgroundV.$ = 1 + movementProgress * 3;
    player.v.y = 0;
    player.p.y =
      (1 - easeInQuad(alternateProgress(progress))) * 200 + player.s.y / 2;
    if (progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
    else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  },
};
