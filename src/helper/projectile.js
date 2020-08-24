import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PLAYER_DAMAGE_FRAME,
  KEY_OBJECT_FRAME,
} from '../constants';
import {
  transform,
  setDash,
  player,
  $timeRatio,
  $dash,
  isPlayerInvincibleAfterDamage,
  $health
} from '../state';
import { object, getObjectBoundary, vector, vectorOp } from '../utils';

function handleCollision(projectile, projectileBoundary, collidedSide) {
  if (collidedSide && !isPlayerInvincibleAfterDamage()) {
    player.v = vector((-1 * player.v.x) / Math.abs(player.v.x || 1), 5);
    player[KEY_PLAYER_DAMAGE_FRAME] = player[KEY_OBJECT_FRAME];
    setDash(Math.max($dash.$, 1));
    $health.$--;
  }
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
    draw,
  ],
});
