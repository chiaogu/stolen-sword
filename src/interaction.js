import { setState, MOUSE_X, MOUSE_Y } from './state';

window.addEventListener('mousemove', ({ clientX, clientY }) => {
  setState(MOUSE_X, clientX);
  setState(MOUSE_Y, clientY);
});