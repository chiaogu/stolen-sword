import {
  object,
  getObjectBoundary,
  vector,
  collision,
  isEventOnTime,
  getEventRatio,
} from '../utils';
import { enemies, $timeRatio, player, transform, setDash } from '../state';
import {
  KEY_ENEMY_IS_COLLIDED,
  KEY_ENEMY_IS_INVINCIBLE,
  KEY_ENEMY_FRAME,
  KEY_ENEMY_MOVEMENT,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  KEY_ENEMY_DEATH_FRAME,
  KEY_ENEMY_MOVEMENT_DURATION,
  KEY_ENEMY_INITIAL_POS,
} from '../constants';

const SWITCH_MODE_INTERVAL = 3000;
const DEATH_ANIMATION_DURATION = 500;

function handleCollision(enemy) {
  const enemyBoundary = getObjectBoundary(enemy);
  const collidedSide = collision(player, enemy, $timeRatio.$);
  enemy[KEY_ENEMY_IS_COLLIDED] = !!collidedSide;
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
  enemy[KEY_ENEMY_DEATH_FRAME] = enemy[KEY_ENEMY_FRAME];
}

export default (ctx) => {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (
      isEventOnTime(
        enemy[KEY_ENEMY_FRAME] - enemy[KEY_ENEMY_DEATH_FRAME],
        DEATH_ANIMATION_DURATION
      )
    ) {
      enemies.splice(i, 1);
      continue;
    }

    // if (isEventOnTime(enemy[KEY_ENEMY_FRAME], SWITCH_MODE_INTERVAL)) {
    //   enemy[KEY_ENEMY_IS_COLLIDED] = false;
    //   enemy[KEY_ENEMY_IS_PENETRABLE] = !enemy[KEY_ENEMY_IS_PENETRABLE];
    // }

    // collision
    handleCollision(enemy);

    if (enemy[KEY_ENEMY_MOVEMENT] && enemy[KEY_ENEMY_MOVEMENT_DURATION]) {
      enemy[KEY_ENEMY_MOVEMENT](
        enemy.p,
        enemy[KEY_ENEMY_INITIAL_POS],
        getEventRatio(
          enemy[KEY_ENEMY_FRAME],
          enemy[KEY_ENEMY_MOVEMENT_DURATION]
        )
      );
    }

    // draw enemy
    if (enemy[KEY_ENEMY_IS_COLLIDED]) {
      ctx.fillStyle = '#f00';
    } else if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
      ctx.fillStyle = '#0ff';
    } else if (enemy[KEY_ENEMY_DEATH_FRAME]) {
      ctx.fillStyle = `rgba(255,255,0, ${
        1 -
        getEventRatio(
          enemy[KEY_ENEMY_FRAME] - enemy[KEY_ENEMY_DEATH_FRAME],
          DEATH_ANIMATION_DURATION
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

    enemy[KEY_ENEMY_FRAME] += 1 * $timeRatio.$;
  }
};
