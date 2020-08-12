import modules from './modules/index';

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

!function tick() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  modules.map(render => render(ctx));
  requestAnimationFrame(tick);
}();