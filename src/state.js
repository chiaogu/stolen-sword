import {
  SLOW_DOWN_DURATION,
  SLOW_MOTION_TIME_RATIO,
  NORAML_TIME_RATIO,
  FRAME_DURAITON,
  G,
  DEFAULT_DASH,
  MINIMUM_DASH_VELOCITY,
  CAMERA_TYPE_FOCUS_ON_PLAYER,
  CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN,
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
export const player = object(0, 0, 30, 30);
export const $dash = ref(DEFAULT_DASH);
export const $trajectoryLineOpacity = ref(0);
export function getReleaseVelocity() {
  return vector(
    (pressDownPos.x - cursorPos.x) / 15,
    (cursorPos.y - pressDownPos.y) / 15
  );
}
export function playerTrajectory() {
  const path = [vectorOp((p) => p, [player.p])];
  const estimateV = getReleaseVelocity();
  let distance = 0;
  while (distance < 300) {
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

display(() => `playerPos: ${vectorStringify(player.p)}`);
display(() => `playerV: ${vectorStringify(player.v)}`);

// Interaction
export const $isPressing = ref(false);
export const cursorPos = vector(0, 0);
export const pressDownPos = vector(0, 0);
export const pressingKeys = new Set();

// Camera
export const $cameraType = ref(CAMERA_TYPE_FOCUS_ON_PLAYER);
export const cameraCenter = vector(0, 0);
export const cameraFrameSize = vector(window.innerWidth, window.innerHeight);
export const $cameraZoom = ref(1);
display(() => `camera: ${vectorStringify(cameraCenter)}`);
display(() => `cameraZoom: ${$cameraZoom.$}`);
export function transform(value) {
  if (typeof value === 'number') {
    return value * $cameraZoom.$;
  } else {
    return [
      cameraFrameSize.x / 2 - (cameraCenter.x - value.x) * $cameraZoom.$,
      cameraFrameSize.y / 2 + (cameraCenter.y - value.y) * $cameraZoom.$,
    ];
  }
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

export function slowDown() {
  cancelTimeRatioAnimation = animateTo(
    (ratio) => {
      $timeRatio.$ =
        NORAML_TIME_RATIO -
        (NORAML_TIME_RATIO - SLOW_MOTION_TIME_RATIO) * ratio;
    },
    SLOW_DOWN_DURATION,
    (t) => 1 + --t * t * t * t * t
  );
}

export function backToNormal() {
  if (cancelTimeRatioAnimation) cancelTimeRatioAnimation();
  $timeRatio.$ = NORAML_TIME_RATIO;
}

// Enemies
export const enemies = [];

// Platforms
export const platforms = [];
