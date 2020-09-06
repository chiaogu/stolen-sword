import { cameraFrameSize, drawStack, $backgroundColor, graphics, effects, draw, createLinearGradient, $reflectionGradient } from '../state';

export default ctx => {
  ctx.fillStyle = $backgroundColor.$ || '#000';
  ctx.fillRect(0, 0, cameraFrameSize.x + 1, cameraFrameSize.y);
  drawStack.forEach(layer => {
    while(layer.length > 0) {
      layer.shift()(ctx);
    }
  })
}