import {
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_PROJECTILE_IS_COMSUMED,
  KEY_PROJECTILE_SORUCE,
} from '../constants';
import {
  $timeRatio,
  draw,
  getReflection,
  playerDamage,
  transform,
  $reflectionGradient,
  isUnderWater,
} from '../state';
import { getObjectBoundary, object, vector, vectorOp } from '../utils';
import { checkRipple } from './graphic';

export const projectile = (enemy, v) => ({
  ...object(enemy.p.x, enemy.p.y, 10, 10, v.x, v.y),
  [KEY_PROJECTILE_SORUCE]: enemy,
  [KEY_OBJECT_ON_COLLIDED]: (projectile, projectileBoundary, collidedSide) => {
    if (collidedSide) {
      playerDamage();
      projectile[KEY_PROJECTILE_IS_COMSUMED] = true;
    }
  },
  [KEY_OBJECT_ON_UPDATE]: [
    projectile => {
      vectorOp(
        (pos, v) => pos + v * $timeRatio.$,
        [projectile.p, projectile.v],
        projectile.p
      );
      draw(35, (ctx) => {
        ctx.fillStyle = '#ec5751';
        const { l, t } = getObjectBoundary(projectile);
        ctx.fillRect(
          ...transform(vector(l, t)),
          transform(projectile.s.x),
          transform(projectile.s.y)
        );
    
        if (isUnderWater(projectile)) {
          ctx.fillStyle = $reflectionGradient.$;
          ctx.fillRect(
            ...transform(vector(l, t)),
            transform(projectile.s.x),
            transform(projectile.s.y)
          );
        }
    
        const reflection = getReflection(projectile);
        if (reflection) {
          ctx.fillStyle = '#ec5751';
          ctx.globalAlpha = 0.2;
          ctx.fillRect(
            reflection.x - transform(projectile.s.x) / 2,
            reflection.y,
            transform(projectile.s.x),
            transform(projectile.s.y)
          );
          ctx.globalAlpha = 1;
        }
      });
    },
    checkRipple(),
  ],
})