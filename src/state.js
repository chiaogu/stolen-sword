import { NORAML_TIME_RATIO } from './constants';
import { display } from './modules/display';
import { vectorStringify, vector, object } from './utils';

const ref = defaultValue => new Proxy({ 0: defaultValue }, {
  get: (object) => object[0],
  set: (object, p, value) => {
    object[0] = value;
    return true;
  }
});

// Player
export const player = object(0, 0, 30, 30);
display(() => `playerPos: ${vectorStringify(player.p)}`);
display(() => `playerV: ${vectorStringify(player.v)}`);

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
display(() => `cameraZoom: ${$cameraZoom.$}`)

// Time
export const $timeRatio = ref(NORAML_TIME_RATIO);

// Enemies
export const enemies = [];