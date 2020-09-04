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
  DEFAULT_FRAME_HEIGHT
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
  cameraFrameSize
} from '../state';
import {
  water,
  platform,
  boundary,
  followPlayerX,
  followPlayerY,
  flow,
} from '../helper/platform';
import { enemy, compund, recover, shell, untouchable, invincible } from '../helper/enemy';
import { easeInQuint, easeInQuad } from '../easing';
import { circularMovement } from '../animation';
import { object, vectorMagnitude, vector, decompressPath, getObjectBoundary, vectorAngle } from '../utils';
import { graphic } from '../helper/graphic';
import { display } from '../modules/display';

const cliffPaths = [
  [-51, -49, SIDE_L, 1.81, decompressPath(`¢gge|l	oodo~''$#'$'`)],
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
    graphic(x, y, graphic => draw(10, ctx => {
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

export default {
  [KEY_STAGE_INITIATE]() {
    $backgroundColor.$ = 'rgb(200,200,200)';
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
      water(0, -50, DEFAULT_FRAME_WIDTH * 2, 50),
      platform(0, -50, DEFAULT_FRAME_WIDTH * 2, 0),
      flow(-40, 1602.5, 40, 1255, vector(0, -0.5)),
      flow(105, 2220, 250, 20, vector(-0.2, 0)),
    );
  },
  [KEY_STAGE_WAVES]: [
    () =>
      enemies.push(
        invincible(0, 4340),
        invincible(-130, 4516),
        invincible(-61, 4694),
        invincible(4, 4850),
        invincible(40, 5032),
        invincible(124, 5194),
        invincible(-49, 5319),
        invincible(49, 5444),
        invincible(27, 5611),
        invincible(-76, 5740),
        // enemy(80, 545, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(121, 604, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(191, 675, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-180, 1230, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(80, 1402, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-172, 1632, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-224, 1742, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-136, 2099, 30, 30, {
        //   [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        // }),
        // enemy(136, 2900, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(80, 3205, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-40, 3203, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(30, 3076, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-50, 2980, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(33, 2890, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-8, 2829, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-8, 2829, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // ...Array(4).fill().map((_, i) =>
        //   enemy(-183 + i * 50 * (Math.random() * 0.2 + 0.8), 2750, 30, 30, {
        //     [KEY_ENEMY_IS_UNTOUCHABLE]: true
        //   })
        // ),
        // enemy(-208, 2814, 30, 30, {
        //   [KEY_ENEMY_IS_UNTOUCHABLE]: true
        // }),
        // enemy(-183, 2905, 30, 30, {
        //   [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        // }),
        // shell(-173, 3397, 30, 30, {
        //   [KEY_OBJECT_ON_UPDATE]: [recover(2000, 3)]
        // }),
      ),
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
