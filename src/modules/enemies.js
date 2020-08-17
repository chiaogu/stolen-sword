import { object, getObjectBoundary, vector, vectorOp, collision } from '../utils'
import { enemies, $timeRatio, player, transform } from '../state';
import { KEY_ENEMY_IS_COLLIDED, KEY_ENEMY_IS_PENETRABLE, KEY_ENEMY_FRAME, FRAME_DURAITON, SIDE_T } from '../constants'

const SWITCH_MODE_INTERVAL = 5000;

// enemies.push({
//   ...object(300, 300, 100, 100),
//   [KEY_ENEMY_FRAME]: 0
// });

export default ctx => {
  enemies.map(enemy => {
    enemy[KEY_ENEMY_FRAME] += 1;
    
    if(enemy[KEY_ENEMY_FRAME] % Math.round(SWITCH_MODE_INTERVAL / FRAME_DURAITON / $timeRatio.$) === 0) {
      enemy[SIDE_T] = false;
      // enemy[KEY_ENEMY_IS_PENETRABLE] = !enemy[KEY_ENEMY_IS_PENETRABLE];
    }
    
    // collision
    const _isCollided = collision(enemy, player, $timeRatio.$);
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
    
    // draw enemy
    if(enemy[KEY_ENEMY_IS_COLLIDED]) {
      ctx.fillStyle = '#f00';
    } else if(enemy[SIDE_T]) {
      ctx.fillStyle = '#ff0';
    } else {
      ctx.fillStyle = '#0ff';
    }
    const { l, t } = getObjectBoundary(enemy);
    ctx.fillRect(...transform(vector(l, t)), transform(enemy.s.x), transform(enemy.s.y));
  })
}