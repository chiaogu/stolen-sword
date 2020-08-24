import {
  getObjectBoundary,
  collision,
} from '../utils';
import { enemies, platforms, $timeRatio, player, projectiles, isOutOfScreen } from '../state';
import {
  KEY_OBJECT_IS_COLLIDED,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_IS_DEAD,
} from '../constants';

function objectLoop(object, ctx) {
  // collision
  if(object[KEY_OBJECT_ON_COLLIDED]) {
    const objBoundary = getObjectBoundary(object);
    const collidedSide = collision(player, object, $timeRatio.$);
    object[KEY_OBJECT_IS_COLLIDED] = !!collidedSide;
    object[KEY_OBJECT_ON_COLLIDED](object, objBoundary, collidedSide);
  }
  if(object[KEY_OBJECT_ON_UPDATE]) object[KEY_OBJECT_ON_UPDATE].forEach(onUpdate => onUpdate(object, ctx))
  object[KEY_OBJECT_FRAME] += 1 * $timeRatio.$;
}

export default (ctx) => {
  objectLoop(player, ctx);
  for (let i = enemies.length - 1; i >= 0; i--) {
    // remove enemy when dead
    if (enemies[i][KEY_ENEMY_IS_DEAD]) enemies.splice(i, 1);
    else objectLoop(enemies[i], ctx);
  }
  for (let i = platforms.length - 1; i >= 0; i--) {
    objectLoop(platforms[i], ctx);
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (isOutOfScreen(projectiles[i])) projectiles.splice(i, 1);
    else objectLoop(projectiles[i], ctx);
  }
}