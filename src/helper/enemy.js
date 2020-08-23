import {
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_IS_COLLIDED,
  KEY_ENEMY_IS_INVINCIBLE, 
  KEY_ENEMY_DEAD_FRAME,
  ENEMY_DEATH_ANIMATION_DURATION,
  KEY_ENEMY_IS_DEAD,
  KEY_OBJECT_EVENT_IS_REPEAT,
  KEY_OBJECT_EVENT_GET_OFFSET,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R
} from '../constants';
import { transform, setDash, player } from '../state';
import { object, getObjectBoundary, vector, getActionProgress, objectEvent } from '../utils';

export function handleCollision(enemy, enemyBoundary, collidedSide) {
  if (enemy[KEY_ENEMY_DEAD_FRAME]) return;

  if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
    bounceBack(enemy, enemyBoundary, collidedSide);
  } else {
    underAttack(enemy, enemyBoundary, collidedSide);
  }
}

function bounceBack(enemy, enemyBoundary, collidedSide) {
  if (collidedSide === SIDE_T || collidedSide === SIDE_B) {
    setDash(1);
    player.v.y *= -0.5;
    player.p.y =
      enemyBoundary[collidedSide] +
      (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
  } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
    setDash(1);
    player.v.x *= -0.5;
    player.p.x =
      enemyBoundary[collidedSide] +
      (player.s.x / 2) * (collidedSide === SIDE_R ? 1 : -1);
  }
}

function underAttack(enemy, enemyBoundary, collidedSide) {
  setDash(1);
  enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
}

function draw(enemy, ctx) {
  if (enemy[KEY_OBJECT_IS_COLLIDED]) {
    ctx.fillStyle = '#f00';
  } else if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
    ctx.fillStyle = '#0ff';
  } else if (enemy[KEY_ENEMY_DEAD_FRAME]) {
    ctx.fillStyle = `rgba(255,255,0, ${
      1 -
      getActionProgress(
        enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEAD_FRAME],
        ENEMY_DEATH_ANIMATION_DURATION,
        false
      )
    }`;
  } else {
    ctx.fillStyle = '#ff0';
  }

  const { l, t } = getObjectBoundary(enemy);
  ctx.fillRect(
    ...transform(vector(l, t)),
    transform(enemy.s.x),
    transform(enemy.s.y)
  );
}

const switchMode = objectEvent(enemy => {
  enemy[KEY_OBJECT_IS_COLLIDED] = false;
  enemy[KEY_ENEMY_IS_INVINCIBLE] = !enemy[KEY_ENEMY_IS_INVINCIBLE];
}, 3000);

const dead = objectEvent(enemy => {
  enemy[KEY_ENEMY_IS_DEAD] = true;
}, ENEMY_DEATH_ANIMATION_DURATION, {
  [KEY_OBJECT_EVENT_IS_REPEAT]: false,
  [KEY_OBJECT_EVENT_GET_OFFSET]: enemy => enemy[KEY_ENEMY_DEAD_FRAME]
});

export const enemy = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  ...options,
  [KEY_OBJECT_ON_COLLIDED]: handleCollision,
  [KEY_OBJECT_ON_UPDATE]: [
    draw,
    dead,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
  ]
});