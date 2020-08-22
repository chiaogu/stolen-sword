import {
  PLATFORM_TYPE_STANDARD,
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
  PLATFORM_TYPE_BOUNDARY,
  KEY_STAGE_INITIATE,
  KEY_PLATFORM_X_FOLLOW,
  KEY_PLATFORM_Y_FOLLOW,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_WAVES,
  KEY_PLATFORM_LOOP,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_ON_UPDATE
} from '../constants';
import {
  enemies,
  platforms,
  $cameraType,
  cameraFramePadding,
  player,
  cameraCenter,
  cameraFrameSize,
  detransform,
} from '../state';
import { platform, enemy, alternateProgress, objectEvent } from '../utils';
import { easeInOutCubic } from '../easing';

const circularMovement = (duration, xRadius, yRadius) => objectEvent(duration, (enemy, progress) => {
  const theta = progress * 2 * Math.PI;
  enemy.p.x = enemy[KEY_OBJECT_INITIAL_POS].x + xRadius * Math.cos(theta);
  enemy.p.y = enemy[KEY_OBJECT_INITIAL_POS].y + yRadius * Math.sin(theta);
});

export default {
  [KEY_STAGE_INITIATE]() {
    $cameraType.$ = CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN;
    cameraFramePadding.x = 0;
    cameraFramePadding.y = 200;
    cameraCenter.y = 304;
    player.p.x = 0;
    platforms.push(
      platform(PLATFORM_TYPE_STANDARD, 0, -player.s.y / 2, player.s.x * 2, 0, {
        [KEY_PLATFORM_X_FOLLOW]: true,
      }),
      platform(PLATFORM_TYPE_BOUNDARY, 100, 0, 0, player.s.y * 2, {
        [KEY_PLATFORM_Y_FOLLOW]: true,
        [KEY_PLATFORM_LOOP](platform) {
          platform.p.x = detransform(-cameraFrameSize.x / 2);
        }
      }),
      platform(PLATFORM_TYPE_BOUNDARY, -100, 0, 0, player.s.y * 2, {
        [KEY_PLATFORM_Y_FOLLOW]: true,
        [KEY_PLATFORM_LOOP](platform) {
          platform.p.x = detransform(cameraFrameSize.x / 2);
        }
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
      enemy(-75, 400, 30, 30, {
        [KEY_OBJECT_ON_UPDATE]:[
          circularMovement(5000, 20, 10)
        ]
      }),
      enemy(75, 350, 30, 30, {
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