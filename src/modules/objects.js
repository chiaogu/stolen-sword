import { getObjectBoundary } from '../utils';
import {
  enemies,
  platforms,
  $timeRatio,
  player,
  projectiles,
  isOutOfScreen,
  $stage,
  graphics,
  effects,
  collision,
  $playerCollisionSide
} from '../state';
import {
  KEY_OBJECT_IS_COLLIDED,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_IS_DEAD,
  KEY_PROJECTILE_IS_COMSUMED,
  KEY_PROJECTILE_SORUCE,
  KEY_GRAPHIC_IS_ANIMATION_FINISH
} from '../constants';

function objectLoop(object, ctx) {
  let collidedSide;
  if (object[KEY_OBJECT_ON_COLLIDED]) {
    const objBoundary = getObjectBoundary(object);
    collidedSide = collision(player, object);
    
    object[KEY_OBJECT_IS_COLLIDED] = !!collidedSide;
    object[KEY_OBJECT_ON_COLLIDED](object, objBoundary, collidedSide);
  }
  if (object[KEY_OBJECT_ON_UPDATE])
    object[KEY_OBJECT_ON_UPDATE].forEach((onUpdate) => onUpdate(object, ctx));
  object[KEY_OBJECT_FRAME] += 1 * $timeRatio.$;
  return collidedSide;
}

export default (ctx) => {
  for (let i = enemies.length - 1; i >= 0; i--) {
    // remove enemy when dead
    if (enemies[i][KEY_ENEMY_IS_DEAD]) enemies.splice(i, 1);
    else objectLoop(enemies[i], ctx);
  }
  $playerCollisionSide.$ = {};
  for (let i = platforms.length - 1; i >= 0; i--) {
    const collsionSide = objectLoop(platforms[i], ctx);
    if(collsionSide) $playerCollisionSide.$[collsionSide] = 1;
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (
      isOutOfScreen(projectiles[i]) ||
      projectiles[i][KEY_PROJECTILE_SORUCE] && projectiles[i][KEY_PROJECTILE_SORUCE][KEY_ENEMY_IS_DEAD] ||
      projectiles[i][KEY_PROJECTILE_IS_COMSUMED] ||
      projectiles[i].p.y <= - projectiles[i].s.y
    )
      projectiles.splice(i, 1);
    else objectLoop(projectiles[i], ctx);
  }
  if ($stage.$) objectLoop($stage.$, ctx);
  objectLoop(player, ctx);
  for (let i = graphics.length - 1; i >= 0; i--) {
    if (graphics[i][KEY_GRAPHIC_IS_ANIMATION_FINISH]) graphics.splice(i, 1);
    else objectLoop(graphics[i], ctx);
  }
  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i][KEY_GRAPHIC_IS_ANIMATION_FINISH]) effects.splice(i, 1);
    else objectLoop(effects[i], ctx);
  }
};
