import {
  KEY_STAGE_LOOP,
  KEY_STAGE_WAVES,
  KEY_STAGE_IS_WAVE_CLEAN
} from '../constants';
import {
  enemies,
  $stageWave,
  $stage
} from '../state';
import { setStage, getStage, nextStage } from '../helper/stage'; 

window.addEventListener('keydown', ({ key }) => {
  if (key === '1') setStage(0);
  if (key === '2') setStage(1);
});

nextStage();

export default () => {
  const stage = getStage();
  if(stage) {
    if(stage[KEY_STAGE_LOOP]) stage[KEY_STAGE_LOOP]();
    if(stage[KEY_STAGE_IS_WAVE_CLEAN] && stage[KEY_STAGE_IS_WAVE_CLEAN]()) {
      if($stageWave.$ === stage[KEY_STAGE_WAVES].length - 1) {
        nextStage();
      } else {
        enemies.splice(0, enemies.length);
        stage[KEY_STAGE_WAVES][++$stageWave.$]();
      }
    }
  }
};
