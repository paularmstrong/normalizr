'use strict';

function EntitySchema(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('A string non-empty key is required');
  }

  this._key = key;
}

EntitySchema.prototype.getKey = function () {
  return this._key;
};

EntitySchema.prototype.define = function (nestedSchema) {
  for (var prop in nestedSchema) {
    if (nestedSchema.hasOwnProperty(prop)) {
      this[prop] = nestedSchema[prop];
    }
  }
};

module.exports = EntitySchema;