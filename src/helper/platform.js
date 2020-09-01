import { $timeRatio, player, resetDash, transform, playerDamage, setDash, $dash, draw } from '../state';
import { vector, object, approach, getObjectBoundary, vectorOp, getActionProgress, alternateProgress, objectAction } from '../utils';
import {
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  GROUND_FRICTION,
  WALL_FRICTION,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_FRAME,
} from '../constants';
import { circularMovement } from '../animation';
import { easeInQuad } from '../easing';

export function followPlayerX(platform) {
  platform.p.x = player.p.x;
}

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

function drawPlatform(platform) {
  if(platform[KEY_OBJECT_FRAME] === 0) return;
  draw(31, ctx => {
    const platformBoundary = getObjectBoundary(platform);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(
      ...transform(vector(platformBoundary.l, platformBoundary.t)),
      transform(platform.s.x),
      transform(platform.s.y)
    );
  })
}

export const boundary = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleBoundaryCollision
});

export const platform = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleStandardColiision
});

export const penetrablePlatform = (x, y, w, h, options) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED](platform, platformBoundary, collidedSide) {
    if(collidedSide) setDash(Math.max($dash.$, 1));
    if(collidedSide === SIDE_T && player.v.y <= 0)
      handleStandardColiision(platform, platformBoundary, collidedSide);
  }
});

let bambooCycle = 0;
const getBambooCycleDuration = () => 8000 + 1000 * ((bambooCycle++) % 3);

export const horizontalBamboo = (x, y, w) => penetrablePlatform(x, y, w, 0, {
  [KEY_OBJECT_ON_UPDATE]: [
    circularMovement(getBambooCycleDuration(), 0, 15),
    platform => {
      draw(20, ctx => {
        const { l, t, r } = getObjectBoundary(platform);
        const direction = x < 0 ? -1 : 1;
        const grad = ctx.createLinearGradient(...transform(vector(l - 20, 0)), ...transform(vector(r + 20, 0)));
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.2, '#aaa');   
        grad.addColorStop(0.8, '#aaa');     
        grad.addColorStop(1, '#333');  
        ctx.strokeStyle = grad;
        ctx.lineWidth = transform(5);
        ctx.setLineDash([transform(80), transform(1)]);
        
        const side = x < 0 ? l : r;
        const anotherSide = x < 0 ? r : l;
        ctx.beginPath();
        ctx.moveTo(...transform(vector(x + direction * w * 4, y - w * 2)));
        ctx.quadraticCurveTo(...transform(vector(side + direction * w * 2, t)), ...transform(vector(side, t)));
        ctx.quadraticCurveTo(...transform(vector(anotherSide - direction * w / 4, t + 2)), ...transform(vector(anotherSide - direction * w / 2, t - w * 0.1)));
        ctx.stroke();
      })
    }
  ]
}) 

export const verticalBamboo = (x, y, h) => platform(x, y, 7, h, {
  [KEY_OBJECT_ON_UPDATE]: [
    circularMovement(getBambooCycleDuration(), 15, 0),
    platform => {
      draw(20, ctx => {
        const { t, b } = getObjectBoundary(platform);
        const startY = b - h;
        const endY = t + h / 2;
        const grad = ctx.createLinearGradient(...transform(vector(0, startY)), ...transform(vector(0, endY)));
        grad.addColorStop(0, '#000');
        grad.addColorStop(0.4, '#333');
        grad.addColorStop(0.6, '#aaa');     
        grad.addColorStop(0.8, '#333');  
        ctx.strokeStyle = grad;
        ctx.lineWidth = transform(7);
        ctx.setLineDash([transform(80), transform(1)]);
        
        ctx.beginPath();
        ctx.moveTo(...transform(vector(x, startY)));
        ctx.lineTo(...transform(vector(platform.p.x + (platform.p.x - x) / 2, endY)));
        ctx.stroke();
      })
    }
  ]
})

export const water = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED](platform, platformBoundary, collidedSide) {
    if(collidedSide) {
      if(player.v.y < 0) resetDash();
      player.v.x = approach(player.v.x, 0 ,player.v.x * 0.1 * $timeRatio.$);
      player.v.y = approach(player.v.y, 0 ,player.v.y * (player.v.y > 0 ? 0.1 : 0.6) * $timeRatio.$);
    }
  },
  // [KEY_OBJECT_ON_UPDATE]: [
  //   platform => {
  //     if(platform[KEY_OBJECT_FRAME] === 0) return;
  //     draw(31, ctx => {
  //       const platformBoundary = getObjectBoundary(platform);
  //       ctx.strokeStyle = '#0ff';
  //       ctx.lineWidth = 1;
  //       ctx.strokeRect(
  //         ...transform(vector(platformBoundary.l, platformBoundary.t)),
  //         transform(platform.s.x),
  //         transform(platform.s.y)
  //       );
  //     })
  //   },
  //   ...(options[KEY_OBJECT_ON_UPDATE] || []),
  // ]
});

export const flow = (x, y, w, h, v, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED](platform, platformBoundary, collidedSide) {
    if(collidedSide) {
      vectorOp((player, target) => player + target * $timeRatio.$, [player.v, v], player.v);
    }
  },
  [KEY_OBJECT_ON_UPDATE]: [
    platform => {
      if(platform[KEY_OBJECT_FRAME] === 0) return;
      draw(31, ctx => {
        const platformBoundary = getObjectBoundary(platform);
        ctx.fillStyle = 'rgba(0,0,255,0.5)';
        ctx.fillRect(
          ...transform(vector(platformBoundary.l, platformBoundary.t)),
          transform(platform.s.x),
          transform(platform.s.y)
        );
      })
    },
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
  ]
});