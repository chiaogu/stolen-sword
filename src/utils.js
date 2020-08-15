export const toFixed = value => value;
export const toZero = (value, step) => {
  const abs = Math.abs(value);
  const scalar = value / abs;
  const diff = abs - step;
  return diff < 0 ? 0 : diff * scalar;
}
export const vector = (x, y) => ({ x, y });
export const vectorStringify = vector => `${vector.x.toFixed()},${vector.y.toFixed()}`;
export const vectorOp = (callback, vectors, output = {}) => {
  output.x = callback(...vectors.map(({ x }) => x));
  output.y = callback(...vectors.map(({ y }) => y));
  return output;
};
// export const addWindowEventListenr = (...args) => window.addEventListener(...args);
// export const beginPath = (ctx, ...args) => ctx.beginPath(...args);
// export const moveTo = (ctx, ...args) => ctx.moveTo(...args);
// export const lineTo = (ctx, ...args) => ctx.lineTo(...args);
// export const stroke = (ctx, ...args) => ctx.stroke(...args);
// export const fill = (ctx, ...args) => ctx.fill(...args);
// export const fillText = (ctx, ...args) => ctx.fillText(...args);
// export const fillRect = (ctx, ...args) => ctx.fillRect(...args);