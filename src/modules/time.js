import { PRESS_DONW, PRESS_UP, listen } from '../events';
import { SLOW_DOWN_DURATION, SLOW_MOTION_TIME_RATIO, NORAML_TIME_RATIO } from '../constants';
import { $timeRatio } from '../state'

const FRAME_DURAITON = 16;
const animations = [];
let animationId = 0;
let cancelTimeRatioAnimation

function removeAnimation(id) {
  const index = animations.findIndex(([_id]) => _id === id);
  if(index !== -1) animations.splice(index, 1);
}

listen(PRESS_DONW, () => {
  cancelTimeRatioAnimation = animateTo(ratio => {
    $timeRatio.$ = NORAML_TIME_RATIO - (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) * ratio;
  }, SLOW_DOWN_DURATION, t => 1 + --t * t * t * t * t)
});

listen(PRESS_UP, () => {
  if(cancelTimeRatioAnimation) cancelTimeRatioAnimation();
  $timeRatio.$ = NORAML_TIME_RATIO;
});

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