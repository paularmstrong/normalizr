/**
 * Helpers to enable Immutable compatibility *without* bringing in
 * the 'immutable' package as a dependency.
 */

function stringifiedArray(array) {
  return array.map((item) => item && item.toString());
}

/**
 * Check if an object is immutable by checking if it implements the
 * getIn method.
 *
 * @param  {any} object
 * @return {bool}
 */
export function isImmutable(object) {
  return !!(object && object.getIn);
}

/**
 * If the object responds to getIn, that's called directly. Otherwise
 * recursively apply object/array access to get the value.
 *
 * @param  {Object, Immutable.Map, Immutable.Record} object
 * @param  {Array<string, number>} keyPath
 * @return {any}
 */
export function getIn(object, keyPath) {
  if (object.getIn) {
    return object.getIn(stringifiedArray(keyPath));
  }

  return keyPath.reduce((memo, key) => memo[key], object);
}

/**
 * If the object responds to hasIn, that's called directly. Otherwise
 * recursively apply object/array access and check if the full path exists
 * using hasOwnProperty.
 *
 * @param  {Object, Immutable.Map, Immutable.Record} object
 * @param  {Array<string, number>} keyPath
 * @return {any}
 */
export function hasIn(object, keyPath) {
  if (object.hasIn) {
    return object.hasIn(stringifiedArray(keyPath));
  }

  const lastKey = keyPath.pop();
  const location = getIn(object, keyPath);

  return location.hasOwnProperty(lastKey);
}

/**
 * If the object responds to setIn, that's called directly. Otherwise
 * recursively apply object/array access and set the value at that location.
 *
 * @param  {Object, Immutable.Map, Immutable.Record} object
 * @param  {Array<string, number>} keyPath
 * @param  {any} value
 * @return {any}
 */
export function setIn(object, keyPath, value) {
  if (object.setIn) {
    return object.setIn(stringifiedArray(keyPath), value);
  }

  const lastKey = keyPath.pop();
  const location = getIn(object, keyPath);

  location[lastKey] = value;

  return object;
}
