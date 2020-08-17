import { $timeRatio, player, platforms, transform, resetDash } from '../state';
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
import { listen, PLAYER_POS_CHANGE } from '../events';

listen(PLAYER_POS_CHANGE, () => {
  platforms[0].p.x = player.p.x;
  vectorOp(pos => pos, [player.p], );
});

export default (ctx) => {
  // platform collision
  platforms.map(platform => {
    vectorOp((pos, v) => pos + v  * $timeRatio.$, [platform.p, platform.v], platform.p);
    const platformBoundary = getObjectBoundary(platform);
    const collidedSide = collision(player, platform, $timeRatio.$);
    if(collidedSide === SIDE_T) resetDash();
    if (collidedSide === SIDE_T || collidedSide === SIDE_B) {
      player.v.y = platform.v.y;
      player.p.y =
        platformBoundary[collidedSide] +
        (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
      player.v.x = approach(
        player.v.x,
        platform.v.x,
        (platform.v.x - player.v.x) * GROUND_FRICTION
      )
    } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
      resetDash();
      player.v.x = platform.v.x;
      player.p.x =
        platformBoundary[collidedSide] +
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
      ...transform(vector(platformBoundary.l, platformBoundary.t)),
      transform(platform.s.x),
      transform(platform.s.y)
    );
  });
}