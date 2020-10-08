import { circularMovement } from '../animation';
import {
  GROUND_FRICTION,
  KEY_OBJECT_FORCE_CHECK_COLLISION,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  SIDE_T,
  WALL_FRICTION,
  DEFAULT_FRAME_WIDTH,
} from '../constants';
import {
  $backgroundV,
  $dash,
  $timeRatio,
  draw,
  player,
  pressingKeys,
  resetDash,
  setDash,
  transform,
  platforms,
  createLinearGradient,
} from '../state';
import {
  approach,
  getObjectBoundary,
  object,
  vector,
  vectorOp,
  alternateProgress,
  getActionProgress,
} from '../utils';
import { easeInQuint } from '../easing';

export function followPlayerY(platform) {
  platform.p.y = player.p.y;
}

function handleStandardColiision(platform, platformBoundary, collidedSide) {
  const playerBoundary = getObjectBoundary(player);
  if (collidedSide === SIDE_T) resetDash();
  if (
    (collidedSide === SIDE_B || collidedSide === SIDE_T) &&
    playerBoundary.l < platformBoundary.r - 1 &&
    playerBoundary.r > platformBoundary.l + 1
  ) {
    player.v.y = platform.v.y;
    player.p.y =
      platformBoundary[collidedSide] +
      (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
    player.v.x = approach(
      player.v.x,
      platform.v.x,
      (platform.v.x - player.v.x) * GROUND_FRICTION * $timeRatio.$
    );
  } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
    resetDash();
    player.v.x = platform.v.x;
    player.p.x =
      platformBoundary[collidedSide] +
      (player.s.x / 2 - 1) * (collidedSide === SIDE_R ? 1 : -1);
    player.v.y = approach(
      player.v.y,
      platform.v.y,
      (platform.v.y - player.v.y) * WALL_FRICTION * $timeRatio.$
    );
  }
}

function handleBoundaryCollision(platform, platformBoundary, collidedSide) {
  if (collidedSide === SIDE_B || collidedSide === SIDE_T) {
    player.v.y = platform.v.y;
    player.p.y =
      platformBoundary[collidedSide] +
      (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
  } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
    player.v.x = platform.v.x;
    player.p.x =
      platformBoundary[collidedSide] +
      (player.s.x / 2) * (collidedSide === SIDE_R ? 1 : -1);
  }
}

// function drawPlatform(platform) {
//   if (platform[KEY_OBJECT_FRAME] === 0 || !pressingKeys.has('1')) return;
//   draw(31, (ctx) => {
//     const platformBoundary = getObjectBoundary(platform);
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = '#fff';
//     ctx.strokeRect(
//       ...transform(vector(platformBoundary.l, platformBoundary.t)),
//       transform(platform.s.x),
//       transform(platform.s.y)
//     );
//   });
// }

export const platform = (x, y, w, h, actions, onCollided = handleStandardColiision, forceCheckCollision) => ({
  ...object(x, y, w, h),
  [KEY_OBJECT_ON_COLLIDED]: onCollided,
  [KEY_OBJECT_ON_UPDATE]: actions,
  [KEY_OBJECT_FORCE_CHECK_COLLISION]: forceCheckCollision
  // [KEY_OBJECT_ON_UPDATE]: [
  //   drawPlatform,
  //   ...actions,
  // ],
});  

let bambooCycle = 0;
const getBambooCycleDuration = () => 8000 + 1000 * (bambooCycle++ % 3);

