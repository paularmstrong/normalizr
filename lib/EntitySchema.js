'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EntitySchema = (function () {
  function EntitySchema(key) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, EntitySchema);

    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    this._key = key;

    var idAttribute = options.idAttribute || 'id';
    this._getId = typeof idAttribute === 'function' ? idAttribute : function (x) {
      return x[idAttribute];
    };
    this._idAttribute = idAttribute;
  }

  EntitySchema.prototype.getKey = function getKey() {
    return this._key;
  };

  EntitySchema.prototype.getId = function getId(entity) {
    return this._getId(entity);
  };

  EntitySchema.prototype.getIdAttribute = function getIdAttribute() {
    return this._idAttribute;
  };

  EntitySchema.prototype.define = function define(nestedSchema) {
    for (var key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        this[key] = nestedSchema[key];
      }
    }
  };

  return EntitySchema;
})();

exports['default'] = EntitySchema;
module.exports = exports['default'];