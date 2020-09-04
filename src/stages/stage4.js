import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  FRAME_DURAITON,
  KEY_OBJECT_ON_COLLIDED,
  SIDE_L,
  SIDE_R,
  DEFAULT_FRAME_HEIGHT,
  KEY_OBJECT_INITIAL_POS
} from '../constants';
import {
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom,
  $stageWave,
  enemies,
  $timeRatio,
  createLinearGradient,
  graphics,
  collision,
  $g,
  draw,
  pressingKeys,
  transform,
  $backgroundColor,
  cameraFrameSize,
  $reflectionY,
  $reflectionGradient,
  stepTo
} from '../state';
import {
  water,
  platform,
  boundary,
  followPlayerX,
  followPlayerY,
  flow,
} from '../helper/platform';
import { enemy, compund, recover, shell, untouchable, invincible, chain } from '../helper/enemy';
import { easeInQuint, easeInQuad, easeInOutQuart, easeInOutQuint, easeInCirc, easeOutCirc, easeInOutQuad } from '../easing';
import { circularMovement, chase, parabolas } from '../animation';
import { object, vectorMagnitude, vector, decompressPath, getObjectBoundary, vectorAngle, objectAction, alternateProgress } from '../utils';
import { graphic, gradient, movingMountain, staticMountain } from '../helper/graphic';
import { display } from '../modules/display';

const cliffPaths = [
  [-51, -50, SIDE_L, 1.81, decompressPath(`¢gge|l	oodo~''$#'$'`)],
  [316, 613, SIDE_R, 1.93, decompressPath(`'¦%#nm	$'eeggt~eg`)],
  [289, 1229, SIDE_R, 1.93, decompressPath(`.{}'..#ggggggg`), [20, 23]],
  [-6, 1513, SIDE_L, 1.93, decompressPath(`Qi{tl'3G;D=GOGE`), [13]],
  [326, 1851, SIDE_R, 1.8, decompressPath(`8m''''/'6GFwr~gog~yogi`)],
  [-34, 2775, SIDE_L, 2.08, decompressPath(`6grgo''''/`)]
];

