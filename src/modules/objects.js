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
  KEY_OBJECT_IS_COLLIDED,
  KEY_ENEMY_IS_INVINCIBLE,
  KEY_OBJECT_FRAME,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  KEY_ENEMY_DEATH_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  ENEMY_DEATH_ANIMATION_DURATION,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_ON_UPDATE,
} from '../constants';

function objectLoop(object) {
  // collision
  const objBoundary = getObjectBoundary(object);
  const collidedSide = collision(player, object, $timeRatio.$);
  object[KEY_OBJECT_IS_COLLIDED] = !!collidedSide;
  if(collidedSide && object[KEY_OBJECT_ON_COLLIDED]) object[KEY_OBJECT_ON_COLLIDED](object, objBoundary, collidedSide);
  if(object[KEY_OBJECT_ON_UPDATE]) object[KEY_OBJECT_ON_UPDATE].map(onUpdate => onUpdate(object))
  object[KEY_OBJECT_FRAME] += 1 * $timeRatio.$;
}

export default (ctx) => {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (
      isEventOnTime(
        enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEATH_FRAME],
        ENEMY_DEATH_ANIMATION_DURATION
      )
    ) {
      enemies.splice(i, 1);
      continue;
    }
    
    // collision
    // handleCollision(enemy);
    // draw enemy
    // if (enemy[KEY_OBJECT_IS_COLLIDED]) {
    //   ctx.fillStyle = '#f00';
    // } else if (enemy[KEY_ENEMY_IS_INVINCIBLE]) {
    //   ctx.fillStyle = '#0ff';
    // } else if (enemy[KEY_ENEMY_DEATH_FRAME]) {
    //   ctx.fillStyle = `rgba(255,255,0, ${
    //     1 -
    //     getEventRatio(
    //       enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEATH_FRAME],
    //       ENEMY_DEATH_ANIMATION_DURATION
    //     )
    //   }`;
    // } else {
    //   ctx.fillStyle = '#ff0';
    // }

    // const { l, t } = getObjectBoundary(enemy);
    // ctx.fillRect(
    //   ...transform(vector(l, t)),
    //   transform(enemy.s.x),
    //   transform(enemy.s.y)
    // );
    objectLoop(enemies[i]);
  }
}