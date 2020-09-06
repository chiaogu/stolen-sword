import { vectorOp, objectAction, vector, approach } from './utils';
import { easeOutQuint } from './easing';
import {
  KEY_OBJECT_FRAME,
  FRAME_DURAITON,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_ON_UPDATE,
  KEY_ENEMY_DEAD_FRAME,
} from './constants';
import { $timeRatio } from './state';

const getOffset = (startTime) =>
  startTime ? () => startTime / FRAME_DURAITON : undefined;

export const circular = (x, y, rx, ry, progress, ratio = 1) => vector(
  x + rx * Math.cos(progress * 2 * Math.PI) * ratio,
  y + ry * Math.sin(progress * 2 * Math.PI) * ratio
);
  
export const circularMovement = (duration, xRadius, yRadius, startTime = 0, getProgress = v => v) => {
  let radiusProgress = 0;
  return objectAction(
    duration,
    (object, progress) => {
      if(!object[KEY_ENEMY_DEAD_FRAME]) {
        radiusProgress = Math.max(progress, radiusProgress);
        vectorOp(pos => pos, [
          circular(
            object[KEY_OBJECT_INITIAL_POS].x,
            object[KEY_OBJECT_INITIAL_POS].y,
            xRadius,
            yRadius,
            getProgress(progress),
            radiusProgress
          )
        ], object.p);
      }
    },
    {
      [KEY_OBJECT_EVENT_GET_OFFSET]: getOffset(startTime),
    }
  );
};

export const lemniscateMovement = (duration, radius, startTime = 0) => {
  let radiusProgress = 0;
  return objectAction(
    duration,
    (object, progress) => {
      if(!object[KEY_ENEMY_DEAD_FRAME]) {
        radiusProgress = Math.max(progress, radiusProgress);
        const theta = progress * 2 * Math.PI;
        const scale = radius * radiusProgress / (3 - Math.cos(2 * theta));
        object.p.x = object[KEY_OBJECT_INITIAL_POS].x + scale * Math.cos(theta);
        object.p.y = object[KEY_OBJECT_INITIAL_POS].y + scale * Math.sin(2*theta) / 2;
      }
    },
    {
      [KEY_OBJECT_EVENT_GET_OFFSET]: getOffset(startTime),
    }
  );
};

export const slideIn = (duration, x, y, timingFunc = easeOutQuint) =>
  objectAction(duration, (object, progress) => {
    if (!object[KEY_ENEMY_DEAD_FRAME] && progress > 0 && object[KEY_OBJECT_FRAME] < duration / FRAME_DURAITON) {
      vectorOp(
        (to, from) => from + (to - from) * timingFunc(progress),
        [object[KEY_OBJECT_INITIAL_POS], vector(x, y)],
        object.p
      );
    }
  });
  
export const follow = (object, offset, startTime) => 
  enemy => {
    if(!enemy[KEY_ENEMY_DEAD_FRAME] && enemy[KEY_OBJECT_FRAME] > startTime / FRAME_DURAITON) {
      enemy.p.y = object.p.y + offset.y;
      enemy.p.x = object.p.x + offset.x;
    }
  }
  
export const chase = (head, durations) => {
  const maxDuration = Math.max(...durations);
  const path = [];
  let lastFrame = 0;
  head[KEY_OBJECT_ON_UPDATE].push(enemy => {
    if(enemy[KEY_OBJECT_FRAME] > 0 && lastFrame !== Math.floor(enemy[KEY_OBJECT_FRAME])) {
      path.unshift(vector(enemy.p.x, enemy.p.y));
      if(path.length > maxDuration / FRAME_DURAITON) path.pop();
      lastFrame = Math.floor(enemy[KEY_OBJECT_FRAME]);
    }
  });
  return durations.map(duration => {
    return enemy => {
      if(!enemy[KEY_ENEMY_DEAD_FRAME]) {
        const pos = path[Math.floor(duration / FRAME_DURAITON) - 1];
        const prevPos = path[Math.floor(duration / FRAME_DURAITON) - 2];
        if(pos && prevPos) {
          enemy.p.x = approach(enemy.p.x, pos.x, (pos.x - prevPos.x) * $timeRatio.$)
          enemy.p.y = approach(enemy.p.y, pos.y, (pos.y - prevPos.y) * $timeRatio.$)
        }
      }
    }
  })
}