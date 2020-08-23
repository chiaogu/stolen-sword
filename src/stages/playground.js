import {
  KEY_STAGE_INITIATE,
  KEY_OBJECT_ON_UPDATE
} from '../constants';
import {
  enemies,
  platforms,
  cameraFrameSize,
} from '../state';
import { enemy } from '../helper/enemy';
import { platform, followPlayerX } from '../helper/platform';

export default {
  [KEY_STAGE_INITIATE]() {
    enemies.push(enemy(300, 300, 100, 100));
    platforms.push(
      platform(-200, 0, 10, 5000),
      platform(0, -40, cameraFrameSize.x * 0.9, 0, {
        [KEY_OBJECT_ON_UPDATE]: [followPlayerX],
      }),
      ...Array(10)
        .fill()
        .map((_, i) =>
          platform(
            i % 2 === 0 ? -300 : -800,
            200 * (i + 1),
            300,
            100
          )
        )
    );
  }
};