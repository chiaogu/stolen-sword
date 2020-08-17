import { $timeRatio, player, platforms, transform } from '../state';
import {
  vector,
  approach,
  getObjectBoundary,
  collision,
  vectorOp,
} from '../utils';
import {
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  GROUND_FRICTION,
  WALL_FRICTION,
} from '../constants';

export default (ctx) => {
  // platform collision
  platforms.map(platform => {
    vectorOp((pos, v) => pos + v  * $timeRatio.$, [platform.p, platform.v], platform.p);
    
    const groundBoundary = getObjectBoundary(platform);
    const collidedSide = collision(player, platform, $timeRatio.$);
    if (collidedSide === SIDE_T || collidedSide === SIDE_B) {
      player.v.y = platform.v.y;
      player.p.y =
        groundBoundary[collidedSide] +
        (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
      player.v.x = approach(
        player.v.x,
        platform.v.x,
        (platform.v.x - player.v.x) * GROUND_FRICTION
      )
    } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
      player.v.x = platform.v.x;
      player.p.x =
        groundBoundary[collidedSide] +
        (player.s.x / 2 - 1) * (collidedSide === SIDE_R ? 1 : -1);
      player.v.y = approach(
        player.v.y,
        platform.v.y,
        (platform.v.y - player.v.y) * WALL_FRICTION
      );
    }
    
    // draw platform
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(
      ...transform(vector(groundBoundary.l, groundBoundary.t)),
      transform(platform.s.x),
      transform(platform.s.y)
    );
  });
}