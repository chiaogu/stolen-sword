const listeners = {};
let _id = 0;
const id = () => _id++;

export const PLAYER_POS_CHANGE = id();
export const PRESS_UP = id();
export const PRESS_DOWN = id();

export function listen(key, callback) {
  if(!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
}

export function emit(key, value) {
  if(listeners[key]) listeners[key].map(callback => callback(value));
}