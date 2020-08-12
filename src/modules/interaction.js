import { state, declare } from '../state';

export const CURSOR_X = declare(0);
export const CURSOR_Y = declare(0);
export const CURSOR_PRESSING = declare(false);
export const DRAG_START_X = declare(0);
export const DRAG_START_Y = declare(0);

function onMove({ clientX, clientY }) {
  state(CURSOR_X, clientX);
  state(CURSOR_Y, clientY);
}

function onDown({ clientX, clientY }) {
  state(CURSOR_PRESSING, true);
  state(DRAG_START_X, clientX);
  state(DRAG_START_Y, clientY);
}

function onUp() {
  state(CURSOR_PRESSING, false);
}

window.addEventListener('mousemove', onMove);
window.addEventListener('mousedown', onDown);
window.addEventListener('mouseup', onUp);

export default ctx => {
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${state(CURSOR_X)}, ${state(CURSOR_Y)}, ${state(CURSOR_PRESSING)}`, 100, 100);
  ctx.fillText(`${state(DRAG_START_X)}, ${state(DRAG_START_Y)}`, state(DRAG_START_X), state(DRAG_START_Y));
}