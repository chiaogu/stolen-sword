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
} from '../constants';
import stages from '../stages/index';

const creatStage = (config) => ({
  ...object(),
  ...config,
  [KEY_OBJECT_ON_UPDATE]: [update, checkTransition],
});

function nextStage() {
  setStage($stageIndex.$ + 1);
}

function nextWave(wave = $stageWave.$ + 1) {
  $stageNextWave.$ = wave;
  $stage.$[KEY_STAGE_TRANSITION_FRAME] = $stage.$[KEY_OBJECT_FRAME];
  if ($stage.$[KEY_STAGE_TRANSITION]) $stage.$[KEY_STAGE_TRANSITION](0);
}

function setWave(wave) {
  delete $stage.$[KEY_STAGE_TRANSITION_FRAME];
  enemies.splice(0, enemies.length);
  $stageWave.$ = wave;
  $stage.$[KEY_STAGE_WAVES][$stageWave.$]();
}

export function setStage(stageIndex) {
  vectorOp(() => 0, [], player.p);
  vectorOp(() => 0, [], player.v);
  vectorOp(() => 0, [], cameraCenter);
  revive();
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
  if(stageIndex < stages.length) {
    $stageIndex.$ = stageIndex;
    $stageWave.$ = -1;
    $stage.$ = creatStage(stages[stageIndex]);
    $stage.$[KEY_STAGE_INITIATE]();
  }
}

function update(stage) {
  if (stage[KEY_STAGE_TRANSITION_FRAME]) {
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
        nextStage();
      } else {
        nextWave();
      }
    }
  }
}

const checkTransition = objectEvent(
  () => setWave($stageNextWave.$),
  STAGE_TRANSITION_DURAION,
  {
    [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) => stage[KEY_STAGE_TRANSITION_FRAME],
  }
);

nextStage();

window.addEventListener('keydown', ({ key }) => {
  if (key === 'Shift') setStage(($stageIndex.$ + 1) % stages.length);
  if (key === 'Control') setWave(($stageWave.$ + 1) % $stage.$[KEY_STAGE_WAVES].length);
});