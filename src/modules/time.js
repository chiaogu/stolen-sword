import { PRESS_DONW, PRESS_UP, listen } from '../events';
import { SLOW_DOWN_DURATION, SLOW_MOTION_TIME_RATIO, NORAML_TIME_RATIO, FRAME_DURAITON } from '../constants';
import { $timeRatio, isAbleToDash } from '../state'

const animations = [];
let animationId = 0;
let cancelTimeRatioAnimation

function removeAnimation(id) {
  const index = animations.findIndex(([_id]) => _id === id);
  if(index !== -1) animations.splice(index, 1);
}

export function slowDown() {
  cancelTimeRatioAnimation = animateTo(ratio => {
    $timeRatio.$ = NORAML_TIME_RATIO - (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) * ratio;
  }, SLOW_DOWN_DURATION, t => 1 + --t * t * t * t * t);
}

export function backToNormal() {
  if(cancelTimeRatioAnimation) cancelTimeRatioAnimation();
  $timeRatio.$ = NORAML_TIME_RATIO;
}

listen(PRESS_DONW, () => {
  if(isAbleToDash()) slowDown();
});

listen(PRESS_UP, backToNormal);

export function animateTo(callback, duration = 1, timingFunc = v => v) {
  let frame = 0;
  return stepTo(
    () => callback(timingFunc(Math.min(Math.max(frame++ * FRAME_DURAITON / duration, 0), 1))),
    () => frame * FRAME_DURAITON > duration
  );
}

export function stepTo(callback, shouldStop) {
  const id = animationId++;
  animations.push([id, callback, shouldStop]);
  return () => removeAnimation(id);
}

export default (ctx) => {
  // execute animation
  for(let i = animations.length - 1; i >= 0; i--) {
    const [id, callback, shouldStop] = animations[i];
    callback();
    if(shouldStop()) removeAnimation(id);
  }
}