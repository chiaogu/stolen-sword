import { vectorOp, object, objectEvent, getActionProgress } from '../utils';
import {
  player,
  enemies,
  platforms,
  projectiles,
  cameraCenter,
  $stage,
  $stageWave,
  $stageIndex,
  revive,
  $stageNextWave,
  $g,
  $maxReleaseVelocity
} from '../state';
import {
  KEY_STAGE_INITIATE,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_STAGE_TRANSITION_FRAME,
  KEY_STAGE_WAVES,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_TRANSITION,
  STAGE_TRANSITION_DURAION,
  G,
  MAX_RELEASE_VELOCITY,
  KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER
} from '../constants';
import stages from '../stages/index';

const creatStage = (config) => ({
  ...object(),
  ...config,
  [KEY_OBJECT_ON_UPDATE]: [update, checkTransition],
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
  $stage.$[KEY_STAGE_WAVES][wave]();
}

export function setStage(stageIndex, wave) {
  vectorOp(() => 0, [], player.p);
  vectorOp(() => 0, [], player.v);
  vectorOp(() => 0, [], cameraCenter);
  revive();
  $g.$ = G;
  $maxReleaseVelocity.$ = MAX_RELEASE_VELOCITY;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
  if(stageIndex < stages.length) {
    $stageIndex.$ = stageIndex;
    $stage.$ = creatStage(stages[stageIndex]);
    if(wave) setWave(wave);
    else $stageWave.$ = -1;
    $stage.$[KEY_STAGE_INITIATE]();
  }
}

function update(stage) {
  if (stage[KEY_STAGE_TRANSITION_FRAME] !== undefined) {
    const progress = getActionProgress(
      stage[KEY_OBJECT_FRAME] - stage[KEY_STAGE_TRANSITION_FRAME],
      STAGE_TRANSITION_DURAION,
      false
    );
    if (stage[KEY_STAGE_TRANSITION]) stage[KEY_STAGE_TRANSITION](progress);
  } else {
    if (
      stage[KEY_STAGE_IS_WAVE_CLEAN] &&
      stage[KEY_STAGE_IS_WAVE_CLEAN]()
    ) {
      if ($stageWave.$ === stage[KEY_STAGE_WAVES].length - 1) {
        setStage($stageIndex.$ + 1);
      } else {
        setWave($stageWave.$ + 1);
      }
    }
  }
}

const checkTransition = objectEvent(
  stage => _setWave($stageNextWave.$),
  STAGE_TRANSITION_DURAION,
  {
    [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) => {
      if(stage[KEY_STAGE_TRANSITION_FRAME] === undefined) {
        return stage[KEY_OBJECT_FRAME] - 1;
      } else {
        return stage[KEY_STAGE_TRANSITION_FRAME] - 1;
      }
    },
  }
);

setStage(0);

window.addEventListener('keydown', ({ key }) => {
  if (key === 'Shift') setStage(($stageIndex.$ + 1) % stages.length);
  if (key === 'Control') _setWave(($stageWave.$ + 1) % $stage.$[KEY_STAGE_WAVES].length);
});