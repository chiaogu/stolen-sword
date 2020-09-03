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
  SIDE_R
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
  $backgroundColor
} from '../state';
import {
  water,
  platform,
  boundary,
  followPlayerX,
  followPlayerY,
  flow,
} from '../helper/platform';
import { enemy, compund, recover, shell } from '../helper/enemy';
import { easeInQuint, easeInQuad } from '../easing';
import { circularMovement } from '../animation';
import { object, vectorMagnitude, vector, decompressPath, getObjectBoundary, vectorAngle } from '../utils';
import { graphic } from '../helper/graphic';

const cliffPaths = [
  decompressPath(`¤g_nr#cssYre|ct''|##%''`),
  decompressPath(`(¥'##%bsqc{qcfc`)
];

const generateCiff = (i, x, y, side) => {
  const scale = 2.66;
  const getPathPointPos = p => 
    vector(
      (x + p.x) * scale,
      (y + p.y + cliffPaths[i].h / 2) * scale
    )
    
  graphics.push(
    graphic(x, y, graphic => draw(10, ctx => {
      if (pressingKeys.has('i')) graphic.p.y += 1;
      if (pressingKeys.has('j')) graphic.p.x += -1;
      if (pressingKeys.has('k')) graphic.p.y += -1;
      if (pressingKeys.has('l')) graphic.p.x += 1;
    
      ctx.fillStyle = '#666';
      ctx.beginPath();
      cliffPaths[i].p.forEach(p => {
        ctx.lineTo(...transform(getPathPointPos(p)));
      })
      ctx.fill();
    }))
  );
  
  cliffPaths[i].p.slice(1, cliffPaths[i].p.length).forEach((p, index) => {
    const p1 = getPathPointPos(p);
    const p2 = getPathPointPos(cliffPaths[i].p[index]);
    const w = p2.x - p1.x;
    const h = p1.y - p2.y;
    platforms.push(
      platform(
        (side == SIDE_L ? w > 0 ? p1.x : p2.x : w > 0 ? p2.x : p1.x),
        (h > 0 ? p1.y : p2.y) - Math.abs(h) / 2,
        0,
        Math.abs(h)
      ),
      platform(
        (w > 0 ? p1.x : p2.x) + Math.abs(w) / 2,
        (side == SIDE_L ? w < 0 ? p1.y : p2.y : w < 0 ? p2.y : p1.y),
        Math.abs(w),
        0
      )
    )
  })
}

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = -250;
    cameraCenter.y = player.p.y + 200;
    $backgroundColor.$ = 'rgb(200,200,200)';
    $cameraLoop.$ = () => {
      cameraCenter.y = 
        Math.max(player.p.y - player.s.y / 2, Math.min(200, cameraCenter.y))
    };
    
    generateCiff(0, -18, -46, SIDE_L);
    generateCiff(1, 223, -18, SIDE_R);
    
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
        enemy(24, 499, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 545, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(121, 604, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(191, 675, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-180, 1230, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 1402, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-172, 1632, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-224, 1742, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-136, 2099, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        }),
        
        enemy(136, 2900, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(80, 3205, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-40, 3203, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(30, 3076, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-50, 2980, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(33, 2890, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-8, 2829, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-8, 2829, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        ...Array(4).fill().map((_, i) =>
          enemy(-183 + i * 50 * (Math.random() * 0.2 + 0.8), 2750, 30, 30, {
            [KEY_ENEMY_IS_UNTOUCHABLE]: true
          })
        ),
        enemy(-208, 2814, 30, 30, {
          [KEY_ENEMY_IS_UNTOUCHABLE]: true
        }),
        enemy(-183, 2905, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(FRAME_DURAITON, 2)]
        }),
        shell(-173, 3397, 30, 30, {
          [KEY_OBJECT_ON_UPDATE]: [recover(2000, 3)]
        }),
      ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    const goalArea = object(6, 4222, 124, 400);
    const collidedSide = collision(player, goalArea);
    return (
      $stageWave.$ === -1 ||
      (collidedSide && Math.round(vectorMagnitude(player.v)) === 0)
    );
  },
  [KEY_STAGE_TRANSITION](progress) {
    player.p.x = -250 * easeInQuad(1 - progress);
  },
};
