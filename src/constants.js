let _id = 0;
const key = () => _id++;
export const KEY_ENEMY_FRAME = key();
export const KEY_ENEMY_IS_COLLIDED = key();
export const KEY_ENEMY_IS_PENETRABLE = key();

export const SIDE_T = 't';
export const SIDE_R = 'r';
export const SIDE_B = 'b';
export const SIDE_L = 'l';

export const SLOW_DOWN_DURATION = 500;
export const SLOW_MOTION_TIME_RATIO = 0.05;
export const NORAML_TIME_RATIO = 1;
export const FRAME_DURAITON = 16;

export const G = 0.4;
export const GROUND_FRICTION = 0.2;
export const WALL_FRICTION = 0.2;