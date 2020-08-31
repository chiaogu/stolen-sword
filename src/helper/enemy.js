import {
  KEY_OBJECT_FRAME,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_ON_DEAD,
  KEY_OBJECT_IS_COLLIDED,
  KEY_ENEMY_IS_DEFENCING,
  KEY_ENEMY_DEAD_FRAME,
  ENEMY_DEATH_ANIMATION_DURATION,
  KEY_ENEMY_IS_DEAD,
  KEY_OBJECT_EVENT_IS_REPEAT,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_PROJECTILE_SORUCE,
  KEY_ENEMY_LAST_DAMAGE_FRAME,
  KEY_ENEMY_HEALTH,
  SIDE_T,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER,
  FRAME_DURAITON,
  KEY_OBJECT_Z_INDEX
} from '../constants';
import { transform, setDash, player, enemies, projectiles, playerDamage, draw } from '../state';
import {
  object,
  getObjectBoundary,
  vector,
  getActionProgress,
  objectEvent,
  vectorOp,
  vectorMagnitude,
} from '../utils';
import { projectile } from '../helper/projectile';

function handleCollision(enemy, enemyBoundary, collidedSide) {
  if (!collidedSide || enemy[KEY_ENEMY_DEAD_FRAME]) return;

  if(enemy[KEY_ENEMY_IS_UNTOUCHABLE]) {
    playerDamage();
  } else {
    if (enemy[KEY_ENEMY_IS_DEFENCING]) {
      bounceBack(enemy, enemyBoundary, collidedSide);
    } 
    underAttack(enemy, enemyBoundary, collidedSide);
  }
}

function bounceBack(enemy, enemyBoundary, collidedSide) {
  if (collidedSide === SIDE_T || collidedSide === SIDE_B) {
    setDash(1);
    player.v.y *= -0.5;
    player.p.y =
      enemyBoundary[collidedSide] +
      (player.s.y / 2) * (collidedSide === SIDE_T ? 1 : -1);
  } else if (collidedSide === SIDE_L || collidedSide === SIDE_R) {
    setDash(1);
    player.v.x *= -0.5;
    player.p.x =
      enemyBoundary[collidedSide] +
      (player.s.x / 2) * (collidedSide === SIDE_R ? 1 : -1);
  }
}

function underAttack(enemy, enemyBoundary, collidedSide) {
  setDash(1);
  if(enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_LAST_DAMAGE_FRAME] > 20) {
    enemy[KEY_ENEMY_HEALTH] --;
    enemy[KEY_ENEMY_LAST_DAMAGE_FRAME] = enemy[KEY_OBJECT_FRAME];
    if(enemy[KEY_ENEMY_HEALTH] === 0) enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
  }
}

function drawEnemy(enemy) {
  if (enemy[KEY_OBJECT_FRAME] === 0) return;
  draw(enemy[KEY_OBJECT_Z_INDEX], ctx => {
    let deathProgress = 1 - getActionProgress(
      enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEAD_FRAME],
      ENEMY_DEATH_ANIMATION_DURATION,
      false
    );
    deathProgress = isNaN(deathProgress) ? 1 : deathProgress;
    if (enemy[KEY_OBJECT_IS_COLLIDED]) {
      ctx.fillStyle = '#f00';
    } else if (enemy[KEY_ENEMY_IS_UNTOUCHABLE]) {
      ctx.fillStyle = `rgba(255,0,255,${deathProgress})`;
    } else {
      ctx.fillStyle = `rgba(255,255,0,${deathProgress})`;
    }
    const { l, t } = getObjectBoundary(enemy);
    ctx.fillRect(
      ...transform(vector(l, t)),
      transform(enemy.s.x),
      transform(enemy.s.y)
    );
    
    if (enemy[KEY_ENEMY_IS_DEFENCING]) {
      const size = vectorOp(size => size * (enemy[KEY_ENEMY_HEALTH] - 1) / 2, [enemy.s]);
      const shellBoundary = getObjectBoundary(object(enemy.p.x, enemy.p.y, size.x, size.y));
      ctx.fillStyle = '#0ff';
      ctx.fillRect(
        ...transform(vector(shellBoundary.l, shellBoundary.t)),
        transform(size.x),
        transform(size.y)
      );
    }
  })
}

