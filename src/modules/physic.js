import { $timeRatio, player, enemies, grounds } from '../state';
import { transform } from './camera';
import { vector, toZero, getObjectBoundary, collision, vectorOp } from '../utils';
import { KEY_ENEMY_IS_COLLIDED, KEY_ENEMY_IS_PENETRABLE, SIDE_T, SIDE_B, SIDE_L, SIDE_R } from '../constants';

const GROUND_Y = 0;
const G = 0.4;
const GROUND_FRICTION = 0.2;

export default (ctx) => {
  // gravity pulling
  player.v.y -= G * $timeRatio.$;
  
  // player.v.y = 0;
  // player.p.y = player.s.y / 2;
  
  // ground collision
  grounds.map(ground => {
    const groundBoundary = getObjectBoundary(ground);
    const collidedSide = collision(player, ground);
    if(collidedSide === SIDE_T || collidedSide === SIDE_B) {
      player.v.y = 0;
      player.p.y = groundBoundary[collidedSide] + player.s.y / 2 * (collidedSide === SIDE_T ? 1 : -1);
      player.v.x = toZero(player.v.x, player.v.x * (GROUND_FRICTION * $timeRatio.$));
    } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
      player.v.x = 0;
      player.p.x = groundBoundary[collidedSide] + (player.s.x / 2 - 1) * (collidedSide === SIDE_R ? 1 : -1);
      player.v.y = toZero(player.v.y, player.v.y * (GROUND_FRICTION * $timeRatio.$));
    }
    
    // draw ground
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(...transform(vector(groundBoundary.l, groundBoundary.t)), transform(ground.s.x), transform(ground.s.y));
  });
  
  // enemies collision
  enemies.map(enemy => {
    const _isCollided = collision(enemy, player);
    if(enemy[KEY_ENEMY_IS_PENETRABLE]) {
      enemy[KEY_ENEMY_IS_COLLIDED] = _isCollided;
    } else {
      if(_isCollided) {
        vectorOp(v => {
          // console.log(Math.abs(v) <= G  * $timeRatio.$);
          // if(Math.abs(v) <= G  * $timeRatio.$) 
          return 0;
          // return v * -0.5;
        }, [player.v], player.v)
      }
    }
  })
};
