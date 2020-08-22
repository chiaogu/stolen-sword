import {
  object,
  getObjectBoundary,
  vector,
  collision,
  isEventOnTime,
  getEventRatio,
  objectEvent
} from '../utils';
import { enemies, $timeRatio, player, transform, setDash } from '../state';
import {
  KEY_OBJECT_IS_COLLIDED,
  KEY_ENEMY_IS_INVINCIBLE,
  KEY_OBJECT_FRAME,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  KEY_ENEMY_DEATH_FRAME,
  KEY_OBJECT_INITIAL_POS,
  ENEMY_DEATH_ANIMATION_DURATION
} from '../constants';

const SWITCH_MODE_INTERVAL = 3000;

export function handleCollision(enemy, enemyBoundary, collidedSide) {
  if (enemy[KEY_ENEMY_DEATH_FRAME]) return;

  if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
    bounceBack(enemy, enemyBoundary, collidedSide);
  } else {
    if (!!collidedSide) underAttack(enemy, enemyBoundary, collidedSide);
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
  enemy[KEY_ENEMY_DEATH_FRAME] = enemy[KEY_OBJECT_FRAME];
}

export default (ctx) => {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    // if (isEventOnTime(enemy[KEY_OBJECT_FRAME], SWITCH_MODE_INTERVAL)) {
    //   enemy[KEY_OBJECT_IS_COLLIDED] = false;
    //   enemy[KEY_ENEMY_IS_PENETRABLE] = !enemy[KEY_ENEMY_IS_PENETRABLE];
    // }

    // draw enemy
    if (enemy[KEY_OBJECT_IS_COLLIDED]) {
      ctx.fillStyle = '#f00';
    } else if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
      ctx.fillStyle = '#0ff';
    } else if (enemy[KEY_ENEMY_DEATH_FRAME]) {
      ctx.fillStyle = `rgba(255,255,0, ${
        1 -
        getEventRatio(
          enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEATH_FRAME],
          ENEMY_DEATH_ANIMATION_DURATION
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
};
