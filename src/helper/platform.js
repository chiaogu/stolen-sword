import { $timeRatio, player, resetDash, transform, playerDamage, setDash, $dash } from '../state';
import { vector, object, approach, getObjectBoundary, vectorOp } from '../utils';
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

function draw(platform, ctx) {
  if(platform[KEY_OBJECT_FRAME] === 0) return;
  const platformBoundary = getObjectBoundary(platform);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(
    ...transform(vector(platformBoundary.l, platformBoundary.t)),
    transform(platform.s.x),
    transform(platform.s.y)
  );
}

const _platform = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_UPDATE]: [
    draw,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
  ],
});

export const boundary = (x, y, w, h, options) => _platform(x, y, w, h, {
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleBoundaryCollision
});

export const platform = (x, y, w, h, options) => _platform(x, y, w, h, {
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleStandardColiision
});

export const penetrablePlatform = (x, y, w, h, options) => _platform(x, y, w, h, {
  ...options,
  [KEY_OBJECT_ON_COLLIDED](platform, platformBoundary, collidedSide) {
    if(collidedSide) setDash(Math.max($dash.$, 1));
    if(collidedSide === SIDE_T && player.v.y <= 0)
      handleStandardColiision(platform, platformBoundary, collidedSide);
  }
});

export const water = (x, y, w, h, options) => _platform(x, y, w, h, {
  ...options,
  [KEY_OBJECT_ON_COLLIDED](platform, platformBoundary, collidedSide) {
    if(collidedSide) {
      resetDash();
      player.v.x = approach(player.v.x, 0 ,player.v.x * 0.1 * $timeRatio.$);
      player.v.y = approach(player.v.y, 0 ,player.v.y * (player.v.y > 0 ? 0.1 : 0.6) * $timeRatio.$);
    }
  }
});
