import { PRESS_DONW, PRESS_UP, emit } from '../events';
import { cursorPos, pressDownPos, pressingKeys, $isPressing, cameraCenter, $cameraZoom } from '../state';

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
  ctx.fillText(`${cursorPos.x}, ${cursorPos.y}`, cursorPos.x, cursorPos.y);
  
  if($isPressing.$) {
    // visualize drag track
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pressDownPos.x, pressDownPos.y);
    ctx.lineTo(cursorPos.x, cursorPos.y);
    ctx.stroke();
  }
  
  if(pressingKeys.has('w')) cameraCenter.y += 10;
  if(pressingKeys.has('a')) cameraCenter.x -= 10;
  if(pressingKeys.has('s')) cameraCenter.y -= 10;
  if(pressingKeys.has('d')) cameraCenter.x += 10;
  if(pressingKeys.has('q')) $cameraZoom.$ += 0.01;
  if(pressingKeys.has('e')) $cameraZoom.$ -= 0.01;
}