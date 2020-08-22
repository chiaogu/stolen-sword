import {
  PLATFORM_TYPE_STANDARD,
  KEY_STAGE_INITIATE,
  KEY_PLATFORM_X_FOLLOW,
} from '../constants';
import {
  enemies,
  platforms,
  cameraFrameSize,
} from '../state';
import { platform, enemy } from '../utils';

export default {
  [KEY_STAGE_INITIATE]() {
    enemies.push(enemy(300, 300, 100, 100));
    platforms.push(
      platform(PLATFORM_TYPE_STANDARD, -200, 0, 10, 5000),
      platform(PLATFORM_TYPE_STANDARD, 0, -40, cameraFrameSize.x * 0.9, 0, {
        [KEY_PLATFORM_X_FOLLOW]: true,
      }),
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