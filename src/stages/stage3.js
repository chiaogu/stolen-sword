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
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
  POSE_RUN,
  POSE_STOP,
  POSE_CHARGE,
} from '../constants';
import { easeInOutQuad, easeInQuad, easeOutQuad } from '../easing';
import { enemy, chain, fire, firework, recover, shell } from '../helper/enemy';
import {
  drawCaption,
  gradient,
  letterBox,
  moveTheft,
  movingMountain,
  summonTheft,
  wipe,
} from '../helper/graphic';
import { boundarySet, water } from '../helper/platform';
import {
  $backgroundColor,
  $backgroundV,
  $cameraLoop,
  $cameraZoom,
  $g,
  $maxReleaseVelocity,
  $reflectionGradient,
  $reflectionY,
  $tempPlayerPos,
  cameraCenter,
  createLinearGradient,
  effects,
  enemies,
  graphics,
  platforms,
  player,
  $forceFacing,
  $titleY,
} from '../state';
import { alternateProgress, objectAction, vector } from '../utils';

export default {
  [KEY_STAGE_INITIATE]() {
    $titleY.$ = 300;
    $g.$ = 0.3;
    $maxReleaseVelocity.$ = 12;
    cameraCenter.y = player.p.y + 100;
    $reflectionY.$ = 0;
    $backgroundV.$ = 0.5;
    $backgroundColor.$ = '#D8DBE6';
    player.p.x = -DEFAULT_FRAME_WIDTH;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.max(
        player.p.y - player.s.y / 2 - 100,
        Math.min(100, cameraCenter.y)
      );
      $reflectionGradient.$ = createLinearGradient(0, 300, [
        [0, 'rgba(0,0,0,0)'],
        [0.01, 'rgb(117,137,160, 0.9)'],
        [0.9, '#2b435b'],
      ]);
    };
    graphics.push(
      gradient(1100, 1350, 10, 0.1, [
        [0, 'rgba(216,219,230,0)'],
        [0.1, 'rgba(109,130,152, 0)'],
        [0.5, 'rgb(109,130,152, 0.9)'],
        [1, '#2b435b'],
      ]),
      ...movingMountain(177, 0, 9, 0.3, 2.8),
      ...movingMountain(0, 40, 8, 0.2, 3.6),
      ...movingMountain(-37, 60, 8, 0.15, 4)
    );
    platforms.push(
      water(0, -200, DEFAULT_FRAME_WIDTH * 2, 400),
      ...boundarySet(-230)
    );
  },
  [KEY_STAGE_WAVES]: [
    () => [
      shell('亞', 75, 50, [
        slideIn(2500, 270, -40),
        circularMovement(7000, 0, 90, 2500),
      ]),
    ],
    () => [
      enemy('工', 10, 300, [
        firework(1, 4000, 1000, 0.25),
        slideIn(3500, 0, 550),
        circularMovement(8000, 100, 30, 3500),
      ]),
      shell('干', -120, 100, [
        slideIn(2500, -150, -250),
        // recover(3000, 3),
        circularMovement(5000, 10, 15, 2500),
      ]),
      shell('士', 120, 150, [
        // recover(3000, 3),
        slideIn(3500, 150, -250),
        circularMovement(6000, 10, 15, 3500),
      ]),
    ],
    () => {
      const core = enemy(
        '十',
        0,
        300,
        [
          slideIn(2300, 0, 550),
          circularMovement(
            10000,
            160,
            288,
            2300,
            (progress) => easeInOutQuad(alternateProgress(progress)) / -2
          ),
          (enemy) => {
            if (
              !enemy[KEY_ENEMY_DEAD_FRAME] &&
              children.filter((child) => child[KEY_ENEMY_IS_DEAD]).length ===
                children.length
            ) {
              enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
            }
          },
        ],
        true
      );

      const children = [
        ['巛', vector(-50, 0)],
        ['三', vector(0, -50)],
        ['川', vector(50, 0)],
        ['二', vector(0, 50)],
      ].map(([appearance, offset], index) =>
        shell(appearance, offset.x, core.p.y + offset.y, [
          slideIn(
            2000 + index * 100,
            250 * (index > 1 ? 1 : -1),
            index % 2 === 1 ? 400 : 550
          ),
          follow(core, offset, 2300),
        ])
      );

      return [core, ...children];
    },
    () =>
      chain(
        shell('十', 0, 200, [
          // recover(3000, 3),
          slideIn(4000, 250, 450),
          firework(10, 6000, 1000),
          circularMovement(10000, 200, 210, 5000),
          // lemniscateMovement(12000, 500, 3000),
        ]),
        9,
        250,
        0,
        (i) => enemy(i === 0 ? '米' : '乂', 250, 450, [], i === 0)
      ),
    () =>
      chain(
        enemy(
          '回',
          0,
          300,
          [
            slideIn(5000, 270, -200),
            firework(10, 6000, 2000),
            circularMovement(
              20000,
              190,
              488,
              4000,
              (progress) => easeInOutQuad(alternateProgress(progress)) / -2
            )
          ],
          true
        ),
        9,
        250,
        1,
        (i) =>
          (i === 0 ? shell : enemy)(
            i === 0 ? '由' : i % 2 == 1 ? '口' : '回',
            270,
            -200,
            // [...(i === 0 ? [recover(2500, 3)] : [])],
            [],
            i === 8
          )
      ),
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
    if (progress == 0) $tempPlayerPos.$ = vector(player.p.x, player.p.y);
    else player.p.x = $tempPlayerPos.$.x * easeInOutQuad(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [
      () => {
        $g.$ = 0;
        player.v.y = 0;
        graphics.push(...letterBox());
        $tempPlayerPos.$ = vector(player.p.x, player.p.y);
        $forceFacing.$ = 1;
        const offset = player[KEY_OBJECT_FRAME];
        player[KEY_OBJECT_ON_UPDATE].push(
          objectAction(
            2000,
            (player, progress) => {
              player.p.y = player.s.y / 4 + 140 * easeOutQuad(1 - alternateProgress(progress));
              player.p.x =
                $tempPlayerPos.$.x +
                (-100 - $tempPlayerPos.$.x) * easeInOutQuad(progress);
              if (Math.round(player.p.x) === -100)
                $tempPlayerPos.$ = vector(player.p.x, player.p.y);
            },
            {
              [KEY_OBJECT_EVENT_GET_OFFSET]: () => offset,
            }
          )
        );
      },
    ],
    [
      (progress) => {
        $backgroundV.$ = 1 + easeOutQuad(progress) * 2;
      },
      2000,
    ],
    [() => drawCaption('Still not found the theft.'), 500, true],
    [summonTheft(-300, 0, 11)],
    [
      (progress) =>
        moveTheft(-300 + 100 * progress, 200 - 200 * easeInQuad(progress), 1, POSE_STOP),
      1000,
    ],
    [
      (progress) =>
        moveTheft(
          -200 + 100 * progress,
          100 * easeOutQuad(1 - alternateProgress(progress))
        ),
      800,
    ],
    [
      (progress) =>
        moveTheft(
          -100 + 200 * progress,
          100 * easeOutQuad(1 - alternateProgress(progress)),
          1, progress > 0.5 ? POSE_STOP : POSE_CHARGE
        ),
      800,
    ],
    [
      (progress) =>
        moveTheft(
          100 + 300 * progress,
          300 * easeOutQuad(1 - alternateProgress(progress))
        ),
      1200,
    ],
    [
      () => {
        player[KEY_OBJECT_ON_UPDATE].pop();
        $tempPlayerPos.$ = vector(player.p.x, player.p.y);
      },
    ],
    [
      (progress) => {
        player.p.y =
          $tempPlayerPos.$.y +
          100 * easeOutQuad(1 - alternateProgress(progress * 2));
        player.p.x = -100 + 500 * easeOutQuad(progress);
        $backgroundV.$ = 4 + easeOutQuad(progress) * 5;
      },
      1800,
    ],
    [() => {
      effects.push(wipe());
      $forceFacing.$ = undefined;
    }],
    [() => {}, 1000],
  ],
};
