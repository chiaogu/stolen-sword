import { isPressing, addOnPressUpListener, addOnPressDownListener } from './interaction';

export let timeRatio = 1;
const animations = [];
let animationId = 0;
const FRAME_DURAITON = 16;

addOnPressDownListener(() => {
  
});

addOnPressUpListener(() => {
  animateTo(v => console.log(`${v}`), 5000);
});


function removeAnimation(id) {
  const index = animations.findIndex(([_id]) => _id === id);
  if(index !== -1) animations.splice(index, 1);
}

export function animateTo(callback, duration = 1, timingFunc = v => v) {
  const id = animationId++;
  animations.push([id, 0, duration, timingFunc, callback]);
  return () => removeAnimation(id);
}

export function stepTo(callback, shouldStop) {
  const id = animationId++;
  animations.push([id, 0, duration, timingFunc, callback]);
  return () => removeAnimation(id);
}

export default (ctx) => {
  // update speed
  timeRatio = isPressing ? 0.1 : 1;
  
  // execute animation
  for(let i = animations.length - 1; i >= 0; i--) {
    const [id, frame, duration, timingFunc, callback] = animations[i];
    const time = frame * FRAME_DURAITON;
    callback(timingFunc(time / duration));
    animations[i][1]++;
    if(time >= duration) removeAnimation(id);
  }
}