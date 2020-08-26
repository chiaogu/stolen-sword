import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  DEFAULT_FRAME_WIDTH,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_COMPUND_GENERATE_CHILDREN,
  KEY_STAGE_TRANSITION,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  FRAME_DURAITON,
  SIDE_L
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $cameraLoop,
  $cameraZoom
} from '../state';
import { alternateProgress, vector, objectAction } from '../utils';
import { enemy, compund, fire } from '../helper/enemy';
import { water, boundary, followPlayerX, followPlayerY } from '../helper/platform';
import { easeInOutQuad, easeOutCubic } from '../easing';
import { circularMovement, slideIn } from '../animation';

let tempPlayerPos;

export default {
  [KEY_STAGE_INITIATE]() {
    player.p.x = 0;
    cameraCenter.y = player.p.y + 200;
    $cameraLoop.$ = () => {
      cameraCenter.y = Math.min(player.p.y - player.s.y / 2 + 200, cameraCenter.y);
      cameraCenter.y = Math.max(200, cameraCenter.y);
    }
    platforms.push(
      water(0, -50, player.s.x * 10, 100, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(0, -100, player.s.x * 10, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      boundary(DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      }),
      boundary(-DEFAULT_FRAME_WIDTH / 2, 0, 0, player.s.y * 10, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerY],
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    // () => enemies.push(
    //   enemy(50, 150, 30, 30, {
    //     [KEY_OBJECT_ON_UPDATE]:[
    //       slideIn(1000, 250, 200),
    //       circularMovement(3000, 10, 5, 1000)
    //     ]
    //   })
    // ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return false;
    // return enemies.length === 0;
  },
  // [KEY_STAGE_TRANSITION](progress) {
  //   $cameraZoom.$ = 1 + (1 - easeInOutQuad(alternateProgress(progress))) * 0.2;
  //   if(progress == 0) tempPlayerPos = vector(player.p.x, player.p.y);
  //   else player.p.x = tempPlayerPos.x * easeInOutQuad(1 - progress);
  // }
};