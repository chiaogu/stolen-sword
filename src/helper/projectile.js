import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
} from '../constants';
import { transform, setDash, player, projectiles, $timeRatio, getReleaseVelocity } from '../state';
import { object, getObjectBoundary, vector, getActionProgress, objectEvent, vectorOp, vectorStringify } from '../utils';
import { listen, PRESS_DOWN, PRESS_UP } from '../events';

listen(PRESS_UP, () => {
  const v = getReleaseVelocity();
  projectiles.push(projectile(0, 200, 10, 10, v.x, v.y));
})

function handleCollision(projectile, projectileBoundary, collidedSide) {

}

function draw(projectile, ctx) {
  ctx.fillStyle = '#f00';
  
  const { l, t } = getObjectBoundary(projectile);
  ctx.fillRect(
    ...transform(vector(l, t)),
    transform(projectile.s.x),
    transform(projectile.s.y)
  );
}

function move(projectile) {
  vectorOp((pos, v) => pos + v * $timeRatio.$, [projectile.p, projectile.v], projectile.p);
}

export const projectile = (x, y, w, h, vx, vy, options = {}) => ({
  ...object(x, y, w, h, vx, vy),
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleCollision,
  [KEY_OBJECT_ON_UPDATE]: [
    move,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
    draw,
  ]
});