import { getState, MOUSE_X, MOUSE_Y } from './state';

export default ctx => {
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${getState(MOUSE_X)}, ${getState(MOUSE_Y)}`, 100, 100);
}