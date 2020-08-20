import {
  PLATFORM_TYPE_STANDARD,
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
  PLATFORM_TYPE_BOUNDARY,
  KEY_STAGE_INITIATE,
  KEY_PLATFORM_X_FOLLOW,
  KEY_PLATFORM_Y_FOLLOW,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  KEY_ENEMY_MOVEMENT,
  KEY_ENEMY_MOVEMENT_DURATION,
} from '../constants';
import {
  enemies,
  platforms,
  $cameraType,
  cameraFramePadding,
  player,
  cameraCenter,
} from '../state';
import { platform, enemy, alternateProgress } from '../utils';
import { easeInOutCubic } from '../easing';

export default {
  [KEY_STAGE_INITIATE]() {
    $cameraType.$ = CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN;
    cameraFramePadding.x = 0;
    cameraFramePadding.y = 200;
    cameraCenter.y = 304;
    player.p.x = -200;
    platforms.push(
      platform(PLATFORM_TYPE_STANDARD, 0, -player.s.y / 2, player.s.x * 2, 0, {
        [KEY_PLATFORM_X_FOLLOW]: true,
      }),
      platform(PLATFORM_TYPE_BOUNDARY, -500, 0, 0, player.s.y * 2, {
        [KEY_PLATFORM_Y_FOLLOW]: true,
      }),
      platform(PLATFORM_TYPE_BOUNDARY, 500, 0, 0, player.s.y * 2, {
        [KEY_PLATFORM_Y_FOLLOW]: true,
      })
    );
  },
  [KEY_STAGE_WAVES]: [
    () => enemies.push(
      enemy(200, 300, 50, 50, {
        [KEY_ENEMY_MOVEMENT_DURATION]: 3000,
        [KEY_ENEMY_MOVEMENT](pos, initialPos, progress) {
          const theta = progress * 2 * Math.PI;
          pos.x = initialPos.x + 20 * Math.cos(theta);
          pos.y = initialPos.y + 10 * Math.sin(theta);
        }
      })
    ),
    () => enemies.push(
      enemy(-300, 600, 50, 50, {
        [KEY_ENEMY_MOVEMENT_DURATION]: 3000,
        [KEY_ENEMY_MOVEMENT](pos, initialPos, progress) {
          const theta = progress * 2 * Math.PI;
          pos.x = initialPos.x + 20 * Math.cos(theta);
          pos.y = initialPos.y + 10 * Math.sin(theta);
        }
      })
    ),
    () => enemies.push(
      enemy(0, 600, 50, 50, {
        [KEY_ENEMY_MOVEMENT_DURATION]: 3000,
        [KEY_ENEMY_MOVEMENT](pos, initialPos, progress) {
          const theta = progress * 2 * Math.PI;
          pos.x = initialPos.x + 20 * Math.cos(theta);
          pos.y = initialPos.y + 10 * Math.sin(theta);
        }
      }),
      enemy(0, 1100, 50, 50, {
        [KEY_ENEMY_MOVEMENT_DURATION]: 6000,
        [KEY_ENEMY_MOVEMENT](pos, initialPos, progress) {
          pos.y = initialPos.y + easeInOutCubic(alternateProgress(progress)) * -150
        }
      })
    ),
  ],
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0;
  }
};