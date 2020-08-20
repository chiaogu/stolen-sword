import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_LOOP,
  KEY_STAGE_SET_WAVE,
  KEY_STAGE_IS_WAVE_CLEAN,
  KEY_STAGE_IS_STAGE_CLEAN,
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $stageWave,
  $stage
} from '../state';
import { vectorOp } from '../utils';
import { display } from './display';
import stage1 from '../stages/stage1';
import playground from '../stages/playground';

function setStage(stage) {
  reset();
  $stage.$ = stage;
  stage[KEY_STAGE_INITIATE]();
}

function nextStage() {
  setStage(stages[++currentStage]);
}

function reset() {
  vectorOp(_ => 0, [], player.p);
  vectorOp(_ => 0, [], player.v);
  vectorOp(_ => 0, [], cameraCenter);
  $stageWave.$ = -1;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
}

window.addEventListener('keydown', ({ key }) => {
  if (key === '1') setStage(playground);
  if (key === '2') setStage(stage1);
});

let currentStage = -1;
const stages = [stage1, playground];

display(() => `currentStage: ${currentStage}`)

nextStage();

export default (ctx) => {
  if($stage.$) {
    if($stage.$[KEY_STAGE_LOOP]) $stage.$[KEY_STAGE_LOOP]();
    if($stage.$[KEY_STAGE_IS_STAGE_CLEAN] && $stage.$[KEY_STAGE_IS_STAGE_CLEAN]()) {
      nextStage();
    }
    if($stage.$[KEY_STAGE_IS_WAVE_CLEAN] && $stage.$[KEY_STAGE_IS_WAVE_CLEAN]()) {
      $stageWave.$++;
      $stage.$[KEY_STAGE_SET_WAVE]();
    }
  }
};
