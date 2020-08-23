import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_ON_UPDATE,
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $cameraLoop
} from '../state';
import { objectAction } from '../utils';
import { enemy } from '../helper/enemy';
import { boundary, followPlayerX, followPlayerY } from '../helper/platform';

const circularMovement = (duration, xRadius, yRadius) => objectAction(duration, (enemy, progress) => {
  const theta = progress * 2 * Math.PI;
  enemy.p.x = enemy[KEY_OBJECT_INITIAL_POS].x + xRadius * Math.cos(theta);
  enemy.p.y = enemy[KEY_OBJECT_INITIAL_POS].y + yRadius * Math.sin(theta);
});

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(player.p.y - player.s.y / 2 + 200,
        Math.max(player.p.y + player.s.y / 2 - 200, cameraCenter.y)
      )
    }
    platforms.push(
      boundary(0, -player.s.y / 2, player.s.x * 2, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 2, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 2, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    () => enemies.push(
      enemy(50, 200, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          circularMovement(3000, 20, 10)
        ]
      })
    ),
    () => enemies.push(
      enemy(-100, 350, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          circularMovement(5000, 20, 10)
        ]
      }),
      enemy(75, 450, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          circularMovement(3000, 20, 10)
        ]
      })
    ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0;
  }
};