export const horizontalBamboo = (x, y, w) =>
  platform(x, y, w, 0, [
    circularMovement(getBambooCycleDuration(), 0, 15),
    (platform) => draw(20, (ctx) => {
      const { l, t, r } = getObjectBoundary(platform);
      const direction = x < 0 ? -1 : 1;
      const grad = ctx.createLinearGradient(
        ...transform(vector(l - 20, 0)),
        ...transform(vector(r + 20, 0))
      );
      grad.addColorStop(0.1, '#B6D8D2');
      grad.addColorStop(0.5, '#4E8F80');
      grad.addColorStop(0.9, '#B6D8D2');
      ctx.strokeStyle = grad;
      ctx.lineWidth = transform(5);
      ctx.setLineDash([transform(80), transform(1)]);

      const side = x < 0 ? l : r;
      const anotherSide = x < 0 ? r : l;
      ctx.beginPath();
      ctx.moveTo(...transform(vector(x + direction * w * 4, y - w * 2)));
      ctx.quadraticCurveTo(
        ...transform(vector(side + direction * w * 2, t)),
        ...transform(vector(side, t))
      );
      ctx.quadraticCurveTo(
        ...transform(vector(anotherSide - (direction * w) / 4, t + 2)),
        ...transform(vector(anotherSide - (direction * w) / 2, t - w * 0.1))
      );
      ctx.stroke();
    }),
  ], (platform, platformBoundary, collidedSide) => {
    if (collidedSide) setDash(Math.max($dash.$, 1));
    if (collidedSide === SIDE_T && player.v.y <= 0)
      handleStandardColiision(platform, platformBoundary, collidedSide);
  })

export const verticalBamboo = (x, y, h) =>
  platform(x, y, 7, h, [
    circularMovement(getBambooCycleDuration(), 15, 0),
    (platform) => {
      draw(20, (ctx) => {
        const { t, b } = getObjectBoundary(platform);
        const startY = b - h;
        const endY = t + h / 2;
        const grad = createLinearGradient(startY, startY - endY, [
          [0, 'rgba(221,234,240, 0)'],
          [0.2, '#B6D8D2'],
          [0.4, '#B6D8D2'],
          [0.6, '#4E8F80'],
          [0.8, '#B6D8D2'],
        ]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = transform(7);
        ctx.setLineDash([transform(80), transform(1)]);

        ctx.beginPath();
        ctx.moveTo(...transform(vector(x, startY)));
        ctx.lineTo(
          ...transform(vector(platform.p.x + (platform.p.x - x) / 2, endY))
        );
        ctx.stroke();
      });
    },
  ]);

export const water = (...args) => 
  platform(...args, [], (platform, platformBoundary, collidedSide) => {
    if (collidedSide) {
      if (player.v.y < 0) resetDash();
      player.p.x -= $backgroundV.$ * $timeRatio.$;
      player.v.x = approach(player.v.x, 0, player.v.x * 0.1 * $timeRatio.$);
      player.v.y = approach(
        player.v.y,
        0,
        player.v.y * (player.v.y > 0 ? 0.1 : 0.6) * $timeRatio.$
      );
    }
  })

export const flow = (x, y, w, h, v, z) => 
  platform(x, y, w, h, [
    (platform) => {
      if (platform[KEY_OBJECT_FRAME] === 0) return;
      draw(z, (ctx) => {
        const platformBoundary = getObjectBoundary(platform);
        const progress = 1 - getActionProgress(platform[KEY_OBJECT_FRAME], 300);
        ctx.fillStyle = platform.s.x > platform.s.y ? `rgba(255,255,255,0.6)` : createLinearGradient(
          platform.p.y + platform.s.y / 2 + progress * platform.s.y / 10 ,
          platform.s.y,
          Array(20).fill().map((_, i) => [i * 0.05, `rgba(255,255,255,${i % 2 == 0 ? 0.8 : 0.6})`]),
          1
        )
        ctx.fillRect(
          ...transform(vector(platformBoundary.l, platformBoundary.t)),
          transform(platform.s.x),
          transform(platform.s.y)
        );
      });
    },
  ], (platform, platformBoundary, collidedSide) => {
    if (collidedSide) {
      vectorOp(
        (player, target) => player + target * $timeRatio.$,
        [player.v, v],
        player.v
      );
    }
  }, 1);
  
export const boundarySet = (groundY = -player.s.y / 2) => [
  platform(0, groundY, DEFAULT_FRAME_WIDTH * 2, 0),
  platform(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, [followPlayerY], handleBoundaryCollision, 1),
  platform(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, [followPlayerY], handleBoundaryCollision, 1)
]