import {
  object,
  getObjectBoundary,
  vector,
  collision,
} from '../utils';
import { enemies, $timeRatio, player, transform, setDash } from '../state';
import {
  KEY_ENEMY_IS_COLLIDED,
  KEY_ENEMY_IS_PENETRABLE,
  KEY_ENEMY_FRAME,
  FRAME_DURAITON,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R
} from '../constants';

const SWITCH_MODE_INTERVAL = 3000;

enemies.push({
  ...object(300, 300, 100, 100),
  [KEY_ENEMY_FRAME]: 0,
});

const isOnTime = (enemy, interval) =>
  enemy[KEY_ENEMY_FRAME] % Math.round(interval / FRAME_DURAITON / $timeRatio.$) === 0;

export default (ctx) => {
  enemies.map((enemy) => {
    enemy[KEY_ENEMY_FRAME] += 1;

    if (isOnTime(enemy, SWITCH_MODE_INTERVAL)) {
      enemy[KEY_ENEMY_IS_COLLIDED] = false;
      enemy[KEY_ENEMY_IS_PENETRABLE] = !enemy[KEY_ENEMY_IS_PENETRABLE];
    }

    // collision
    const enemyBoundary = getObjectBoundary(enemy);
    const collidedSide = collision(player, enemy, $timeRatio.$);
    if (!enemy[KEY_ENEMY_IS_PENETRABLE]) {
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
    } else {
      if(!!collidedSide) setDash(1);
      enemy[KEY_ENEMY_IS_COLLIDED] = !!collidedSide;
    }
    
    // draw enemy
    if (enemy[KEY_ENEMY_IS_COLLIDED]) {
      ctx.fillStyle = '#f00';
    } else if (enemy[KEY_ENEMY_IS_PENETRABLE]) {
      ctx.fillStyle = '#ff0';
    } else {
      ctx.fillStyle = '#0ff';
    }
    const { l, t } = getObjectBoundary(enemy);
    ctx.fillRect(
      ...transform(vector(l, t)),
      transform(enemy.s.x),
      transform(enemy.s.y)
    );
  });
};
