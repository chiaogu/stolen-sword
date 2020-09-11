import modules from './modules/index';
import { $debug, $canvasLeftOffset } from './state';
import { ASPECT_RATIO, FRAME_DURAITON } from './constants';

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let devicePixelRatio;

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
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.scale(scale, scale);
  $canvasLeftOffset.$ = canvas.getBoundingClientRect().left;
}

window.addEventListener('resize', () => setTimeout(resize, FRAME_DURAITON));
resize();

let lastTimeTick;
function tick() { 
  if(devicePixelRatio != window.devicePixelRatio) resize();
  if(!lastTimeTick || (Date.now() - lastTimeTick) >= FRAME_DURAITON / 2) {
    modules.map(render => render(ctx));
    lastTimeTick = Date.now();
  }
  if(!$debug.$) requestAnimationFrame(tick);
};
tick();


window.addEventListener('keydown', ({ key }) => {
  if(key === '`') {
    $debug.$ = true;
    tick();
  }
  if(key === 'Backspace') {
    $debug.$ = false;
    tick();
  }
});