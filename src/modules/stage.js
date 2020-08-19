import {
  PLATFORM_TYPE_STANDARD,
  CAMERA_TYPE_FOCUS_ON_PLAYER,
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
  PLATFORM_TYPE_BOUNDARY,
  KEY_STAGE_INITIATE,
  KEY_PLATFORM_X_FOLLOW,
  KEY_PLATFORM_Y_FOLLOW,
  KEY_STAGE_LOOP,
  KEY_STAGE_SET_WAVE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_IS_STAGE_CLEAN
} from '../constants';
import {
  enemies,
  platforms,
  cameraFrameSize,
  $cameraType,
  cameraFramePadding,
  player,
  cameraCenter,
  $stageWave,
  $stage
} from '../state';
import { platform, enemy } from '../utils';
import { display } from './display';

const stage1 = {
  [KEY_STAGE_INITIATE]() {
    clear();
    $cameraType.$ = CAMERA_TYPE_FOCUS_ON_PLAYER;
    enemies.push(enemy(0, 300, 300, 100, 100));
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
  },
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    // return enemies.length === 0;
    return false;
  },
  [KEY_STAGE_IS_STAGE_CLEAN]() {
    return false;
  },
};

const stage2 = {
  [KEY_STAGE_INITIATE]() {
    clear();
    $cameraType.$ = CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN;
    cameraFramePadding.x = 0;
    cameraFramePadding.y = 200;
    cameraCenter.y = 304;
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
  [KEY_STAGE_SET_WAVE]() {
    enemies.splice(0, enemies.length);
    if($stageWave.$ === 0) {
      enemies.push(enemy(0, 300, 300, 50, 50));
    } else if($stageWave.$ === 1) {
      enemies.push(enemy(0, 300, 300, 50, 50), enemy(0, -300, 600, 50, 50));
    }
  },
  [KEY_STAGE_IS_WAVE_CLEAN]() {
    return enemies.length === 0;
  },
  [KEY_STAGE_IS_STAGE_CLEAN]() {
    return $stageWave.$ === 2 && enemies.length === 0;
  },
};

function setStage(stage) {
  $stage.$ = stage;
  stage[KEY_STAGE_INITIATE]();
}

function nextStage() {
  setStage(stages[++currentStage]);
}

function clear() {
  $stageWave.$ = -1;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
}

window.addEventListener('keydown', ({ key }) => {
  if (key === '1') setStage(stage1);
  if (key === '2') setStage(stage2);
});

let currentStage = -1;
const stages = [stage2, stage1];

display(() => `currentStage: ${currentStage}`)

nextStage();

export default (ctx) => {
  if($stage.$) {
    if($stage.$[KEY_STAGE_LOOP]) $stage.$[KEY_STAGE_LOOP]();
    if($stage.$[KEY_STAGE_IS_STAGE_CLEAN]()) {
      nextStage();
    }
    if($stage.$[KEY_STAGE_IS_WAVE_CLEAN]()) {
      $stageWave.$++;
      $stage.$[KEY_STAGE_SET_WAVE]();
    }
  }
};
