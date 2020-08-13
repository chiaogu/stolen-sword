import { isPressing, addOnPressUpListener, addOnPressDownListener } from './interaction';

const FRAME_DURAITON = 16;
const SLOW_DOWN_DURATION = 1000;
const SLOW_MOTION_TIME_RATIO = 0.05;
const NORAML_TIME_RATIO = 1;
const animations = [];
let animationId = 0;
let cancelTimeRatioAnimation

export let timeRatio = NORAML_TIME_RATIO;

addOnPressDownListener(() => {
  // const diffPerFrame = (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) / (SLOW_DOWN_DURATION / FRAME_DURAITON);
  // cancelTimeRatioAnimation = stepTo(
  //   () => {
      // let newTimeRatio = timeRatio - diffPerFrame * (isPressing ? 1 : -1);
      // timeRatio = Math.min(Math.max(newTimeRatio, SLOW_MOTION_TIME_RATIO), NORAML_TIME_RATIO)
  //   }, 
  //   () => isPressing ? timeRatio <= SLOW_MOTION_TIME_RATIO : timeRatio >= NORAML_TIME_RATIO
  // );
  cancelTimeRatioAnimation = animateTo(ratio => {
    timeRatio = NORAML_TIME_RATIO - (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) * ratio;
  }, SLOW_DOWN_DURATION, t => 1 + --t * t * t * t * t)
});

addOnPressUpListener(() => {
  if(cancelTimeRatioAnimation) cancelTimeRatioAnimation();
  timeRatio = NORAML_TIME_RATIO;
});


function removeAnimation(id) {
  const index = animations.findIndex(([_id]) => _id === id);
  if(index !== -1) animations.splice(index, 1);
}

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