import {
  SLOW_DOWN_DURATION,
  SLOW_MOTION_TIME_RATIO,
  NORAML_TIME_RATIO,
  FRAME_DURAITON,
  DEFAULT_DASH,
  MINIMUM_DASH_VELOCITY,
  DRAG_FORCE_FACTOR,
  MAX_RELEASE_VELOCITY,
  TRAJECTORY_LINE_LENGTH,
  DEFAULT_FRAME_HEIGHT,
  KEY_PLAYER_DAMAGE_FRAME,
  KEY_OBJECT_FRAME,
  PLAYER_DAMAGE_INVINCIBLE_DURAION,
  KEY_PLAYER_DEATH_FRAME,
  DEFAULT_HEALTH,
  KEY_STAGE_TRANSITION_FRAME,
  KEY_STAGE_WAVES,
  G,
  KEY_OBJECT_FORCE_CHECK_COLLISION,
  KEY_SAVE_NEED_TUTORIAL,
} from './constants';
import {
  vector,
  object,
  vectorOp,
  vectorDistance,
  vectorMagnitude,
  getObjectBoundary,
  isOverlap,
  isGoingThrough,
  getClosetSide,
} from './utils';
import { easeOutQuint, easeOutQuad, easeInQuad } from './easing';
import { playSound } from './helper/sound';

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
export const player = object(0, 0, 20, 50);
export const $health = ref(DEFAULT_HEALTH);
export const $dash = ref(DEFAULT_DASH);
export const $trajectoryLineOpacity = ref(0);
export const $g = ref(G);
export const $maxReleaseVelocity = ref(MAX_RELEASE_VELOCITY);
export const $playerCollisionSide = ref({});
export const $forceFacing = ref();

export function getReleaseVelocity() {
  const v = vector(
    (pressDownPos.x - cursorPos.x) / DRAG_FORCE_FACTOR,
    (cursorPos.y - pressDownPos.y) / DRAG_FORCE_FACTOR
  );
  const vm = vectorMagnitude(v);
  if (vm > $maxReleaseVelocity.$)
    vectorOp((v) => (v * $maxReleaseVelocity.$) / vm, [v], v);
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
    estimateV.y -= $g.$;
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
    playSound(3, 0)
  }
}
export function playerDamage() {
  if (!isPlayerInvincibleAfterDamage()) {
    if ($health.$ > 0) {
      player.v = vector((-1 * player.v.x) / Math.abs(player.v.x || 1), 5);
    }
    if ($health.$ > 1) {
      playSound(1);
      player[KEY_PLAYER_DAMAGE_FRAME] = player[KEY_OBJECT_FRAME];
      setDash(Math.max($dash.$, 1));
    }
    $health.$ = Math.max(0, $health.$ - 1);
  }
}
export function revive() {
  $health.$ = DEFAULT_HEALTH;
  player[KEY_PLAYER_DEATH_FRAME] = undefined;
}

export function resetDash() {
  setDash(DEFAULT_DASH);
}
export function setDash(value) {
  if ($isPressing.$ && $dash.$ !== value) slowDown();
  $dash.$ = value;
}
export function isAbleToDash() {
  return (
    $dash.$ > 0 &&
    !player[KEY_PLAYER_DEATH_FRAME] &&
    $stage.$ &&
    $stageWave.$ !== -1 &&
    !$stage.$[KEY_STAGE_TRANSITION_FRAME] &&
    !isInTranisition()
  );
}
export function isReleaseVelocityEnough() {
  return vectorMagnitude(getReleaseVelocity()) >= MINIMUM_DASH_VELOCITY;
}
export function isPlayerInvincibleAfterDamage() {
  return (
    player[KEY_PLAYER_DAMAGE_FRAME] &&
    player[KEY_OBJECT_FRAME] - player[KEY_PLAYER_DAMAGE_FRAME] <=
      PLAYER_DAMAGE_INVINCIBLE_DURAION / FRAME_DURAITON
  );
}

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

export const getReflection = object => {
  if($reflectionY.$ !== undefined && object.p.y > $reflectionY.$) {
    const [x, y] = reflect(object.p, $reflectionY.$);
    return { x: x - Math.random() * 4 * $timeRatio.$, y, d: easeInQuad(Math.min(1, (object.p.y - $reflectionY.$) / object.s.y * 2)) }
  }
}

export const isUnderWater = object => $reflectionGradient.$ && getObjectBoundary(object).b <= $reflectionY.$;

