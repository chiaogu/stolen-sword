import { KEY_STAGE_PLATFORMS, KEY_STAGE_ENEMIES, PLATFORM_TYPE_X_FOLLOW_PLAYER, PLATFORM_TYPE_STANDARD } from "../constants";
import { enemies, platforms, cameraFrameSize } from "../state";
import { platform, enemy } from "../utils";

const STAGE_1 = {
  [KEY_STAGE_PLATFORMS]: [
    platform(PLATFORM_TYPE_X_FOLLOW_PLAYER, 0, -40, cameraFrameSize.x * 0.9, 0),
    ...Array(10).fill().map((_, i) => platform(PLATFORM_TYPE_STANDARD, i % 2 === 0 ? -300 : -800, 200 * (i + 1), 300, 100))
  ],
  [KEY_STAGE_ENEMIES]: [
    enemy(0, 300, 300, 100, 100)
  ], 
};

const STAGE_2 = {
  [KEY_STAGE_PLATFORMS]: [
    platform(PLATFORM_TYPE_STANDARD, -200, 0, 10, 5000)
  ],
  [KEY_STAGE_ENEMIES]: [
    enemy(0, -300, 300, 100, 100)
  ], 
};

console.log({ PLATFORM_TYPE_STANDARD, PLATFORM_TYPE_X_FOLLOW_PLAYER })

setStage(STAGE_1);

window.addEventListener('keydown', ({ key }) => {
  if(key === '1') setStage(STAGE_1);
  if(key === '2') setStage(STAGE_2);
});

function setStage(stage) {
  enemies.splice(0, enemies.length);
  enemies.push(...JSON.parse(JSON.stringify(stage[KEY_STAGE_ENEMIES])));
  platforms.splice(0, platforms.length);
  platforms.push(...JSON.parse(JSON.stringify(stage[KEY_STAGE_PLATFORMS])));
}

export default ctx => {
  
}