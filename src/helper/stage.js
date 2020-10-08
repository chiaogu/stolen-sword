import {
  FRAME_DURAITON,
  G,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_UPDATE,
  KEY_PLAYER_DEATH_FRAME,
  KEY_STAGE_ENDING_CUT_SCENE,
  KEY_STAGE_ENDING_CUT_SCENE_FRAME,
  KEY_STAGE_ENDING_CUT_SCENE_INDEX,
  KEY_STAGE_ENDING_CUT_SCENE_KEY,
  KEY_STAGE_INITIATE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_START_KEY,
  KEY_STAGE_TRANSITION,
  KEY_STAGE_TRANSITION_FRAME,
  KEY_STAGE_WAVES,
  MAX_RELEASE_VELOCITY,
  STAGE_TRANSITION_DURAION,
  KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER,
  KEY_GAME_START_KEY,
  KEY_SAVE_STAGE,
  KEY_SAVE_WAVE
} from '../constants';
import stages from '../stages/index';
import {
  $backgroundColor,
  $backgroundV,
  $g,
  $maxReleaseVelocity,
  $reflectionGradient,
  $reflectionY,
  $stage,
  $stageIndex,
  $stageNextWave,
  $stageWave,
  cameraCenter,
  enemies,
  graphics,
  platforms,
  player,
  projectiles,
  revive,
  waitForClick,
  $isGameStarted,
  draw,
  $timeRatio,
  load,
  save,
  transform,
} from '../state';
import { getActionProgress, object, objectEvent, vectorOp, vector } from '../utils';
import { graphic, drawTitle, wipe } from './graphic';
import { playHarmony } from './sound';

let initialWave = +load(KEY_SAVE_WAVE) || 0;

