import { circularMovement, slideIn } from '../animation';
import {
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
  POSE_RUN,
  KEY_SAVE_NEED_TUTORIAL,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_DEAD_FRAME,
  FRAME_DURAITON,
} from '../constants';
import { easeInOutQuad, easeInQuad, easeOutQuad, easeInOutQuint, easeInQuint, easeOutQuint } from '../easing';
import { enemy, compund, fire, firework, chain } from '../helper/enemy';
import {
  drawCaption,
  gradient,
  letterBox,
  moveTheft,
  movingBamboo,
  summonTheft,
  wipe,
  graphic,
  drawDragTrack,
} from '../helper/graphic';
import { boundarySet } from '../helper/platform';
import {
  $backgroundColor,
  $backgroundV,
  $cameraLoop,
  $cameraZoom,
  $tempPlayerPos,
  cameraCenter,
  effects,
  enemies,
  graphics,
  platforms,
  player,
  save,
  needTutorial,
  draw,
  $stage,
  $isPressing,
  slowDown,
  transform,
  $timeRatio,
  $playerCollisionSide,
  backToNormal,
  $titleY,
} from '../state';
import { alternateProgress, vector, getActionProgress, lerp } from '../utils';

let tempStateFrame;
const getAliveEnemies = () => enemies.filter(enemy => !enemy[KEY_ENEMY_DEAD_FRAME]);

