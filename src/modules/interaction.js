export let isPressing = false;
export const cursorPos = [0,0];
export const pressDownPos = [0,0];

const onPressUpListeners = [];
const onPressDownListeners = [];
const onPressMoveListeners = [];

export function addOnPressUpListener(callback) {
  onPressUpListeners.push(callback);
}

function onPressMove({ clientX, clientY }) {
  cursorPos[0] = clientX;
  cursorPos[1] = clientY;
}

function onPressDown({ clientX, clientY }) {
  pressDownPos[0] = clientX;
  pressDownPos[1] = clientY;
  isPressing = true;
}

function onPressUp() {
  isPressing = false;
  onPressUpListeners.map(callback => callback());
}

window.addEventListener('mousemove', onPressMove);
window.addEventListener('mousedown', onPressDown);
window.addEventListener('mouseup', onPressUp);

export default ctx => {
  // ctx.font = `20px`;
  // ctx.fillStyle = '#fff';
  // ctx.fillText(`${cursorPos[0]}, ${cursorPos[1]}, ${isPressing}`, 100, 100);
}