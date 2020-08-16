import { $timeRatio, player, enemies, grounds } from '../state';
import { transform } from './camera';
import {
  vector,
  approach,
  getObjectBoundary,
  collision,
  vectorOp,
} from '../utils';
import {
  KEY_ENEMY_IS_COLLIDED,
  KEY_ENEMY_IS_PENETRABLE,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  G,
  GROUND_FRICTION,
  WALL_FRICTION,
} from '../constants';

export default (ctx) => {
  // gravity pulling
  player.v.y -= G * $timeRatio.$;
  
  // ground collision
  grounds.map((ground) => {
    vectorOp((pos, v) => pos + v  * $timeRatio.$, [ground.p, ground.v], ground.p);
    
    const groundBoundary = getObjectBoundary(ground);
    const collidedSide = collision(player, ground);
    if (collidedSide === SIDE_T || collidedSide === SIDE_B) {
      player.v.y = ground.v.y;
      player.p.y =
        groundBoundary[collidedSide] +
        (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
      player.v.x = approach(
        player.v.x,
        ground.v.x,
        (ground.v.x - player.v.x) * GROUND_FRICTION
      )
    } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
      player.v.x = ground.v.x;
      player.p.x =
        groundBoundary[collidedSide] +
        (player.s.x / 2 - 1) * (collidedSide === SIDE_R ? 1 : -1);
      player.v.y = approach(
        player.v.y,
        ground.v.y,
        (ground.v.y - player.v.y) * WALL_FRICTION
      );
    }

    // draw ground
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(
      ...transform(vector(groundBoundary.l, groundBoundary.t)),
      transform(ground.s.x),
      transform(ground.s.y)
    );
  });

  // enemies collision
  enemies.map((enemy) => {
    const _isCollided = collision(enemy, player);
    if (enemy[KEY_ENEMY_IS_PENETRABLE]) {
      enemy[KEY_ENEMY_IS_COLLIDED] = _isCollided;
    } else {
      if (_isCollided) {
        vectorOp(
          (v) => {
            // console.log(Math.abs(v) <= G  * $timeRatio.$);
            // if(Math.abs(v) <= G  * $timeRatio.$)
            return 0;
            // return v * -0.5;
          },
          [player.v],
          player.v
        );
      }
    }
  });
};