export function reflect(value, y, ratio = 1) {
  const scale = cameraFrameSize.y / DEFAULT_FRAME_HEIGHT;
  return [
    cameraFrameSize.x / 2 -
      (cameraCenter.x - value.x) * $cameraZoom.$ * scale * ratio,
    cameraFrameSize.y / 2 + 
      (cameraCenter.y + value.y - y) * $cameraZoom.$ * scale * ratio
  ];
}

export function transform(value, ratio = 1) {
  const scale = cameraFrameSize.y / DEFAULT_FRAME_HEIGHT;
  if (typeof value === 'number') {
    return value * $cameraZoom.$ * scale * ratio;
  } else {
    return [
      cameraFrameSize.x / 2 -
        (cameraCenter.x - value.x) * $cameraZoom.$ * scale * ratio,
      cameraFrameSize.y / 2 +
        (cameraCenter.y - value.y) * $cameraZoom.$ * scale * ratio,
    ];
  }
}

//remove
export function detransform(target) {
  const scale = cameraFrameSize.y / DEFAULT_FRAME_HEIGHT;
  if (typeof target === 'number') {
    return target / $cameraZoom.$ / scale;
  } else {
    return vector(
      cameraCenter.x -
        (cameraFrameSize.x / 2 - target.x) / $cameraZoom.$ / scale,
      cameraCenter.y +
        (cameraFrameSize.y / 2 - target.y) / $cameraZoom.$ / scale
    );
  }
}

export function isOutOfScreen(object) {
  const canvasPos = transform(object.p);
  return (
    canvasPos[0] < 0 ||
    canvasPos[1] < 0 ||
    canvasPos[0] > cameraFrameSize.x ||
    canvasPos[1] > cameraFrameSize.y
  );
}

export const collision = (objectA, objectB) => {
  if (
    (objectB[KEY_OBJECT_FORCE_CHECK_COLLISION] || !isOutOfScreen(objectB)) &&
    (isOverlap(objectA, objectB, $timeRatio.$) || isGoingThrough(objectA, objectB, $timeRatio.$)))
    return getClosetSide(objectA, objectB);
};

// Time
export const $timeRatio = ref(NORAML_TIME_RATIO);
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

export function slowDown(ratio = SLOW_MOTION_TIME_RATIO) {
  if (!cancelTimeRatioAnimation) {
    cancelTimeRatioAnimation = animateTo(
      (progress) => {
        $timeRatio.$ =
          NORAML_TIME_RATIO -
          (NORAML_TIME_RATIO - ratio) * easeOutQuint(progress);
      },
      SLOW_DOWN_DURATION,
      easeOutQuint
    );
  }
}

export function backToNormal() {
  if (cancelTimeRatioAnimation) {
    cancelTimeRatioAnimation();
    cancelTimeRatioAnimation = undefined;
  }
  $timeRatio.$ = NORAML_TIME_RATIO;
}

// Stage
export const $isGameStarted = ref(false);
export const enemies = [];
export const projectiles = [];
export const platforms = [];
export const graphics = [];
export const effects = [];
export const $stageWave = ref(-1);
export const $stageNextWave = ref(-1);
export const $stageIndex = ref(-1);
export const $stage = ref();
export const $backgroundV = ref(0);
export const $backgroundColor = ref();
export const isInTranisition = () =>
  $stage.$ &&
  ($stageWave.$ === $stage.$[KEY_STAGE_WAVES].length ||
    $stage.$[KEY_STAGE_TRANSITION_FRAME] !== undefined);

export const $debug = ref(false);
let clickPromises = {};
export const resolveClick = () => {
  Object.keys(clickPromises).forEach((key) => clickPromises[key]());
  clickPromises = {};
};
export const waitForClick = (key, callback) => (clickPromises[key] = callback);

export const drawStack = [];
export const draw = (zIndex, callback) =>
  drawStack[zIndex]
    ? drawStack[zIndex].push(callback)
    : (drawStack[zIndex] = [callback]);

export const $reflectionY = ref();
export const $reflectionGradient = ref();

const offscreenCtx = document.createElement('canvas').getContext('2d');
export const createLinearGradient = (y, h, colors, distance, depth) => {
  const grad = offscreenCtx.createLinearGradient(...transform(vector(0, y), distance), ...transform(vector(0, y - h), depth ? distance : undefined));
  colors.forEach(color => grad.addColorStop(...color));
  return grad;
}

export const $theft = ref();
export const $tempPlayerPos = ref();
export const $canvasLeftOffset = ref(0);

export const save = (...args) => window.localStorage.setItem(...args);
export const load = (...args) => window.localStorage.getItem(...args);

export const needTutorial = load(KEY_SAVE_NEED_TUTORIAL) != 1;
export const $titleY = ref();