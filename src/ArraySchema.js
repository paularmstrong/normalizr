'use strict';

var isObject = require('lodash/lang/isObject');

function ArraySchema(itemSchema) {
  if (!isObject(itemSchema)) {
    throw new Error('ArraySchema requires item schema to be an object.');
  }

  this._itemSchema = itemSchema;
}

ArraySchema.prototype.getItemSchema = function () {
  return this._itemSchema;
};

module.exports = ArraySchema;
