import { display } from './modules/display';
import { toFixed } from './utils';

const ref = defaultValue => new Proxy({ 0: defaultValue }, {
  get: (object) => object[0],
  set: (object, p, value) => {
    object[0] = value;
    return true;
  }
});

// Player
export const playerPos = [0, 100];
export const playerV = [0, 0];
export const playerSize = [30, 30];
export function getPlayerBoundary() {
  return [
    playerPos[0] - playerSize[0] / 2,
    playerPos[1] + playerSize[1] / 2,
    playerPos[0] + playerSize[0] / 2,
    playerPos[1] - playerSize[1] / 2,
  ];
}

display(() => `pos: ${playerPos.map(toFixed)}`);
display(() => `v: ${playerV.map(toFixed)}`);

// Interaction
export const $isPressing = ref(false);
export const cursorPos = [0,0];
export const pressDownPos = [0,0];
export const pressingKeys = new Set();