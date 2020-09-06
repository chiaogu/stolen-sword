import { chase, circular } from '../animation';
import {
  ENEMY_DEATH_ANIMATION_DURATION,
  FRAME_DURAITON,
  KEY_ENEMY_APPEARANCE,
  KEY_ENEMY_COMPUND_PARENT,
  KEY_ENEMY_DEAD_FRAME,
  KEY_ENEMY_HEALTH,
  KEY_ENEMY_IS_DEAD,
  KEY_ENEMY_IS_DEFENCING,
  KEY_ENEMY_IS_UNTOUCHABLE,
  KEY_ENEMY_LAST_DAMAGE_FRAME,
  KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER,
  KEY_OBJECT_EVENT_GET_OFFSET,
  KEY_OBJECT_EVENT_IS_REPEAT,
  KEY_OBJECT_FRAME,
  KEY_OBJECT_IS_COLLIDED,
  KEY_OBJECT_ON_COLLIDED,
  KEY_OBJECT_ON_UPDATE,
  KEY_OBJECT_Z_INDEX,
  KEY_PROJECTILE_SORUCE,
  SIDE_B,
  SIDE_L,
  SIDE_R,
  SIDE_T,
} from '../constants';
import { easeInQuad } from '../easing';
import { projectile } from '../helper/projectile';
import {
  $backgroundV,
  $g,
  $timeRatio,
  draw,
  getReflection,
  getWaterMask,
  player,
  playerDamage,
  projectiles,
  setDash,
  transform,
} from '../state';
import {
  getActionProgress,
  getObjectBoundary,
  object,
  objectEvent,
  vector,
  vectorAngle,
  vectorMagnitude,
  vectorOp,
} from '../utils';
import { checkRipple } from './graphic';

