import { state, declare, stepTo } from '../state';
import {
  DRAG_START_X,
  DRAG_START_Y,
  CURSOR_PRESSING,
  CURSOR_X,
  CURSOR_Y,
} from './interaction';

export const VX = declare(0);
export const VY = declare(0);
export const X = declare(0);
export const Y = declare(0);

window.addEventListener('mouseup', () => {
  
});

export default (ctx) => {
  if (state(CURSOR_PRESSING)) {
    state(X, state(CURSOR_X));
    state(Y, state(CURSOR_Y));
    state(VX, (state(CURSOR_X) - state(DRAG_START_X)) / 10);
    state(VY, (state(CURSOR_Y) - state(DRAG_START_Y)) / 10);
  } else {
    stepTo(VX, 0, state(VX) / 10);
    stepTo(VY, 0, state(VY) / 10);
    state(X, v => v - state(VX));
    state(Y, v => v - state(VY));
  }
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${state(VX)}, ${state(VY)}`, state(X), state(Y));
};
