import { fillText } from '../utils';

const info = [];

export function display(getValue, isVisible = () => true) {
  info.push([getValue, isVisible]);
}

export default ctx => {
  info.map(([getValue, isVisible], index) => {
    if(!isVisible()) return;
    ctx.font = `20px`;
    ctx.fillStyle = '#fff';
    fillText(ctx, getValue(), 30, 30 + 20 * index);
  });
}