function handleCollision(enemy, enemyBoundary, collidedSide) {
  if (!collidedSide || enemy[KEY_ENEMY_DEAD_FRAME]) return;

  if (enemy[KEY_ENEMY_IS_UNTOUCHABLE]) {
    playerDamage();
  } else {
    if (enemy[KEY_ENEMY_IS_DEFENCING]) {
      bounceBack(enemy, enemyBoundary, collidedSide);
    }
    takeDamage(enemy, enemyBoundary, collidedSide);
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

function takeDamage(enemy, enemyBoundary, collidedSide) {
  setDash(1);
  if (enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_LAST_DAMAGE_FRAME] > 20) {
    enemy[KEY_ENEMY_HEALTH]--;
    enemy[KEY_ENEMY_LAST_DAMAGE_FRAME] = enemy[KEY_OBJECT_FRAME];
    if (enemy[KEY_ENEMY_HEALTH] === 0) {
      enemy[KEY_ENEMY_DEAD_FRAME] = enemy[KEY_OBJECT_FRAME];
      vectorOp((v) => v * 0.3, [player.v], enemy.v);
    }
  }
}

const getEnemyColor = (enemy) => {
  if (
    enemy[KEY_OBJECT_IS_COLLIDED] &&
    Math.round(enemy[KEY_OBJECT_FRAME]) % 4 > 1
  ) {
    return `rgba(200,200,200,${0.9 * getDeathProgress(enemy)})`;
  } else if (enemy[KEY_ENEMY_IS_UNTOUCHABLE]) {
    return `#ec5751`;
  } else {
    return `rgb(70,70,70)`;
  }
};

const getDeathProgress = (enemy) => {
  let deathProgress =
    1 -
    getActionProgress(
      enemy[KEY_OBJECT_FRAME] - enemy[KEY_ENEMY_DEAD_FRAME],
      ENEMY_DEATH_ANIMATION_DURATION,
      false
    );
  deathProgress = isNaN(deathProgress) ? 1 : deathProgress;
  return Math.max(0, deathProgress);
};

function drawEnemy(enemy) {
  if (enemy[KEY_OBJECT_FRAME] === 0) return;
  draw(enemy[KEY_OBJECT_Z_INDEX], (ctx) => {
    const { l, t } = getObjectBoundary(enemy);
    const angle = vectorAngle(enemy.p, player.p) / Math.PI / 2;

    // collision area
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = getEnemyColor(enemy);
    // ctx.strokeRect(
    //   ...transform(vector(l, t)),
    //   transform(enemy.s.x),
    //   transform(enemy.s.y)
    // );

    // body
    ctx.globalAlpha =
      easeInQuad(getDeathProgress(enemy)) *
      (!enemy[KEY_ENEMY_IS_UNTOUCHABLE] && enemy[KEY_ENEMY_COMPUND_PARENT]
        ? 0.4
        : 1);
    ctx.shadowBlur = 3;
    ctx.fillStyle = getEnemyColor(enemy);
    ctx.shadowColor = getEnemyColor(enemy);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `bold ${transform(36)}px sans-serif`;
    ctx.fillText(enemy[KEY_ENEMY_APPEARANCE], ...transform(enemy.p));
    
    if (enemy[KEY_ENEMY_IS_DEFENCING]) {
      ctx.setLineDash([
        transform(30), 
        transform(60 * (1 - (enemy[KEY_ENEMY_HEALTH] - 1) / 2))
      ]);
      ctx.lineWidth = transform(4);
      ctx.lineCap = 'round';
      ctx.strokeStyle = getEnemyColor(enemy);
      ctx.beginPath();
      ctx.ellipse(
        ...transform(enemy.p),
        transform(24),
        transform(24),
        -Math.PI * 0.45 - 2 * Math.PI * angle,
        0,
        Math.PI * 0.9
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // eye
    const eyeCenter = vector(enemy.p.x + 0, enemy.p.y + 10);
    const eyePos = circular(eyeCenter.x, eyeCenter.y, 1.6, 1.6, angle);
    ctx.beginPath();
    ctx.fillStyle = '#eee';
    ctx.ellipse(
      ...transform(eyeCenter),
      transform(4),
      transform(4),
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#ec5751';
    ctx.ellipse(
      ...transform(eyePos),
      transform(2.4),
      transform(2.4),
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    const waterMask = getWaterMask(ctx, enemy);
    if (waterMask) {
      ctx.fillStyle = waterMask.g;
      ctx.fillRect(waterMask.x, waterMask.y, waterMask.w, waterMask.h);
    }

    const reflection = getReflection(enemy);
    if (reflection) {
      ctx.fillStyle = getEnemyColor(enemy);
      ctx.globalAlpha = 0.1;
      ctx.fillRect(
        reflection.x,
        reflection.y,
        transform(enemy.s.x),
        reflection.h
      );
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;
  });
}

const dead = objectEvent(
  (enemy) => {
    enemy[KEY_ENEMY_IS_DEAD] = true;
  },
  ENEMY_DEATH_ANIMATION_DURATION,
  {
    [KEY_OBJECT_EVENT_IS_REPEAT]: false,
    [KEY_OBJECT_EVENT_GET_OFFSET]: (enemy) => enemy[KEY_ENEMY_DEAD_FRAME],
  }
);

export const enemy = (x, y, w = 30, h = 30, options = {}) => ({
  ...object(x, y, w, h),
  [KEY_OBJECT_ON_COLLIDED]: handleCollision,
  [KEY_ENEMY_LAST_DAMAGE_FRAME]: -1,
  [KEY_OBJECT_Z_INDEX]: 15,
  [KEY_ENEMY_APPEARANCE]: '勿',
  ...options,
  [KEY_ENEMY_HEALTH]: options[KEY_ENEMY_HEALTH] || 1,
  [KEY_OBJECT_ON_UPDATE]: [
    dead,
    ...(options[KEY_OBJECT_ON_UPDATE] || []),
    drawEnemy,
    (enemy) => {
      if (enemy[KEY_ENEMY_DEAD_FRAME]) {
        enemy.v.y -= ($g.$ / 2) * $timeRatio.$;
        enemy.v.x -= $backgroundV.$ * 0.1 * $timeRatio.$;
        enemy.p.x += enemy.v.x * $timeRatio.$;
        enemy.p.y += enemy.v.y * $timeRatio.$;
      }
    },
    checkRipple(),
  ],
});

export const compund = (core, ...children) => {
  core[KEY_OBJECT_ON_UPDATE].push((enemy) => {
    children.forEach((child) => {
      child[KEY_ENEMY_COMPUND_PARENT] = core;
      child[KEY_ENEMY_HEALTH] = Math.max(2, child[KEY_ENEMY_HEALTH]);
      if (enemy[KEY_ENEMY_DEAD_FRAME] && !child[KEY_ENEMY_DEAD_FRAME])
        child[KEY_ENEMY_DEAD_FRAME] = child[KEY_OBJECT_FRAME];
    });
  });
  return [core, ...children];
};

export const switchMode = (interval) =>
  objectEvent(
    (enemy) => {
      enemy[KEY_OBJECT_IS_COLLIDED] = false;
      enemy[KEY_ENEMY_IS_DEFENCING] = !enemy[KEY_ENEMY_IS_DEFENCING];
    },
    interval,
    {
      [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
    }
  );

export const fire = (interval, startTime = 0) =>
  objectEvent(
    (enemy) => {
      if (!enemy[KEY_ENEMY_DEAD_FRAME]) {
        const v = vectorOp((enemyP, playerP) => playerP - enemyP, [
          enemy.p,
          player.p,
        ]);
        const vm = vectorMagnitude(v);
        vectorOp((v) => (v / vm) * 2, [v], v);
        projectiles.push(
          projectile(enemy.p, vector(10, 10), v, {
            [KEY_PROJECTILE_SORUCE]: enemy,
          })
        );
      }
    },
    interval,
    {
      [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
      [KEY_OBJECT_EVENT_GET_OFFSET]: () => startTime / FRAME_DURAITON,
    }
  );

export const firework = (amount, interval, startTime = 0) =>
  objectEvent(
    (enemy) => {
      if (!enemy[KEY_ENEMY_DEAD_FRAME]) {
        const v = 2;
        for (let i = 0; i < amount; i++) {
          const theta = (i / amount) * 2 * Math.PI;
          projectiles.push(
            projectile(
              enemy.p,
              vector(10, 10),
              vector(v * Math.cos(theta), v * Math.sin(theta)),
              {
                [KEY_PROJECTILE_SORUCE]: enemy,
              }
            )
          );
        }
      }
    },
    interval,
    {
      [KEY_OBJECT_EVENT_FIRST_FRAME_TRIGGER]: true,
      [KEY_OBJECT_EVENT_GET_OFFSET]: () => startTime / FRAME_DURAITON,
    }
  );

export const recover = (interval, max) =>
  objectEvent((enemy) => {
    enemy[KEY_ENEMY_HEALTH] = Math.min(max, enemy[KEY_ENEMY_HEALTH] + 1);
  }, interval, {
    [KEY_OBJECT_EVENT_GET_OFFSET]: (enemy) => enemy[KEY_ENEMY_LAST_DAMAGE_FRAME] || 0
  });

export const untouchable = (x, y, options = {}) =>
  enemy(x, y, 30, 30, {
    ...options,
    [KEY_ENEMY_IS_UNTOUCHABLE]: true,
  });

export const invincible = (x, y, options = {}) =>
  enemy(x, y, 30, 30, {
    ...options,
    [KEY_OBJECT_ON_UPDATE]: [
      recover(FRAME_DURAITON, 2),
      ...(options[KEY_OBJECT_ON_UPDATE] || []),
    ],
  });

export const chain = (head, amount, interval, coreIndex, getEnemy) => {
  let nodes = [
    head,
    ...chase(
      head,
      Array(amount)
        .fill()
        .map((_, i) => (i + 1) * interval)
    ).map((doChase, i) => {
      const enemy = getEnemy(i, head);
      enemy[KEY_OBJECT_ON_UPDATE].push(doChase);
      return enemy;
    }),
  ];
  nodes = compund(...nodes.splice(coreIndex, 1), ...nodes);
  nodes.splice(coreIndex, 0, nodes.splice(0, 1)[0]);
  return nodes;
};

export const bug = (appearance, x, y, actions, isUntouchable, health) =>
  enemy(x, y, 30, 30, {
    [KEY_OBJECT_ON_UPDATE]: actions,
    [KEY_ENEMY_APPEARANCE]: appearance,
    [KEY_ENEMY_IS_UNTOUCHABLE]: isUntouchable,
    [KEY_ENEMY_HEALTH]: health
  });

export const shell = (appearance, x, y, actions) =>
  bug(appearance, x, y, [
    enemy => (enemy[KEY_ENEMY_IS_DEFENCING] = enemy[KEY_ENEMY_HEALTH] > 1),
    ...actions
  ], false, 3);