const dead = objectEvent(
  (enemy) => {
    enemy[KEY_ENEMY_IS_DEAD] = true;
    if (enemy[KEY_OBJECT_ON_DEAD]) enemy[KEY_OBJECT_ON_DEAD](enemy);
  },
  ENEMY_DEATH_ANIMATION_DURATION,
  {
    [KEY_OBJECT_EVENT_IS_REPEAT]: false,
    [KEY_OBJECT_EVENT_GET_OFFSET]: (enemy) => enemy[KEY_ENEMY_DEAD_FRAME],
  }
);

export const enemy = (x, y, w, h, options = {}) => ({
  ...object(x, y, w, h),
  [KEY_ENEMY_HEALTH]: options[KEY_ENEMY_HEALTH] || 1,
  [KEY_OBJECT_ON_COLLIDED]: handleCollision,
  [KEY_ENEMY_LAST_DAMAGE_FRAME]: -1,
  [KEY_OBJECT_Z_INDEX]: 11,
  ...options,
  [KEY_OBJECT_ON_UPDATE]: [
    dead,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
    drawEnemy,
  ],
});

export const compund = (core, ...children) => {
  core[KEY_OBJECT_ON_UPDATE].push(enemy => {
    children.forEach(child => {
      child[KEY_ENEMY_HEALTH] = 2;
      if (enemy[KEY_ENEMY_DEAD_FRAME] && !child[KEY_ENEMY_DEAD_FRAME])
        child[KEY_ENEMY_DEAD_FRAME] = child[KEY_OBJECT_FRAME];
    })
  })
  return [
    core,
    ...children
  ]
};

export const shell = (x, y, w, h, options = {}) => enemy(x, y, w, h, {
  ...options,
  [KEY_ENEMY_HEALTH]: 3,
  [KEY_OBJECT_ON_UPDATE]: [
    enemy => enemy[KEY_ENEMY_IS_DEFENCING] = enemy[KEY_ENEMY_HEALTH] > 1,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
  ]
});

export const switchMode = interval => objectEvent((enemy) => {
  enemy[KEY_OBJECT_IS_COLLIDED] = false;
  enemy[KEY_ENEMY_IS_DEFENCING] = !enemy[KEY_ENEMY_IS_DEFENCING];
}, interval, {
  [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
});


export const fire = (interval, startTime = 0) =>
  objectEvent((enemy) => {
    if (!enemy[KEY_ENEMY_DEAD_FRAME]) {
      const v = vectorOp((enemyP, playerP) => playerP - enemyP, [
        enemy.p,
        player.p,
      ]);
      const vm = vectorMagnitude(v);
      vectorOp((v) => (v / vm) * 2, [v], v);
      projectiles.push(projectile(enemy.p, vector(10, 10), v, {
        [KEY_PROJECTILE_SORUCE]: enemy
      }));
    }
  }, interval, {
    [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
    [KEY_OBJECT_EVENT_GET_OFFSET]: () => startTime / FRAME_DURAITON
  });
  
  export const firework = (amount, interval, startTime = 0) =>
    objectEvent((enemy) => {
      if (!enemy[KEY_ENEMY_DEAD_FRAME]) {
        const v = 2;
        for(let i = 0; i < amount; i ++) {
          const theta = i / amount * 2 * Math.PI;
          projectiles.push(
            projectile(enemy.p, vector(10, 10), vector(v * Math.cos(theta), v * Math.sin(theta)), {
              [KEY_PROJECTILE_SORUCE]: enemy
            })
          );
        }
      }
    }, interval, {
      [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
      [KEY_OBJECT_EVENT_GET_OFFSET]: () => startTime / FRAME_DURAITON
    });
  
export const recover = (interval, max) => 
  objectEvent(enemy => {
    enemy[KEY_ENEMY_HEALTH] = Math.min(max, enemy[KEY_ENEMY_HEALTH] + 1);
  }, interval);