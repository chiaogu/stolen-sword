import { PRESS_DOWN, PRESS_UP, listen } from '../events';
import { removeAnimation, isAbleToDash, backToNormal, slowDown, animations, $timeRatio } from '../state'
import { NORAML_TIME_RATIO } from '../constants';

listen(PRESS_DOWN, () => {
  if(isAbleToDash()) slowDown();
});

listen(PRESS_UP, backToNormal);

window.addEventListener('keydown', ({ key }) => {
  if(key === 'Escape') $timeRatio.$ = $timeRatio.$ === 0 ? NORAML_TIME_RATIO : 0;
});

export default (ctx) => {
  // execute animation
  for(let i = animations.length - 1; i >= 0; i--) {
    const [id, callback, shouldStop] = animations[i];
    callback();
    if(shouldStop()) removeAnimation(id);
  }
}