const info = [];

export function display(getValue, isVisible = () => true) {
  info.push([getValue, isVisible]);
}

export default ctx => {
  info.map(([getValue, isVisible], index) => {
    if(!isVisible()) return;
    ctx.font = `20px`;
    ctx.fillStyle = '#fff';
    ctx.fillText(getValue(), 10, Math.floor(ctx.canvas.height / window.devicePixelRatio) - 15 * index - 20);
  });
}