import {
  vectorOp,
} from '../utils';
import stages from '../stages/index';
import { player, enemies, platforms, projectiles, cameraCenter, $stage, $stageWave } from '../state';
import { KEY_STAGE_INITIATE } from '../constants';

export function nextStage() {
  setStage($stage.$ + 1)
}

export function getStage() {
  return stages[$stage.$];
}

export function setStage(stage) {
  vectorOp(_ => 0, [], player.p);
  vectorOp(_ => 0, [], player.v);
  vectorOp(_ => 0, [], cameraCenter);
  $stage.$ = stage;
  $stageWave.$ = -1;
  enemies.splice(0, enemies.length);
  platforms.splice(0, platforms.length);
  projectiles.splice(0, projectiles.length);
  getStage()[KEY_STAGE_INITIATE]();
}
