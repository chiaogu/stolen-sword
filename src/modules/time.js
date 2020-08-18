import { PRESS_DOWN, PRESS_UP, listen } from '../events';
import { removeAnimation, isAbleToDash, backToNormal, slowDown, animations } from '../state'

listen(PRESS_DOWN, () => {
  if(isAbleToDash()) slowDown();
});

listen(PRESS_UP, backToNormal);


export default (ctx) => {
  // execute animation
  for(let i = animations.length - 1; i >= 0; i--) {
    const [id, callback, shouldStop] = animations[i];
    callback();
    if(shouldStop()) removeAnimation(id);
  }
}