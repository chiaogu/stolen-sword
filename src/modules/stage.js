import {
  KEY_STAGE_INITIATE,
  KEY_STAGE_LOOP,
  KEY_STAGE_WAVES,
  KEY_STAGE_IS_WAVE_CLEAN
} from '../constants';
import {
  enemies,
  platforms,
  player,
  cameraCenter,
  $stageWave,
  $stage,
  projectiles
} from '../state';
import { vectorOp } from '../utils';
import { display } from './display';
import stage1 from '../stages/stage1';
import playground from '../stages/playground';

function setStage(stageIndex) {
  reset();
  currentStage = stageIndex;
  $stage.$ = stages[stageIndex];
  $stage.$[KEY_STAGE_INITIATE]();
}

function nextStage() {
  setStage(currentStage + 1);
}

function reset() {
  vectorOp(_ => 0, [], player.p);
  vectorOp(_ => 0, [], player.v);
  vectorOp(_ => 0, [], cameraCenter);
  $stageWave.$ = -1;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
}

window.addEventListener('keydown', ({ key }) => {
  if (key === '1') setStage(0);
  if (key === '2') setStage(1);
});

let currentStage = -1;
const stages = [stage1, playground];

display(() => `currentStage: ${currentStage}`)

nextStage();

export default (ctx) => {
  if($stage.$) {
    if($stage.$[KEY_STAGE_LOOP]) $stage.$[KEY_STAGE_LOOP]();
    if($stage.$[KEY_STAGE_IS_WAVE_CLEAN] && $stage.$[KEY_STAGE_IS_WAVE_CLEAN]()) {
      if($stageWave.$ === $stage.$[KEY_STAGE_WAVES].length - 1) {
        nextStage();
      } else {
        enemies.splice(0, enemies.length);
        $stage.$[KEY_STAGE_WAVES][++$stageWave.$]();
      }
    }
  }
};
