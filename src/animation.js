import { vectorOp, objectAction, vector, alternateProgress } from './utils';
import { easeOutCubic, easeInOutCubic } from './easing';
import {
  KEY_OBJECT_FRAME,
  FRAME_DURAITON,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_EVENT_IS_REPEAT,
} from './constants';
import { enemy } from './helper/enemy';

const getOffset = (startTime) =>
  startTime ? () => startTime / FRAME_DURAITON : undefined;

export const circularMovement = (duration, xRadius, yRadius, startTime = 0) => {
  let radiusProgress = 0;
  return objectAction(
    duration,
    (object, progress) => {
      radiusProgress = Math.max(progress, radiusProgress);
      const theta = progress * 2 * Math.PI;
      object.p.x =
        object[KEY_OBJECT_INITIAL_POS].x +
        xRadius * radiusProgress * Math.cos(theta);
      object.p.y =
        object[KEY_OBJECT_INITIAL_POS].y +
        yRadius * radiusProgress * Math.sin(theta);
    },
    {
      [KEY_OBJECT_EVENT_GET_OFFSET]: getOffset(startTime),
    }
  );
};

export const slideIn = (duration, x, y) =>
  objectAction(duration, (object, progress) => {
    if (progress > 0 && object[KEY_OBJECT_FRAME] < duration / FRAME_DURAITON) {
      vectorOp(
        (to, from) => from + (to - from) * easeOutCubic(progress),
        [object[KEY_OBJECT_INITIAL_POS], vector(x, y)],
        object.p
      );
    }
  });

export const parabolas = (duration, width, startTime) => {
  let widthProgress = 0;
  return objectAction(
    duration,
    (object, progress) => {
      widthProgress = Math.max(progress, widthProgress);
      progress = easeInOutCubic(alternateProgress(progress));
      const from = object[KEY_OBJECT_INITIAL_POS].x - width / 2 * widthProgress;
      const to = object[KEY_OBJECT_INITIAL_POS].x + width / 2 * widthProgress;
      const x = from + (to - from) * progress;
      object.p.x = x;
      object.p.y = object[KEY_OBJECT_INITIAL_POS].y + 0.01 * x * x;
    },
    {
      [KEY_OBJECT_EVENT_GET_OFFSET]: getOffset(startTime),
    }
  );
};

export const follow = (object, offset, startTime) => 
  enemy => {
    if(enemy[KEY_OBJECT_FRAME] > startTime / FRAME_DURAITON) {
      enemy.p.y = object.p.y + offset.y;
      enemy.p.x = object.p.x + offset.x;
    }
  }