export function isObject(value) {
  var type = typeof value;
  return !!value && (type === 'object' || type === 'function');
}
