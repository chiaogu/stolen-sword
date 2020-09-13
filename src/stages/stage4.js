import { circularMovement } from '../animation';
import {
  DEFAULT_FRAME_WIDTH,
  G,
  KEY_OBJECT_INITIAL_POS,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_WAVES,
  SIDE_L,
  SIDE_R,
  KEY_STAGE_ENDING_CUT_SCENE,
  POSE_IDLE,
  POSE_CHARGE
} from '../constants';
import { easeInOutQuad, easeInQuad, easeOutCirc, easeOutQuint } from '../easing';
import { enemy, chain, compund, shell } from '../helper/enemy';
import { gradient, graphic, ripple, staticMountain, letterBox, drawCaption, summonTheft, moveTheft, wipe } from '../helper/graphic';
import { boundarySet, flow, platform, water } from '../helper/platform';
import {
  $backgroundColor,
  $cameraLoop,
  $g,
  $reflectionGradient,
  $reflectionY,
  $stageWave,
  cameraCenter,
  collision,
  createLinearGradient,
  draw,
  effects,
  graphics,
  platforms,
  player,
  transform,
  $titleY,
  $tempPlayerPos,
  $forceFacing,
} from '../state';
import {
  alternateProgress,
  decompressPath,
  object,
  objectAction,
  objectEvent,
  vector,
  vectorMagnitude,
  lerp,
} from '../utils';

const cliffPaths = [
  [-51, -50, SIDE_L, 1.81, decompressPath(`¢gge|l	oodo~''$#'$'`)],
  [316, 613, SIDE_R, 1.93, decompressPath(`'¦%#nm	$'eeggt~eg`)],
  [289, 1229, SIDE_R, 1.93, decompressPath(`.{}'..#ggggggg`), [20, 23]],
  [-6, 1513, SIDE_L, 1.93, decompressPath(`Qi{tl'3G;D=GOGE`), [13]],
  [326, 1851, SIDE_R, 1.8, decompressPath(`8m''''/'6GFwr~gog~yogi`)],
  [-34, 2775, SIDE_L, 2.08, decompressPath(`6grgo''''/`)],
];

const generateCiff = ([x, y, side, scale, image, switchSideIndex = []], i) => {
  const getPathPointPos = (p) =>
    vector((x + p.x) * scale, (y + p.y + image.h / 2) * scale);

  graphics.push(
    graphic(x, y, (graphic) =>
      draw(11, (ctx) => {
        const _getPathPointPos = (p) =>
          vector(
            (graphic.p.x + p.x) * scale,
            (graphic.p.y + p.y + image.h / 2) * scale
          );

        ctx.fillStyle = '#415061';
        ctx.beginPath();
        image.p.forEach((p) => {
          ctx.lineTo(...transform(_getPathPointPos(p)));
        });
        ctx.fill();
      })
    )
  );

  switchSideIndex = switchSideIndex.slice();
  image.p.slice(1, image.p.length).forEach((p, index) => {
    if (switchSideIndex[0] === index) {
      switchSideIndex.shift();
      side = side === SIDE_R ? SIDE_L : SIDE_R;
    }

    const p1 = getPathPointPos(p);
    const p2 = getPathPointPos(image.p[index]);
    const xDiff = p2.x - p1.x;
    const yDiff = p1.y - p2.y;
    const w = Math.abs(xDiff);
    const h = Math.abs(yDiff);

    if (w > player.s.x / 2) {
      platforms.push(
        platform(
          (xDiff > 0 ? p1.x : p2.x) + w / 2,
          side == SIDE_L ? (xDiff < 0 ? p1.y : p2.y) : xDiff < 0 ? p2.y : p1.y,
          w - 2,
          1
        )
      );
    }
    if (h > player.s.y / 2) {
      platforms.push(
        platform(
          side == SIDE_L ? (xDiff > 0 ? p1.x : p2.x) : xDiff > 0 ? p2.x : p1.x,
          (yDiff > 0 ? p1.y : p2.y) - h / 2,
          1,
          h
        )
      );
    }
  });
};

