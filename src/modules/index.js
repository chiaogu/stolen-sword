import interaction from './interaction';
import character from './character';
import time from './time';

export default [
  interaction,
  time,
  character
].filter(render => render);