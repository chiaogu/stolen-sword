import { state, CURSOR_X, CURSOR_Y } from './state';

export default ctx => {
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${state(CURSOR_X)}, ${state(CURSOR_Y)}`, 100, 100);
}