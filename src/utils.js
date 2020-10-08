import {
  SIDE_T,
  SIDE_R,
  SIDE_B,
  SIDE_L,
  FRAME_DURAITON,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_INITIAL_POS,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_EVENT_IS_REPEAT,
  KEY_OBJECT_EVENT_LAST_TRIGGER_FRAME,
  KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER,
  key,
} from './constants';

export const approach = (value, target, step) => {
  step = Math.abs(step);
  const diff = Math.abs(value - target);
  const sign = (value - target) / (diff || 1);
  return diff > step ? value - step * sign : target;
};
export const radiansToDegrees = (radians) => (radians * 180) / Math.PI;
export const vector = (x, y) => ({ x, y });
export const vectorAngle = (vectorA, vectorB) =>
  Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
export const vectorStringify = (vector) =>
  `${vector.x.toFixed(3)},${vector.y.toFixed(3)}`;
export const vectorOp = (callback, vectors, output = {}) => {
  output.x = callback(...vectors.map(({ x }) => x));
  output.y = callback(...vectors.map(({ y }) => y));
  return output;
};
export const vectorDistance = (vectorA, vectorB) =>
  Math.hypot(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
export const vectorMagnitude = (vectorA) =>
  vectorDistance(vectorA, vector(0, 0));
export const intersection = (a, b, c, d) => {
  const uA =
    ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) /
    ((d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y));
  const uB =
    ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) /
    ((d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y));

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return vector(a.x + uA * (b.x - a.x), a.y + uA * (b.y - a.y));
  }
};

export const object = (x, y, w, h, vx = 0, vy = 0) => ({
  p: vector(x, y),
  s: vector(w, h),
  v: vector(vx, vy),
  [KEY_OBJECT_FRAME]: 0,
  [KEY_OBJECT_INITIAL_POS]: vector(x, y),
});

export const getObjectBoundary = ({ p, s }) => ({
  [SIDE_L]: p.x - s.x / 2,
  [SIDE_T]: p.y + s.y / 2,
  [SIDE_R]: p.x + s.x / 2,
  [SIDE_B]: p.y - s.y / 2,
});

export const isOverlap = (objectA, objectB, timeRatio) => {
  const boundaryA = getObjectBoundary(objectA);
  const boundaryB = getObjectBoundary(objectB);
  return (
    boundaryA.l + objectA.v.x * timeRatio <
      boundaryB.r + objectB.v.x * timeRatio &&
    boundaryA.r + objectA.v.x * timeRatio >
      boundaryB.l + objectB.v.x * timeRatio &&
    boundaryA.t + objectA.v.y * timeRatio >
      boundaryB.b + objectB.v.y * timeRatio &&
    boundaryA.b + objectA.v.y * timeRatio <
      boundaryB.t + objectB.v.y * timeRatio
  );
};

const SIDES = [
  [SIDE_L, SIDE_T, SIDE_R, SIDE_T],
  [SIDE_R, SIDE_T, SIDE_R, SIDE_B],
  [SIDE_R, SIDE_B, SIDE_L, SIDE_B],
  [SIDE_L, SIDE_B, SIDE_L, SIDE_T],
];
export const isGoingThrough = (objectA, objectB, timeRatio) => {
  const nextAPos = vectorOp((pos, v) => pos + v * timeRatio, [
    objectA.p,
    objectA.v,
  ]);
  const boundaryB = getObjectBoundary(objectB);
  for (let [x1, y1, x2, y2] of SIDES) {
    const isIntersected = intersection(
      objectA.p,
      nextAPos,
      vector(boundaryB[x1], boundaryB[y1]),
      vector(boundaryB[x2], boundaryB[y2])
    );
    if (isIntersected) return true;
  }
  return false;
};

export const getClosetSide = (objectA, objectB) => {
  const angle = radiansToDegrees(vectorAngle(objectB.p, objectA.p));
  const boundaryB = getObjectBoundary(objectB);
  const ltAngle = radiansToDegrees(
    vectorAngle(objectB.p, vector(boundaryB.l, boundaryB.t))
  );
  const rtAngle = 180 - ltAngle;
  if (angle > rtAngle && angle < ltAngle) return SIDE_T;
  if (angle > ltAngle || angle < -ltAngle) return SIDE_L;
  if (angle < -rtAngle && angle > -ltAngle) return SIDE_B;
  if (angle > -rtAngle || angle < -rtAngle) return SIDE_R;
};

export const getActionProgress = (frame, duration, repeat = true) =>
  (repeat ? frame % Math.round(duration / FRAME_DURAITON) : frame) /
  Math.round(duration / FRAME_DURAITON);

export const alternateProgress = (process) => Math.abs(process - 0.5) * 2;

export const objectAction = (interval, callback, options = {}) => object => {
  let frame = object[KEY_OBJECT_FRAME];
  if (options[KEY_OBJECT_EVENT_GET_OFFSET])
    frame -= options[KEY_OBJECT_EVENT_GET_OFFSET](object) || frame;
  if(frame > 0) callback(object, getActionProgress(frame, interval));
}
  
export const objectEvent = (callback, interval, options = {}) => {
  const lastTriggerFrameKey = KEY_OBJECT_EVENT_LAST_TRIGGER_FRAME + key();
  return (object) => {
    if (
      options[KEY_OBJECT_EVENT_IS_REPEAT] !== false ||
      !object[lastTriggerFrameKey]
    ) {
      const targetFrame = Math.round(interval / FRAME_DURAITON);
      let frame = object[KEY_OBJECT_FRAME];
      if (options[KEY_OBJECT_EVENT_GET_OFFSET])
        frame -= options[KEY_OBJECT_EVENT_GET_OFFSET](object) || frame;
      frame = Math.round(frame);
      if (
        (options[KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER] || frame > 0) &&
        frame !== object[lastTriggerFrameKey] &&
        frame % targetFrame === 0
      ) {
        callback(object);
        object[lastTriggerFrameKey] = Math.round(object[KEY_OBJECT_FRAME]);
      }
    }
  };
};

export function decompressPath(str, offsetX = 0, offsetY = 0, scale = 1) {
  let z = 'charCodeAt';
  let x = 0;
  let y = 0;
  let xMin = 0;
  let yMin = 0
  let xMax = 0;
  let yMax = 0
  const result = [];
  str.split('').map(i => {
    let j = i[z]();
    let a = -(j >> 3) * 0.39 + 4.72;
    let d = (j & 7) * 4 + 4;
    x += d * Math.cos(a);
    y -= d * Math.sin(a);
    xMin = Math.min(x, xMin);
    yMin = Math.min(y, yMin);
    xMax = Math.max(x, xMax);
    yMax = Math.max(y, yMax);
    result.push(vector(x, y));
  });
  result.forEach(p => {
    p.x -= (xMax - xMin) / 2 + offsetX;
    p.y -= (yMax - yMin) / 2 + offsetY;
    p.x *= scale;
    p.y *= scale;
  })
  return {
    p: result.splice(1, result.length),
    w: xMax - xMin,
    h: yMax - yMin
  }
}

export const lerp = (a, b, p) => a + (b - a) * p;

export const rotate = (center, pos, angle) => {
  const cos = Math.cos(angle * 2 * Math.PI);
  const sin = Math.sin(angle * 2 * Math.PI);
  return vector(
    (cos * (pos.x - center.x)) + (sin * (pos.y - center.y)) + center.x,
    (cos * (pos.y - center.y)) - (sin * (pos.x - center.x)) + center.y
  )
}