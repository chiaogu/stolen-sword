import { vectorOp, objectAction, vector } from './utils';
import { easeOutCubic } from './easing';
import { KEY_OBJECT_FRAME, FRAME_DURAITON, KEY_OBJECT_INITIAL_POS, KEY_OBJECT_EVENT_GET_OFFSET } from './constants';

export const circularMovement = (duration, xRadius, yRadius, startTime = 0) => {
  let radiusProgress = 0;
  const startFrame = startTime / 16;
  return objectAction(duration, (object, progress) => {
    radiusProgress = Math.max(progress, radiusProgress);
    const theta = progress * 2 * Math.PI;
    object.p.x = object[KEY_OBJECT_INITIAL_POS].x + xRadius * radiusProgress * Math.cos(theta);
    object.p.y = object[KEY_OBJECT_INITIAL_POS].y + yRadius * radiusProgress * Math.sin(theta);
  }, {
    [KEY_OBJECT_EVENT_GET_OFFSET]: startTime ? () => startFrame : undefined
  });
}

export const slideIn = (duration, x, y) =>
  objectAction(duration, (object, progress) => {
    if(object[KEY_OBJECT_FRAME] <= duration / FRAME_DURAITON) {
      vectorOp(
        (to, from) => from + (to - from) * easeOutCubic(progress),
        [object[KEY_OBJECT_INITIAL_POS], vector(x, y)],
        object.p
      );
    }
  });
