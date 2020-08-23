import { PRESS_DOWN, PRESS_UP, emit } from '../events';
import { cursorPos, pressDownPos, pressingKeys, $isPressing, detransform, cameraFrameSize } from '../state';
import { vector } from '../utils';

const canvas = document.querySelector("canvas");
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
  const leftOffset = canvas.getBoundingClientRect().left;
  let x = cursorPos.x - leftOffset;
  let y = cursorPos.y - 10;
  if(x > cameraFrameSize.x - 40) x -= 40;
  if(y < 40) y += 60;
    
  ctx.font = `20px`;
  ctx.fillStyle = '#fff';
  ctx.fillText(`${(cursorPos.x  - leftOffset).toFixed()}, ${cursorPos.y.toFixed()}`, x, y);
  const worldPos = detransform(vector(cursorPos.x  - leftOffset, cursorPos.y));
  ctx.fillText(`${worldPos.x.toFixed()}, ${worldPos.y.toFixed()}`, x, y - 15);
  
  if($isPressing.$) {
    // visualize drag track
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pressDownPos.x - leftOffset, pressDownPos.y);
    ctx.lineTo(cursorPos.x - leftOffset, cursorPos.y);
    ctx.stroke();
  }
}