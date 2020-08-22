let _id = 0;
const key = () => _id++;

export const KEY_ENEMY_TYPE = key();
export const KEY_ENEMY_FRAME = key();
export const KEY_ENEMY_IS_COLLIDED = key();
export const KEY_ENEMY_IS_INVINCIBLE = key();
export const KEY_ENEMY_DEATH_FRAME = key();
export const KEY_ENEMY_MOVEMENT = key();
export const KEY_ENEMY_MOVEMENT_DURATION = key();
export const KEY_ENEMY_INITIAL_POS = key();

export const KEY_STAGE_INITIATE = key();
export const KEY_STAGE_LOOP = key();
export const KEY_STAGE_IS_WAVE_CLEAN = key();
export const KEY_STAGE_WAVES = key();

export const KEY_PLATFORM_TYPE = key();
export const KEY_PLATFORM_X_FOLLOW = key();
export const KEY_PLATFORM_Y_FOLLOW = key();
export const KEY_PLATFORM_LOOP = key();

export const PLATFORM_TYPE_STANDARD = key();
export const PLATFORM_TYPE_BOUNDARY = key();

export const CAMERA_TYPE_FOCUS_ON_PLAYER = key();
export const CAMERA_TYPE_FOLLOW_PLAYER_WHEN_OUT_OF_SCREEN = key();
export const CAMERA_TYPE_GOD_MODE = key();

export const SIDE_T = 't';
export const SIDE_R = 'r';
export const SIDE_B = 'b';
export const SIDE_L = 'l';

export const DEFAULT_FRAME_HEIGHT = 667;
export const SLOW_DOWN_DURATION = 500;
export const SLOW_MOTION_TIME_RATIO = 0.05;
export const NORAML_TIME_RATIO = 1;
export const FRAME_DURAITON = 16;

export const G = 0.4;
export const GROUND_FRICTION = 0.2;
export const WALL_FRICTION = 0.15;

export const MAX_RELEASE_VELOCITY = 20;
export const DRAG_FORCE_FACTOR = 15;
export const DEFAULT_DASH = 2;
export const MINIMUM_DASH_VELOCITY = 2;
export const TRAJECTORY_LINE_LENGTH = 200;
