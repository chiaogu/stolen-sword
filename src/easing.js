export const easeInQuad = t => t * t;
export const easeOutQuad = t => t * (2 - t);
export const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
export const easeInQuint = t => t * t * t * t * t;
export const easeOutQuint = t => 1 + --t * t * t * t * t;
export const easeInOutQuint = t => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t);
export const easeInCirc = t => -(Math.sqrt(1 - t * t) - 1);
export const easeOutCirc = t => Math.sqrt(1 - Math.pow(t - 1, 2));
export const easeInOutCirc = t => {
  if ((t /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
  return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}