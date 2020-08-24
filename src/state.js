import {
  SLOW_DOWN_DURATION,
  SLOW_MOTION_TIME_RATIO,
  NORAML_TIME_RATIO,
  FRAME_DURAITON,
  G,
  DEFAULT_DASH,
  MINIMUM_DASH_VELOCITY,
  DRAG_FORCE_FACTOR,
  MAX_RELEASE_VELOCITY,
  TRAJECTORY_LINE_LENGTH,
  DEFAULT_FRAME_HEIGHT,
  KEY_PLAYER_DAMAGE_FRAME,
  KEY_OBJECT_FRAME,
  PLAYER_DAMAGE_INVINCIBLE_DURAION
} from './constants';
import {
  vectorStringify,
  vector,
  object,
  vectorOp,
  vectorDistance,
  vectorMagnitude,
} from './utils';
import { display } from './modules/display';
import { easeOutQuint } from './easing';

const ref = (defaultValue) =>
  new Proxy(
    { 0: defaultValue },
    {
      get: (object) => object[0],
      set: (object, p, value) => {
        object[0] = value;
        return true;
      },
    }
  );

// Player
export const player = object(0, 0, 20, 20);
export const $dash = ref(DEFAULT_DASH);
export const $trajectoryLineOpacity = ref(0);
export function getReleaseVelocity() {
  const v = vector(
    (pressDownPos.x - cursorPos.x) / DRAG_FORCE_FACTOR,
    (cursorPos.y - pressDownPos.y) / DRAG_FORCE_FACTOR
  );
  const vm = vectorMagnitude(v);
  if (vm > MAX_RELEASE_VELOCITY)
    vectorOp((v) => (v * MAX_RELEASE_VELOCITY) / vm, [v], v);
  return v;
}
export function playerTrajectory() {
  const path = [vectorOp((p) => p, [player.p])];
  const estimateV = getReleaseVelocity();
  let distance = 0;
  while (distance < TRAJECTORY_LINE_LENGTH) {
    const lastP = path[path.length - 1];
    const nextP = vectorOp((pos, v) => pos + v, [lastP, estimateV]);
    distance += vectorDistance(lastP, nextP);
    estimateV.y -= G;
    path.push(nextP);
  }
  return path;
}
export function dash() {
  if (isAbleToDash() && isReleaseVelocityEnough()) {
    const v = getReleaseVelocity();
    player.v.x = v.x;
    player.v.y = v.y;
    $dash.$--;
  }
}
export function resetDash() {
  setDash(DEFAULT_DASH);
}
export function setDash(value) {
  if ($isPressing.$ && $dash.$ !== value) slowDown();
  $dash.$ = value;
}
export function isAbleToDash() {
  return $dash.$ > 0;
}
export function isReleaseVelocityEnough() {
  return vectorMagnitude(getReleaseVelocity()) >= MINIMUM_DASH_VELOCITY;
}
export function isPlayerInvincibleAfterDamage() {
  return player[KEY_PLAYER_DAMAGE_FRAME] &&
  player[KEY_OBJECT_FRAME] - player[KEY_PLAYER_DAMAGE_FRAME] <=
    PLAYER_DAMAGE_INVINCIBLE_DURAION / FRAME_DURAITON;
}

display(() => `playerPos: ${vectorStringify(player.p)}`);
display(() => `playerV: ${vectorStringify(player.v)}`);

// Interaction
export const $isPressing = ref(false);
export const cursorPos = vector(0, 0);
export const pressDownPos = vector(0, 0);
export const pressingKeys = new Set();

// Camera
export const $cameraLoop = ref();
export const cameraCenter = vector(0, 0);
export const cameraFrameSize = vector(window.innerWidth, window.innerHeight);
export const $cameraZoom = ref(1);
display(() => `camera: ${vectorStringify(cameraCenter)}`);
display(() => `cameraZoom: ${$cameraZoom.$}`);

export function transform(value) {
  const scale = cameraFrameSize.y / DEFAULT_FRAME_HEIGHT;
  if (typeof value === 'number') {
    return value * $cameraZoom.$ * scale;
  } else {
    return [
      cameraFrameSize.x / 2 - (cameraCenter.x - value.x) * $cameraZoom.$ * scale,
      cameraFrameSize.y / 2 + (cameraCenter.y - value.y) * $cameraZoom.$ * scale,
    ];
  }
}

export function detransform(target) {
  const scale = cameraFrameSize.y / DEFAULT_FRAME_HEIGHT;
  if (typeof target === 'number') {
    return target / $cameraZoom.$ / scale;
  } else {
    return vector(
      cameraCenter.x - (cameraFrameSize.x / 2 - target.x) / $cameraZoom.$ / scale,
      cameraCenter.y + (cameraFrameSize.y / 2 - target.y) / $cameraZoom.$ / scale
    );
  }
}

export function isOutOfScreen(object) {
  const canvasPos = transform(object.p);
  return canvasPos[0] < 0 ||
    canvasPos[1] < 0 ||
    canvasPos[0] > cameraFrameSize.x ||
    canvasPos[1] > cameraFrameSize.y;
}

// Time
export const $timeRatio = ref(NORAML_TIME_RATIO);
display(() => `timeRatio: ${$timeRatio.$}`);
export const animations = [];
let animationId = 0;
let cancelTimeRatioAnimation;

export function removeAnimation(id) {
  const index = animations.findIndex(([_id]) => _id === id);
  if (index !== -1) animations.splice(index, 1);
}

export function animateTo(callback, duration = 1, timingFunc = (v) => v) {
  let frame = 0;
  return stepTo(
    () =>
      callback(
        timingFunc(
          Math.min(Math.max((frame++ * FRAME_DURAITON) / duration, 0), 1)
        )
      ),
    () => frame * FRAME_DURAITON > duration
  );
}

export function stepTo(callback, shouldStop) {
  const id = animationId++;
  animations.push([id, callback, shouldStop]);
  return () => removeAnimation(id);
}

export function slowDown(duration = SLOW_DOWN_DURATION) {
  if (cancelTimeRatioAnimation) return;
  cancelTimeRatioAnimation = animateTo(
    (ratio) => {
      $timeRatio.$ =
        NORAML_TIME_RATIO -
        (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) * ratio;
    },
    duration,
    easeOutQuint
  );
}

export function backToNormal() {
  if (cancelTimeRatioAnimation) {
    cancelTimeRatioAnimation();
    cancelTimeRatioAnimation = undefined;
  }
  $timeRatio.$ = NORAML_TIME_RATIO;
}

// Stage
export const enemies = [];
export const projectiles = [];
export const platforms = [];
export const $stageWave = ref();
export const $stage = ref();

display(() => `stageWave: ${$stageWave.$}`);
display(() => `projectiles: ${projectiles.length}`);
