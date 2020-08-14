import { PRESS_DONW, PRESS_UP, emit } from '../events';
import { cursorPos, pressDownPos, pressingKeys, $isPressing } from '../state';

window.addEventListener('keydown', ({ key }) => pressingKeys.add(key));
window.addEventListener('keyup', ({ key }) => pressingKeys.delete(key));

function onPressMove({ clientX, clientY }) {
  cursorPos[0] = clientX;
  cursorPos[1] = clientY;
}

function onPressDown({ clientX, clientY }) {
  pressDownPos[0] = clientX;
  pressDownPos[1] = clientY;
  $isPressing.$ = true;
  emit(PRESS_DONW);
}

function onPressUp() {
  $isPressing.$ = false;
  emit(PRESS_UP);
}

window.addEventListener('mousemove', onPressMove);
window.addEventListener('mousedown', onPressDown);
window.addEventListener('mouseup', onPressUp);

export default ctx => {
    
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(cursorPos, ...cursorPos);
  
  if($isPressing.$) {
    // visualize drag track
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(...pressDownPos);
    ctx.lineTo(...cursorPos);
    ctx.stroke();
  }
}