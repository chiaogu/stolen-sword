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

export function nextStage() {
  setStage($stageIndex.$ + 1);
}

export function nextWave() {
  $stage.$[KEY_STAGE_TRANSITION_FRAME] = $stage.$[KEY_OBJECT_FRAME];
}

export function setStage(stageIndex) {
  vectorOp((_) => 0, [], player.p);
  vectorOp((_) => 0, [], player.v);
  vectorOp((_) => 0, [], cameraCenter);
  revive();
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
  $stageIndex.$ = stageIndex;
  $stageWave.$ = -1;
  $stage.$ = creatStage(stages[stageIndex]);
  $stage.$[KEY_STAGE_INITIATE]();
}

function update(stage) {
  if (stage[KEY_STAGE_TRANSITION_FRAME]) {
    const progress = getActionProgress(
      stage[KEY_OBJECT_FRAME] - stage[KEY_STAGE_TRANSITION_FRAME],
      STAGE_TRANSITION_DURAION,
      false
    );
    if(stage[KEY_STAGE_TRANSITION]) stage[KEY_STAGE_TRANSITION](progress);
  } else {
    if (stage[KEY_STAGE_IS_WAVE_CLEAN] && stage[KEY_STAGE_IS_WAVE_CLEAN]()) {
      if ($stageWave.$ === stage[KEY_STAGE_WAVES].length - 1) {
        nextStage();
      } else {
        nextWave();
      }
    }
  }
}

const checkTransition = objectEvent(
  (stage) => {
    delete stage[KEY_STAGE_TRANSITION_FRAME];
    enemies.splice(0, enemies.length);
    stage[KEY_STAGE_WAVES][++$stageWave.$]();
  },
  STAGE_TRANSITION_DURAION,
  {
    [KEY_OBJECT_EVENT_GET_OFFSET]: (stage) => stage[KEY_STAGE_TRANSITION_FRAME],
  }
);

export const creatStage = (config) => ({
  ...object(),
  ...config,
  [KEY_OBJECT_ON_UPDATE]: [update, checkTransition],
});
