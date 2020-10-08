import {
  cursorPos,
  pressDownPos,
  pressingKeys,
  $isPressing,
  detransform,
  cameraFrameSize,
  resolveClick,
  dash,
  slowDown,
  backToNormal,
  isAbleToDash,
  $canvasLeftOffset,
  player,
  transform,
  draw,
} from '../state';
import { vector } from '../utils';
import { KEY_PLAYER_CHARGE_FRAME, KEY_OBJECT_FRAME } from '../constants';
import { drawDragTrack } from '../helper/graphic';
import { resumeAudio } from '../helper/sound';

// window.addEventListener('keydown', ({ key }) => pressingKeys.add(key));
// window.addEventListener('keyup', ({ key }) => pressingKeys.delete(key));

function onPressMove({ clientX, clientY }) {
  cursorPos.x = clientX - $canvasLeftOffset.$;
  cursorPos.y = clientY;
}

function onPressDown({ clientX, clientY }) {
  cursorPos.x = clientX - $canvasLeftOffset.$;
  cursorPos.y = clientY;
  pressDownPos.x = clientX - $canvasLeftOffset.$;
  pressDownPos.y = clientY;
  $isPressing.$ = true;
  resolveClick();
  if(isAbleToDash()) slowDown();
  resumeAudio();
  player[KEY_PLAYER_CHARGE_FRAME] = player[KEY_OBJECT_FRAME];
}

function onPressUp() {
  $isPressing.$ = false;
  dash();
  backToNormal()
}

window.addEventListener('mousemove', onPressMove);
window.addEventListener('mousedown', onPressDown);
window.addEventListener('mouseup', onPressUp);
window.addEventListener('touchstart', ({ touches }) => onPressDown(touches[0]));
window.addEventListener('touchmove', ({ touches }) => onPressMove(touches[0]));
window.addEventListener('touchend', ({ touches }) => onPressUp(touches[0]));

export default () => {
  // draw(61, ctx => {
  //   let x = cursorPos.x;
  //   let y = cursorPos.y - 10;
  //   if (x > cameraFrameSize.x - 40) x -= 40;
  //   if (y < 40) y += 60;
  
  //   ctx.font = `10px sans-serif`;
  //   ctx.fillStyle = '#fff';
  //   ctx.fillText(
  //     `${(cursorPos.x).toFixed()}, ${cursorPos.y.toFixed()}`,
  //     x,
  //     y
  //   );
  //   const worldPos = detransform(vector(cursorPos.x, cursorPos.y));
  //   ctx.fillText(`${worldPos.x.toFixed()}, ${worldPos.y.toFixed()}`, x, y - 15);
  // });

  if ($isPressing.$) drawDragTrack(pressDownPos.x, pressDownPos.y, cursorPos.x, cursorPos.y)
};