const generateCiff = ([x, y, side, scale, image, switchSideIndex = []], i) => {
  const getPathPointPos = p => 
    vector(
      (x + p.x) * scale,
      (y + p.y + image.h / 2) * scale
    )
    
  graphics.push(
    graphic(x, y, graphic => draw(11, ctx => {
      const _getPathPointPos = p => 
        vector(
          (graphic.p.x + p.x) * scale,
          (graphic.p.y + p.y + image.h / 2) * scale
        )
    
      ctx.fillStyle = '#666';
      ctx.beginPath();
      image.p.forEach(p => {
        ctx.lineTo(...transform(_getPathPointPos(p)));
      })
      ctx.fill();
    }))
  );
  
  switchSideIndex = switchSideIndex.slice();
  image.p.slice(1, image.p.length).forEach((p, index) => {
    if(switchSideIndex[0] === index) {
      switchSideIndex.shift();
      side = side === SIDE_R ? SIDE_L : SIDE_R;
    }
    
    const p1 = getPathPointPos(p);
    const p2 = getPathPointPos(image.p[index]);
    const xDiff = p2.x - p1.x;
    const yDiff = p1.y - p2.y;
    const w = Math.abs(xDiff);
    const h = Math.abs(yDiff);
    
    if(w > player.s.x / 2) {
      platforms.push(
        platform(
          (xDiff > 0 ? p1.x : p2.x) + w / 2,
          (side == SIDE_L ? xDiff < 0 ? p1.y : p2.y : xDiff < 0 ? p2.y : p1.y),
          w - 2,
          1
        )
      );
    }
    if(h > player.s.y / 2) {
      platforms.push(
        platform(
          (side == SIDE_L ? xDiff > 0 ? p1.x : p2.x : xDiff > 0 ? p2.x : p1.x),
          (yDiff > 0 ? p1.y : p2.y) - h / 2,
          1,
          h
        )
      );
    }
  })
}
const randomMovement = () => ({
  [KEY_OBJECT_ON_UPDATE]: [
    circularMovement(Math.random() * 1000 + 2000, Math.random() * 10, Math.random() * 10)
  ]
});
export default {
  [KEY_STAGE_INITIATE]() {
    $backgroundColor.$ = 'rgb(200,200,200)';
    $reflectionY.$ = 0;
    $reflectionGradient.$ = [0, 230, [
      [0, 'rgba(154, 154, 154, 1)'],
      [0.4, 'rgba(125, 125, 125, 0.8)'],
      [1, 'rgba(72, 72, 72, 1)'],
    ]];
    player.p.x = -112;
    player.p.y = 3480;
    player.p.x = 0;
    player.p.y = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = 
        Math.max(player.p.y - player.s.y / 2, Math.min(200, cameraCenter.y))
    };
    
    cliffPaths.forEach(generateCiff);
    
    platforms.push(
      boundary(DEFAULT_FRAME_WIDTH / 2 - 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2 + 1, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      water(0, -24, DEFAULT_FRAME_WIDTH * 2, 50),
      platform(0, -12, DEFAULT_FRAME_WIDTH * 2, 0),
      flow(-40, 1602.5, 40, 1255, vector(0, -0.5)),
      flow(105, 2220, 250, 20, vector(-0.2, 0)),
    );
    
    const cloudGradient = [
      [0, 'rgba(255,255,255, 0)'],
      [0.5, 'rgba(255,255,255, 0.9)'],
      [0.6, 'rgba(255,255,255, 0)'],
    ]
    graphics.push(
      gradient(100, 400, 0, 0.05, [
        [0, 'rgb(200,200,200)'],
        [0.5, 'rgb(110,110,110, 1)'],
        [0.6, 'rgb(92,92,92, 0.9)'],
        [1, 'rgb(34, 34, 34, 0.9)'],
      ]),
      gradient(4821, 400, 10, 0.1, cloudGradient),
      gradient(4821, 400, 10, 0.5, cloudGradient),
      gradient(4821, 400, 51, 1, cloudGradient),
      gradient(4821, 600, 51, 2, cloudGradient),
      staticMountain(-80, -42, 9, 0.6, 5),
      staticMountain(177, 0, 9, 0.5, 3),
      staticMountain(177, 0, 9, 0.3, 2.8),
      staticMountain(-50, 40, 9, 0.2, 3.6),
      staticMountain(-237, 40, 9, 0.17, 3.5),
      staticMountain(-266, 40, 9, 0.15, 5),
      staticMountain(226, 100, 9, 0.12, 5),
      staticMountain(16, 100, 9, 0.1, 4),
      staticMountain(-406, 110, 9, 0.075, 4),
      staticMountain(16, 110, 9, 0.06, 4),
    )
  },
  [KEY_STAGE_WAVES]: [
    () => {
      enemies.push(
        invincible(0, 4340, randomMovement()),
        invincible(-130, 4516, randomMovement()),
        invincible(-61, 4694, randomMovement()),
        invincible(4, 4850, randomMovement()),
        invincible(40, 5032, randomMovement()),
        invincible(124, 5194, randomMovement()),
        invincible(-49, 5319, randomMovement()),
        invincible(49, 5444, randomMovement()),
        invincible(27, 5611, randomMovement()),
        invincible(-76, 5740, randomMovement()),
        enemy(143, 750, 30, 30, randomMovement()),
        invincible(-141, 1596, randomMovement()),
        untouchable(80, 1509, randomMovement()),
        invincible(-119, 2127, randomMovement()),
        ...chain(untouchable(-300, 2767, {
          [KEY_OBJECT_ON_UPDATE]: [
            objectAction(5000, (enemy, progress) => {
              progress = easeInOutQuad(alternateProgress(progress));
              enemy.p.y = enemy[KEY_OBJECT_INITIAL_POS].y + 472 * progress;
              enemy.p.x = enemy[KEY_OBJECT_INITIAL_POS].x + 400 * Math.sin(easeOutCirc(progress) * Math.PI / 2);
            })
          ],
        }), 10, 300, 8, (i, head) => (i === 7 ? shell : untouchable)(head.p.x, head.p.y)),
        shell(-179, 3409, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [
            circularMovement(3000, 20, 5)
          ]
        }),
        untouchable(-160, 3790, {
          [KEY_OBJECT_ON_UPDATE]: [
            circularMovement(2500, 40, 5)
          ]
        }),
      )
    }
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
    // player.p.x = -250 * easeInQuad(1 - progress);
  },
};
