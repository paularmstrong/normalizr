'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var _UnionSchema = require('./UnionSchema');

var _UnionSchema2 = _interopRequireDefault(_UnionSchema);

var ArraySchema = (function () {
  function ArraySchema(itemSchema) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, ArraySchema);

    if (!_lodashIsObject2['default'](itemSchema)) {
      throw new Error('ArraySchema requires item schema to be an object.');
    }

    if (options.schemaAttribute) {
      var schemaAttribute = options.schemaAttribute;
      this._itemSchema = new _UnionSchema2['default'](itemSchema, { schemaAttribute: schemaAttribute });
    } else {
      this._itemSchema = itemSchema;
    }
  }

  ArraySchema.prototype.getItemSchema = function getItemSchema() {
    return this._itemSchema;
  };

  return ArraySchema;
})();

exports['default'] = ArraySchema;
module.exports = exports['default'];