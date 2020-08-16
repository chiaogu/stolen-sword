import { SIDE_T, SIDE_R, SIDE_B, SIDE_L } from './constants';

export const toZero = (value, step) => {
  const abs = Math.abs(value);
  const scalar = value / (abs || 1);
  const diff = abs - Math.abs(step);
  return diff < 0 ? 0 : diff * scalar;
}
export const radiansToDegrees = radians => radians * 180 / Math.PI;
export const vector = (x, y) => ({ x, y });
export const vectorAngle = (vectorA, vectorB) => Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
export const vectorStringify = vector => `${vector.x.toFixed(3)},${vector.y.toFixed(3)}`;
export const vectorOp = (callback, vectors, output = {}) => {
  output.x = callback(...vectors.map(({ x }) => x));
  output.y = callback(...vectors.map(({ y }) => y));
  return output;
};

export const object = (x, y, w, h) => ({
  p: vector(x, y),
  s: vector(w, h),
  v: vector(0, 0)
});
export const getObjectBoundary = ({ p, s }) => ({
  [SIDE_L]: p.x - s.x / 2,
  [SIDE_T]: p.y + s.y / 2,
  [SIDE_R]: p.x + s.x / 2,
  [SIDE_B]: p.y - s.y / 2,
});

export const collision = (objectA, objectB) => {
  const boundaryA = getObjectBoundary(objectA);
  const boundaryB = getObjectBoundary(objectB);
  const isCollided = 
    boundaryA.l + objectA.v.x < boundaryB.r + objectB.v.x &&
    boundaryA.r + objectA.v.x > boundaryB.l + objectB.v.x &&
    boundaryA.t + objectA.v.y > boundaryB.b + objectB.v.y &&
    boundaryA.b + objectA.v.y < boundaryB.t + objectB.v.y;
  if(!isCollided) return;
  
  const angle = radiansToDegrees(vectorAngle(objectB.p, objectA.p));
  const ltAngle = radiansToDegrees(vectorAngle(objectB.p, vector(boundaryB.l, boundaryB.t)));
  const rtAngle = 180 - ltAngle;
  if(angle > rtAngle && angle < ltAngle) return SIDE_T;
  if(angle > ltAngle || angle < -ltAngle) return SIDE_L;
  if(angle < -rtAngle && angle > -ltAngle) return SIDE_B;
  if(angle > -rtAngle || angle < -rtAngle) return SIDE_R;
}

// export const addWindowEventListenr = (...args) => window.addEventListener(...args);
// export const beginPath = (ctx, ...args) => ctx.beginPath(...args);
// export const moveTo = (ctx, ...args) => ctx.moveTo(...args);
// export const lineTo = (ctx, ...args) => ctx.lineTo(...args);
// export const stroke = (ctx, ...args) => ctx.stroke(...args);
// export const fill = (ctx, ...args) => ctx.fill(...args);
// export const fillText = (ctx, ...args) => ctx.fillText(...args);
// export const fillRect = (ctx, ...args) => ctx.fillRect(...args);