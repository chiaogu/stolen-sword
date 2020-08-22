import { PRESS_DOWN, PRESS_UP, emit } from '../events';
import { cursorPos, pressDownPos, pressingKeys, $isPressing, detransform } from '../state';

const leftOffset = document.querySelector("canvas").getBoundingClientRect().left;
window.addEventListener('keydown', ({ key }) => pressingKeys.add(key));
window.addEventListener('keyup', ({ key }) => pressingKeys.delete(key));

function onPressMove({ clientX, clientY }) {
  cursorPos.x = clientX;
  cursorPos.y = clientY;
}

function onPressDown({ clientX, clientY }) {
  pressDownPos.x = clientX;
  pressDownPos.y = clientY;
  $isPressing.$ = true;
  emit(PRESS_DOWN);
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
  ctx.fillText(`${cursorPos.x.toFixed()}, ${cursorPos.y.toFixed()}`, cursorPos.x - leftOffset, cursorPos.y - 10);
  const worldPos = detransform(cursorPos);
  ctx.fillText(`${worldPos.x.toFixed()}, ${worldPos.y.toFixed()}`, cursorPos.x - leftOffset, cursorPos.y - 25);
  
  if($isPressing.$) {
    // visualize drag track
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pressDownPos.x, pressDownPos.y);
    ctx.lineTo(cursorPos.x, cursorPos.y);
    ctx.stroke();
  }
}