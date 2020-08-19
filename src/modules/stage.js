import {
  PLATFORM_TYPE_STANDARD,
  CAMERA_TYPE_FOCUS_ON_PLAYER,
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
  PLATFORM_TYPE_BOUNDARY,
  KEY_STAGE_INITIATE,
  KEY_PLATFORM_X_FOLLOW,
  KEY_PLATFORM_Y_FOLLOW
} from '../constants';
import { enemies, platforms, cameraFrameSize, $cameraType, cameraFramePadding, player, cameraCenter } from '../state';
import { platform, enemy } from '../utils';

const stage1 = {
  [KEY_STAGE_INITIATE]() {
    clear();
    $cameraType.$ = CAMERA_TYPE_FOCUS_ON_PLAYER;
    enemies.push(
      enemy(0, 300, 300, 100, 100)
    );
    platforms.push(
      platform(PLATFORM_TYPE_STANDARD, -200, 0, 10, 5000),
      platform(PLATFORM_TYPE_STANDARD, 0, -40, cameraFrameSize.x * 0.9, 0, { [KEY_PLATFORM_X_FOLLOW]: true }),
      ...Array(10)
        .fill()
        .map((_, i) =>
          platform(
            PLATFORM_TYPE_STANDARD,
            i % 2 === 0 ? -300 : -800,
            200 * (i + 1),
            300,
            100
          )
        )
    );
  }
};

const stage2 = {
  [KEY_STAGE_INITIATE]() {
    clear();
    $cameraType.$ = CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN;
    cameraFramePadding.x = 0;
    cameraFramePadding.y = 200;
    cameraCenter.y = 304;
    enemies.push(
      enemy(0, 300, 300, 50, 50),
      enemy(0, -300, 600, 50, 50)
    );
    platforms.push(
      platform(PLATFORM_TYPE_STANDARD, 0, -player.s.y / 2, player.s.x * 2, 0, { [KEY_PLATFORM_X_FOLLOW]: true }),
      platform(PLATFORM_TYPE_BOUNDARY, -500, 0, 0, player.s.y * 2, { [KEY_PLATFORM_Y_FOLLOW]: true }),
      platform(PLATFORM_TYPE_BOUNDARY, 500, 0, 0, player.s.y * 2, { [KEY_PLATFORM_Y_FOLLOW]: true }),
    );
  },
};

stage2[KEY_STAGE_INITIATE]();

window.addEventListener('keydown', ({ key }) => {
  if (key === '1') stage1[KEY_STAGE_INITIATE]();
  if (key === '2') stage2[KEY_STAGE_INITIATE]();
});

function clear() {
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
}

export default (ctx) => {};
