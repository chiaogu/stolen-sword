import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PROJECTILE_IS_COMSUMED
} from '../constants';
import {
  transform,
  $timeRatio,
  playerDamage,
  draw,
  $reflectionY,
  reflect,
  projectiles,
  effects,
  getReflection,
  getWaterMask
} from '../state';
import { object, getObjectBoundary, vector, vectorOp, vectorMagnitude } from '../utils';
import { ripple, checkRipple } from './graphic';

function handleCollision(projectile, projectileBoundary, collidedSide) {
  if (collidedSide) {
    playerDamage();
    projectile[KEY_PROJECTILE_IS_COMSUMED] = true;
  }
}

function drawProjectile(projectile) {
  draw(35, ctx => {
    ctx.fillStyle = '#ec5751';
    const { l, t, b } = getObjectBoundary(projectile);
    ctx.fillRect(
      ...transform(vector(l, t)),
      transform(projectile.s.x),
      transform(projectile.s.y)
    );
    
    const waterMask = getWaterMask(ctx, projectile);
    if(waterMask) {
      ctx.fillStyle = waterMask.g;
      ctx.fillRect(waterMask.x, waterMask.y, waterMask.w, waterMask.h);
    }
    
    const reflection = getReflection(projectile);
    if(reflection) {
      ctx.fillStyle = '#ec5751';
      ctx.globalAlpha = 0.1;
      ctx.fillRect(
        reflection.x,
        reflection.y,
        transform(projectile.s.x),
        reflection.h
      );
      ctx.globalAlpha = 1;
    }
  });
}

function move(projectile) {
  vectorOp(
    (pos, v) => pos + v * $timeRatio.$,
    [projectile.p, projectile.v],
    projectile.p
  );
}

export const projectile = (pos, size, v, options = {}) => {
  return {
    ...object(pos.x, pos.y, size.x, size.y, v.x, v.y),
    ...options,
    [KEY_OBJECT_ON_COLLIDED]: handleCollision,
    [KEY_OBJECT_ON_UPDATE]: [
      move,
      ...(options[KEY_OBJECT_ON_UPDATE] || []),
      drawProjectile,
      checkRipple()
    ],
  };
};
