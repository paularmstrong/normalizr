function baseIsEqual(value, other, references) {
  let indexOfValue = references.indexOf(value),
      indexOfOther = references.indexOf(other);

  if (isObject(value) && indexOfValue === -1) {
    references.push(value);
  }
  if (isObject(value) && indexOfOther === -1) {
    references.push(other);
  }

  if (value === other) {
    return true;
  } else if (indexOfValue >= 0 || indexOfOther >= 0) {
    return false;
  }

  if (isObject(value) && isObject(other)) {

    if (value.constructor.name === 'Array' && other.constructor.name === 'Array') {
      if (value.length === other.length) {
        let equalSoFar = true;
        for (let i = 0; i < value.length; i++) {
          equalSoFar = equalSoFar && baseIsEqual(value[i], other[i], references);
        }
        return equalSoFar;
      }
    } else {
      let valueKeys = Object.keys(value),
          otherKeys = Object.keys(other);

      if (baseIsEqual(valueKeys, otherKeys, [])) {
        return valueKeys.reduce(function(memo, prop){

          return memo && baseIsEqual(value[prop], other[prop], references);
        }, true);
      }
    }
  }

  return false;
}

export function isObject(value) {
  const type = typeof value;
  return value && (type === 'object' || type === 'function');
}

export function isEqual(value, other) {
  return baseIsEqual(value, other, []);
}
