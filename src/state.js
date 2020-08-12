const _state = [];
let _id = 0;

export function declare(defaultValue = null) {
  const id = _id++;
  _state[id] = defaultValue;
  return id;
}

export function state(id, value) {
  if(value !== undefined) {
    if(typeof value === 'function') {
      _state[id] = value(_state[id]);
    } else {
      _state[id] = value;
    }
  }
  return _state[id];
}

export function stepTo(id, target, step) {
  if(state(id) > target) {
    state(id, v => Math.max(v - Math.abs(step), target));
  } else if(state(id) < 0) {
    state(id, v => Math.min(v + Math.abs(step), target));
  }
}