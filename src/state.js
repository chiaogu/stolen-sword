import { NORAML_TIME_RATIO } from './constants';
import { display } from './modules/display';
import { vectorStringify, vector } from './utils';

const ref = defaultValue => new Proxy({ 0: defaultValue }, {
  get: (object) => object[0],
  set: (object, p, value) => {
    object[0] = value;
    return true;
  }
});

// Player
export const playerPos = vector(0, 100);
export const playerV = vector(0, 0);
export const playerSize = vector(30, 30);
export function getPlayerBoundary() {
  return {
    l: playerPos.x - playerSize.x / 2,
    t: playerPos.y + playerSize.y / 2,
    r: playerPos.x + playerSize.x / 2,
    b: playerPos.y - playerSize.y / 2,
  };
}
display(() => `playerPos: ${vectorStringify(playerPos)}`);
display(() => `playerV: ${vectorStringify(playerV)}`);

// Interaction
export const $isPressing = ref(false);
export const cursorPos = vector(0, 0);
export const pressDownPos = vector(0, 0);
export const pressingKeys = new Set();

// Camera
export const $isFocusingOnPlayer = ref(true);
export const cameraCenter = vector(0, 0);
export const cameraFrameSize = vector(window.innerWidth, window.innerHeight);
export const $cameraZoom = ref(1);
display(() => `camera: ${vectorStringify(cameraCenter)}`);
display(() => `camera zoom: ${$cameraZoom.$}`)

// Time
export const $timeRatio = ref(NORAML_TIME_RATIO);