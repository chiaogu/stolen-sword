import draw from './draw';
import './interaction';

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

!function tick() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw(ctx);
  requestAnimationFrame(tick);
}();