import { object, getObjectBoundary, vector } from '../utils'
import { enemies, $timeRatio } from '../state';
import { transform } from './camera';
import { KEY_ENEMY_IS_COLLIDED, KEY_ENEMY_FRAME, FRAME_DURAITON, SIDE_T } from '../constants'

const SWITCH_MODE_INTERVAL = 5000;

enemies.push({
  ...object(300, 300, 100, 100),
  [KEY_ENEMY_FRAME]: 0
});

export default ctx => {
  enemies.map(enemy => {
    enemy[KEY_ENEMY_FRAME] += 1;
    
    if(enemy[KEY_ENEMY_FRAME] % Math.round(SWITCH_MODE_INTERVAL / FRAME_DURAITON / $timeRatio.$) === 0) {
      enemy[SIDE_T] = false;
      // enemy[KEY_ENEMY_IS_PENETRABLE] = !enemy[KEY_ENEMY_IS_PENETRABLE];
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