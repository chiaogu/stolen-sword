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
export function transform(value) {
  if(typeof value === 'number') {
    return value * $cameraZoom.$;
  } else {
    return [
      cameraFrameSize.x / 2 - (cameraCenter.x - value.x) * $cameraZoom.$,
      cameraFrameSize.y / 2 + (cameraCenter.y - value.y) * $cameraZoom.$,
    ];
  }
}

// Time
export const $timeRatio = ref(NORAML_TIME_RATIO);

// Enemies
export const enemies = [];

// Platforms
export const platforms = [
  object(0, -40, 1000, 20),
  object(-100, 0, 10, 500),
  ...Array(10).fill().map((_, i) => object(i % 2 === 0 ? -300 : -600, 200 * (i + 1), 300, 100))
];