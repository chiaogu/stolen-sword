import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PROJECTILE_IS_COMSUMED
} from '../constants';
import {
  transform,
  $timeRatio,
  playerDamage,
  projectiles,
  draw
} from '../state';
import { object, getObjectBoundary, vector, vectorOp } from '../utils';

function handleCollision(projectile, projectileBoundary, collidedSide) {
  if (collidedSide) {
    playerDamage();
    projectile[KEY_PROJECTILE_IS_COMSUMED] = true;
  }
}

function drawProjectile(projectile) {
  draw(35, ctx => {
    ctx.fillStyle = '#f00';
    const { l, t } = getObjectBoundary(projectile);
    ctx.fillRect(
      ...transform(vector(l, t)),
      transform(projectile.s.x),
      transform(projectile.s.y)
    );
  });
}

function move(projectile) {
  vectorOp(
    (pos, v) => pos + v * $timeRatio.$,
    [projectile.p, projectile.v],
    projectile.p
  );
}

export const projectile = (pos, size, v, options = {}) => ({
  ...object(pos.x, pos.y, size.x, size.y, v.x, v.y),
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleCollision,
  [KEY_OBJECT_ON_UPDATE]: [
    move,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
    drawProjectile,
  ],
});
