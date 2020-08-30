import { cameraFrameSize, drawStack } from '../state';

export default ctx => {
  ctx.clearRect(0, 0, cameraFrameSize.x + 1, cameraFrameSize.y);
  drawStack.forEach(layer => {
    while(layer.length > 0) {
      layer.shift()(ctx);
    }
  })
}