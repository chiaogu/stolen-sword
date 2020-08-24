import modules from './modules/index';

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const ASPECT_RATIO = 16 / 9;
let devicePixelRatio;

canvas.style.border = '1px solid #fff';
canvas.style.boxSizing = 'border-box';

function resize() {
  devicePixelRatio = window.devicePixelRatio;
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  if(vw < vh / ASPECT_RATIO) vh = vw * ASPECT_RATIO;
  if(vh < vw * ASPECT_RATIO) vw = vh / ASPECT_RATIO;
  const scale = window.devicePixelRatio;
  canvas.style.width = Math.floor(vw);
  canvas.style.height = Math.floor(vh);
  canvas.width = Math.floor(vw * scale);
  canvas.height = Math.floor(vh * scale);
  ctx.scale(scale, scale);
}

window.addEventListener('resize', resize);
resize();

!function tick() { 
  if(devicePixelRatio != window.devicePixelRatio) resize();
  modules.map(render => render(ctx));
  requestAnimationFrame(tick);
}();