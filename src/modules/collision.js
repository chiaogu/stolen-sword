import { getBoundary, v } from './character';
import { transform } from './camera';

const wall = [-300, 300, 300, -300];

export default (ctx) => {
  // bounce off the walls
  const [l, t, r, b] = getBoundary();
  if(r > wall[2] || l < wall[0]) v[0] *= -1;
  if(b < wall[3] || t > wall[1]) v[1] *= -1;

  const [wl, wt] = transform([wall[0], wall[1]]);
  const [wr, wb] = transform([wall[2], wall[3]]);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(wl, wt, Math.abs(wr - wl), Math.abs(wt - wb));
};