export default {
  [KEY_STAGE_INITIATE]() {
    $titleY.$ = 380;
    $backgroundColor.$ = '#ddeaf0';
    player.p.x = -260;
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
    () => {
      if(needTutorial) {
        tempStateFrame = $stage.$[KEY_OBJECT_FRAME];
        graphics.push(graphic(0,0, () => draw(61, () => {
          if(!$isPressing.$) {
            const progress = getActionProgress($stage.$[KEY_OBJECT_FRAME] - tempStateFrame, 1500 * $timeRatio.$);
            drawDragTrack(
              ...transform(vector(123, 16)),
              ...transform(vector(lerp(120, 99, easeInOutQuint(progress)), lerp(-5, -154, easeInOutQuint(progress)))),
              0.5 * easeOutQuad(progress)
            )
          }
          if(getAliveEnemies().length === 0) graphics.pop();
        })));
      }
      return [
        enemy('大', 50, 150, [
          slideIn(2000, 250, 200),
          circularMovement(3000, 10, 5, 2000),
        ])
      ];
    },
    () => {
      if(needTutorial) {
        let flag = false;
        let prevEnemyCount;
        graphics.push(graphic(0,0, () => draw(61, () => {
          const aliveEnemies = getAliveEnemies();
          if(aliveEnemies.length === 0) return graphics.pop();
          if(flag) {
            if(!$isPressing.$) {
              const progress = getActionProgress($stage.$[KEY_OBJECT_FRAME] - tempStateFrame, 1500 * $timeRatio.$);
              drawDragTrack(
                ...transform(vector(120, -5)),
                ...transform(vector(
                  lerp(120, 120 + (player.p.x - aliveEnemies[0].p.x) / 3, easeInOutQuint(progress)),
                  lerp(-5, -154 + (player.p.y - aliveEnemies[0].p.y) / 3, easeInOutQuint(progress))
                )),
                0.5 * easeOutQuad(progress)
              )
            }
            if(player.p.y <= 120) {
              flag = false;
              if(!$isPressing.$) backToNormal();
            }
            if(prevEnemyCount != aliveEnemies.length && aliveEnemies.length == 1) {
              slowDown(0.01);
              prevEnemyCount = aliveEnemies.length;
            }
          } else {
            if(player.p.y > 160 && Math.abs(player.v.y) < 1) {
              flag = true;
              slowDown(0.01);
              tempStateFrame = $stage.$[KEY_OBJECT_FRAME];
            }
          }
        })));
      }
      return [
        enemy('不', -100, 300, [
          slideIn(2000, 250, 350),
          circularMovement(5000, 10, 5, 2000),
        ]),
        enemy('丕', 75, 350, [
          slideIn(2000, 250, 450),
          circularMovement(3000, 10, 5, 2000),
        ]),
      ];
    },
    () =>
      compund(
        enemy('父', 0, 450, [
          slideIn(2000, 250, 330),
          circularMovement(5000, 10, 0, 2000),
        ]),
        enemy('子', 0, 300, [
          slideIn(1000, 250, 300),
          circularMovement(6000, 100, 50, 1000),
        ])
      ),
    () => [
      enemy('火', 0, 350, [
        slideIn(1500, 250, 400),
        firework(1, 2000, 1000, 0.25),
        circularMovement(10000, 100, 10, 1500),
      ]),
    ],
    () =>
      compund(
        enemy('凸', 0, 300, [
          firework(1, 2000, 1000, 0.25),
          slideIn(2000, 250, 300),
          circularMovement(6000, 150, 10, 2000),
        ]),
        enemy(
          '凹',
          0,
          220,
          [slideIn(1000, 250, 220), circularMovement(5000, 100, 10, 1000)],
          true
        )
      ),
    () => [
      enemy('林', 0, 380, [
        slideIn(3000, 250, 350),
        // circularMovement(4000, 10, 10, 3000)
      ]),
      ...Array(6).fill().map((_, i) =>  enemy('木', -50 + i * 20, 200 + i % 2 * 100, [
        firework(1, 3000, 1000 + i % 2 * 1000, 0.25),
        slideIn(2000 + i % 2 * 1000, 250, 200 + i % 2 * 100),
        circularMovement(8000, 150, 10 * Math.random() * 5, 2000 + i % 2 * 3000),
      ])),
    ],
    () => compund(
      enemy('丌', 0, 300, [
        slideIn(5000, 250, 500),
        circularMovement(10000, 150, 10, 5000)
      ]),
      ...Array(6).fill().map((_, i) =>  enemy(i % 2 === 0 ? '屮' : '千', -180 + i * 70, 150, [
        slideIn(2500 + i * 500, 250, 500 + i * i * 30),
        circularMovement(6000, 5, 150, 2500 + i * 500 + Math.random() * 2000),
      ], true)),
    ),
    () => compund(
      enemy('丼', 0, 300, [
        slideIn(6000, 120, 500),
        circularMovement(10000, 5, 5, 6000)
      ]),
      ...chain(enemy('井', 0, 300, [
        slideIn(2000, 250, 450),
        circularMovement(3000, 100, 100, 2000),
      ], 1), 12, 200, 0, i => enemy('井', 250, 450, [], 1))
    ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0 && Math.round(player.p.y) <= 0;
  },
  [KEY_STAGE_TRANSITION](progress) {
    const movementProgress = 1 - easeInOutQuad(alternateProgress(progress));
    $backgroundV.$ = 1 + movementProgress * 3;
    $cameraZoom.$ = 1 + movementProgress * 0.1;
    if (progress == 0) $tempPlayerPos.$ = vector(player.p.x, player.p.y);
    else player.p.x = $tempPlayerPos.$.x * easeInOutQuad(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [
      () => {
        $tempPlayerPos.$ = vector(player.p.x, player.p.y);
        graphics.push(...letterBox());
      },
    ],
    [
      (progress) => {
        $backgroundV.$ = 1 + easeOutQuad(progress) * 2;
        player.p.x =
          $tempPlayerPos.$.x +
          (-100 - $tempPlayerPos.$.x) * easeInOutQuad(progress);
      },
      2000,
    ],
    [() => drawCaption("Can't find the theft. I think I lost him."), 500, true],
    [summonTheft(-260, 100, 9)],
    [
      (progress) =>
        moveTheft(
          -250 + 200 * progress,
          200 * easeOutQuad(1 - alternateProgress(progress * 0.8))
        ),
      1000,
    ],
    [
      (progress) =>
        moveTheft(
          -50 + 100 * progress,
          160 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8))
        ,1, POSE_RUN),
      500,
    ],
    [
      (progress) =>
        moveTheft(
          50 + 140 * progress,
          240 + 100 * easeOutQuad(1 - alternateProgress(progress * 0.8))
        ),
      500,
    ],
    [
      (progress) =>
        moveTheft(
          190 + 120 * progress,
          320 + 300 * easeOutQuad(1 - alternateProgress(progress * 0.8))
        ),
      1000,
    ],
    [
      (progress) => {
        player.p.x = -100 + 390 * easeInQuad(progress);
        $backgroundV.$ = 4 + easeOutQuad(progress) * 2;
      },
      1000,
    ],
    [() => {
      effects.push(wipe());
      save(KEY_SAVE_NEED_TUTORIAL, 1);
    }],
    [() => {}, 1000],
  ],
};
