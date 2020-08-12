const state = [];
let _id = 0;

export const MOUSE_X = declare(0);
export const MOUSE_Y = declare(0);

function declare(defaultValue) {
  const id = _id++;
  state[id] = defaultValue;
  return id;
}

export function setState(id, value) {
  state[id] = value;
}

export function getState(id) {
  return state[id];
}