const _randomMovement = () => [
  circularMovement(
    Math.random() * 1000 + 2000,
    Math.random() * 10,
    Math.random() * 10
  ),
];

let tempCamCenter;
const fakeMountain = staticMountain(205, 2750, 7, 1, 2);

export default {
  [KEY_STAGE_INITIATE]() {
    $titleY.$ = 580;
    $backgroundColor.$ = '#D8DBE6';
    $reflectionY.$ = 0;
    player.p.x = -250;
    player.p.y = 400;
    $g.$ = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      $reflectionGradient.$ = createLinearGradient(0, 300, [
        [0, 'rgba(0,0,0,0)'],
        [0.01, 'rgb(117,137,160, 0.9)'],
        [0.9, '#2b435b'],
      ]);
      cameraCenter.y = Math.max(
        player.p.y - player.s.y / 2,
        Math.min(200, cameraCenter.y)
      );
    };

    cliffPaths.forEach(generateCiff);

    platforms.push(
      ...boundarySet(-12),
      water(0, -24, DEFAULT_FRAME_WIDTH * 2, 50),
      flow(-55, 1592.5, 40, 1235, vector(0, -0.5), 30),
      flow(90, 2225, 270, 30, vector(-0.2, 0), 10)
    );

    const cloudGradient = [
      [0, 'rgba(255,255,255,0)'],
      [0.5, 'rgba(255,255,255,0.9)'],
      [1, 'rgba(255,255,255,0)'],
    ];
    graphics.push(
      gradient(1100, 1350, 10, 0.1, [
        [0, 'rgba(216,219,230,0)'],
        [0.1, 'rgba(109,130,152, 0)'],
        [0.5, 'rgb(109,130,152, 0.9)'],
        [1, '#2b435b'],
      ]),
      gradient(
        3000,
        14000,
        9,
        0.03,
        [
          [0, 'rgba(216,219,230,0)'],
          [1, 'rgba(216,219,230,1)'],
        ],
        1
      ),
      gradient(
        1200,
        6550,
        1,
        0.06,
        [
          [0, 'rgba(216,219,230,1)'],
          [1, 'rgba(43,67,91,0)'],
        ],
        1
      ),
      graphic(
        0,
        0,
        () =>
          draw(10, (ctx) => {
            ctx.fillStyle = '#000';
            ctx.fillRect(
              ...transform(vector(-232, 2)),
              transform(76),
              transform(140)
            );
          }),
        [
          objectEvent(() => {
            if (Math.random() > 0.5) effects.push(ripple(-190, 0, 300));
          }, 1000),
        ]
      ),
      graphic(0, 0, () =>
        draw(10, (ctx) => {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          ctx.moveTo(...transform(vector(-45, 2210)));
          ctx.arc(
            ...transform(vector(-45, 2210)),
            transform(30),
            Math.PI,
            -Math.PI / 2
          );
          ctx.fill();
        })
      ),
      gradient(5421, 250, 51, 1.5, cloudGradient, 1),
      gradient(5421, 250, 8, 0.5, cloudGradient, 1),
      gradient(5421, 250, 8, 0.3, cloudGradient, 1),
      // staticMountain(-100, -42, 7, 0.6, 5),
      staticMountain(177, 0, 7, 0.5, 3),
      // staticMountain(177, 0, 7, 0.3, 2.8),
      staticMountain(-50, 40, 7, 0.2, 3.6),
      // staticMountain(-237, 40, 7, 0.17, 3.5),
      staticMountain(-266, 40, 7, 0.15, 5),
      staticMountain(226, 100, 7, 0.12, 5),
      // staticMountain(16, 100, 7, 0.1, 4),
      staticMountain(-406, 110, 7, 0.075, 4),
      staticMountain(16, 110, 7, 0.06, 4)
    );
  },
  [KEY_STAGE_WAVES]: [
    () => [
      ...compund(
        enemy('巾', -160, 3790, [circularMovement(2500, 40, 5)], 1),
        ...[
          ['亓', 0, 4340],
          ['冂', -130, 4516],
          ['兀', -61, 4694],
          ['ㄢ', 4, 4850],
          ['只', 40, 5032],
          ['天', 124, 5194],
          ['云', -49, 5319],
          ['皿', 49, 5444],
          ['弓', 27, 5611],
          ['六', -76, 5740],
          ['廾', -141, 1596],
          ['爪', -119, 2127],
          ['孓', -173, 2927],
        ].map(([appearance, x, y]) => enemy(appearance, x, y, _randomMovement()))
      ),
      shell('卞', -179, 3409, [circularMovement(3000, 20, 5)]),
      enemy('卝', 143, 750, _randomMovement()),
      enemy('从', 80, 1509, _randomMovement(), 1),
      ...chain(
        enemy(
          '公',
          -300,
          2767,
          [
            objectAction(5000, (enemy, progress) => {
              progress = easeInOutQuad(alternateProgress(progress));
              enemy.p.y = enemy[KEY_OBJECT_INITIAL_POS].y + 452 * progress;
              enemy.p.x =
                enemy[KEY_OBJECT_INITIAL_POS].x +
                400 * Math.sin((easeOutCirc(progress) * Math.PI) / 2);
            }),
          ],
          1
        ),
        10,
        300,
        8,
        (i, head) => (i === 7 ? shell : enemy)('ㄙ', head.p.x, head.p.y, [], 1)
      ),
    ],
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(-131, 6226, 200, 80);
    const collidedSide = collision(player, goalArea);
    return (
      $stageWave.$ === -1 ||
      (collidedSide && Math.round(vectorMagnitude(player.v)) === 0)
    );
  },
  [KEY_STAGE_TRANSITION](progress) {
    $g.$ = G;
    player.v.y = 0;
    player.p.y = (1 - easeInQuad(progress)) * 400;
    player.p.x = -1600 * easeInQuad(1 - progress);
  },
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [
      () => {
        $forceFacing.$ = 1;
        $cameraLoop.$ = undefined;
        $tempPlayerPos.$ = vector(player.p.x, player.p.y);
        tempCamCenter = vector(cameraCenter.x, cameraCenter.y);
        graphics.push(
          ...letterBox(),
          fakeMountain
        );
      }
    ],
    [
      (progress) => {
        cameraCenter.y = lerp(tempCamCenter.y, player.p.y - 30, easeInOutQuad(progress));
      },
      1000,
    ],
    [() => {
      summonTheft(310, 6310, 11)();
      moveTheft(310, 6310, -1, POSE_IDLE);
    }],
    [() => drawCaption("Still can't find him."), 500, true],
    [
      (progress) => {
        cameraCenter.x = lerp(tempCamCenter.x, 130, easeInOutQuad(progress));
        player.p.x = lerp($tempPlayerPos.$.x, -60, easeInOutQuad(progress));
      },
      2000,
    ],
    [() => {}, 1000],
    [
      progress =>
        moveTheft(lerp(305, 450, easeOutQuint(progress)), lerp(6310, 6410, easeOutQuint(progress)), 1, POSE_CHARGE)
      ,1000
    ],
    [
      (progress) => {
        $g.$ = 0;
        draw(0, ctx => ctx.canvas.style.filter = `saturate(${1 - progress})`);
        player.p.x = lerp(-60, 134, easeOutQuint(progress));
        player.p.y = lerp($tempPlayerPos.$.y, 6360, easeOutQuint(progress));
      },
      1000,
    ],
    [() => drawCaption('(To be continued)'), 500, true],
    [() => {
      effects.push(wipe());
    }],
    [() => {}, 1000],
    [() => {
      $forceFacing.$ = undefined;
      draw(0, ctx => ctx.canvas.style.filter = '');
    }],
  ]
};
