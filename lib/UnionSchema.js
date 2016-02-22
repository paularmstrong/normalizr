'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var UnionSchema = (function () {
  function UnionSchema(itemSchema, options) {
    _classCallCheck(this, UnionSchema);

    if (!_lodashIsObject2['default'](itemSchema)) {
      throw new Error('UnionSchema requires item schema to be an object.');
    }

    if (!options || !options.schemaAttribute) {
      throw new Error('UnionSchema requires schemaAttribute option.');
    }

    this._itemSchema = itemSchema;

    var schemaAttribute = options.schemaAttribute;
    this._getSchema = typeof schemaAttribute === 'function' ? schemaAttribute : function (x) {
      return x[schemaAttribute];
    };
  }

  UnionSchema.prototype.getItemSchema = function getItemSchema() {
    return this._itemSchema;
  };

  UnionSchema.prototype.getSchemaKey = function getSchemaKey(item) {
    return this._getSchema(item);
  };

  return UnionSchema;
})();

exports['default'] = UnionSchema;
module.exports = exports['default'];