const creatStage = (config) => ({
  ...object(),
  ...config,
  [KEY_OBJECT_ON_UPDATE]: [
    stage => {
      if ($stageWave.$ === -1 && $stageNextWave.$ !== initialWave) {
        if($isGameStarted.$) setWave(initialWave);
      } else if ($stageWave.$ === stage[KEY_STAGE_WAVES].length) {
        const [callback, duration = FRAME_DURAITON, wait] = stage[
          KEY_STAGE_ENDING_CUT_SCENE
        ][stage[KEY_STAGE_ENDING_CUT_SCENE_INDEX]];
        const frameDiff =
          stage[KEY_OBJECT_FRAME] - stage[KEY_STAGE_ENDING_CUT_SCENE_FRAME];
        if (frameDiff >= Math.round(duration / FRAME_DURAITON)) {
          stage[KEY_STAGE_ENDING_CUT_SCENE_FRAME] = stage[KEY_OBJECT_FRAME];
          const nextAnimation = () => {
            if (
              stage[KEY_STAGE_ENDING_CUT_SCENE_INDEX] <
              stage[KEY_STAGE_ENDING_CUT_SCENE].length - 1
            ) {
              stage[KEY_STAGE_ENDING_CUT_SCENE_FRAME] = stage[KEY_OBJECT_FRAME];
              stage[KEY_STAGE_ENDING_CUT_SCENE_INDEX]++;
              stage[KEY_STAGE_ENDING_CUT_SCENE][
                stage[KEY_STAGE_ENDING_CUT_SCENE_INDEX]
              ][0](0);
            } else {
              save(KEY_SAVE_WAVE, undefined);
              initialWave = 0;
              const nextStage = ($stageIndex.$ + 1) % stages.length;
              if(nextStage === 0) $isGameStarted.$ = false;
              setStage(nextStage);
            }
          };
          if (wait) {
            waitForClick(
              `${KEY_STAGE_ENDING_CUT_SCENE_KEY}${$stageIndex.$}${stage[KEY_STAGE_ENDING_CUT_SCENE_INDEX]}`,
              nextAnimation
            );
          } else {
            nextAnimation();
          }
        } else {
          callback(getActionProgress(frameDiff, duration));
        }
      } else if (stage[KEY_STAGE_TRANSITION_FRAME] !== undefined) {
        const progress = getActionProgress(
          stage[KEY_OBJECT_FRAME] - stage[KEY_STAGE_TRANSITION_FRAME],
          STAGE_TRANSITION_DURAION,
          false
        );
        if (stage[KEY_STAGE_TRANSITION]) stage[KEY_STAGE_TRANSITION](Math.max(0, Math.min(1, progress)));
      } else {
        if (
          !player[KEY_PLAYER_DEATH_FRAME] &&
          stage[KEY_STAGE_IS_WAVE_CLEAN] &&
          stage[KEY_STAGE_IS_WAVE_CLEAN]()
        ) {
          ($stageWave.$ === stage[KEY_STAGE_WAVES].length - 1 ? _setWave : setWave)(
            $stageWave.$ + 1
          );
        }
      }
    },
    objectEvent(
      () => _setWave($stageNextWave.$),
      STAGE_TRANSITION_DURAION,
      {
        [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) =>
          stage[
            stage[KEY_STAGE_TRANSITION_FRAME] === undefined
              ? KEY_OBJECT_FRAME
              : KEY_STAGE_TRANSITION_FRAME
          ] - 1,
        [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true
      }
    )
  ],
  [KEY_STAGE_ENDING_CUT_SCENE_INDEX]: 0,
  [KEY_STAGE_ENDING_CUT_SCENE_FRAME]: 0,
  [KEY_STAGE_ENDING_CUT_SCENE]: [
    [() => {}, 0],
    ...(config[KEY_STAGE_ENDING_CUT_SCENE] || []),
  ],
});

function setWave(wave) {
  $stageNextWave.$ = wave;
  $stage.$[KEY_STAGE_TRANSITION_FRAME] = $stage.$[KEY_OBJECT_FRAME];
  if ($stage.$[KEY_STAGE_TRANSITION]) $stage.$[KEY_STAGE_TRANSITION](0);
}

function _setWave(wave) {
  delete $stage.$[KEY_STAGE_TRANSITION_FRAME];
  enemies.splice(0, enemies.length);
  $stageWave.$ = wave;
  if(wave !== -1 && wave !== $stage.$[KEY_STAGE_WAVES].length) save(KEY_SAVE_WAVE, wave);
  if ($stage.$[KEY_STAGE_WAVES][wave])
    enemies.push(...$stage.$[KEY_STAGE_WAVES][wave]());
}

export function setStage(stageIndex, wave) {
  vectorOp(() => 0, [], player.p);
  vectorOp(() => 0, [], player.v);
  vectorOp(() => 0, [], cameraCenter);
  revive();
  $g.$ = G;
  $maxReleaseVelocity.$ = MAX_RELEASE_VELOCITY;
  $reflectionY.$ = undefined;
  $backgroundV.$ = 0;
  $backgroundColor.$ = undefined;
  $reflectionGradient.$ = undefined;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
  graphics.splice(0, graphics.length);
  if (stageIndex < stages.length) {
    $stageIndex.$ = stageIndex;
    $stageNextWave.$ = -1;
    $stage.$ = creatStage(stages[stageIndex]);
    if (wave) setWave(wave);
    else $stageWave.$ = -1;
    $stage.$[KEY_STAGE_INITIATE]();
    save(KEY_SAVE_STAGE, stageIndex);
  }
  if(!$isGameStarted.$) {
    let startFrame;
    const title = graphic(0,0,() => {
      let opacity;
      if(startFrame != undefined) {
        const progress = getActionProgress($stage.$[KEY_OBJECT_FRAME] - startFrame, 1000, false);
        if(progress >= 1) return graphics.splice(graphics.indexOf(title), 1);
        opacity = 1 - progress;
      } else {
        const progress = Math.min(1, getActionProgress($stage.$[KEY_OBJECT_FRAME], 2000, false));
        if(progress >= 1) {
          waitForClick(KEY_GAME_START_KEY, () => {
            playHarmony()
            $isGameStarted.$ = true;
            startFrame = $stage.$[KEY_OBJECT_FRAME];
          })
        }
        opacity = progress;
      }
      drawTitle(opacity);
    });
    graphics.push(title);
  }
}

setStage(+load(KEY_SAVE_STAGE) || 0);

// window.addEventListener('keydown', ({ key }) => {
//   if (key === 'Shift') setStage(($stageIndex.$ + 1) % stages.length);
//   if (key === 'Control')
//     _setWave(($stageWave.$ + 1) % $stage.$[KEY_STAGE_WAVES].length);
// });
