export default class EntitySchema {
  constructor(key, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    this._key = key;
    this._assignEntity = options.assignEntity;

    const idAttribute = options.idAttribute || 'id';
    this._getId = typeof idAttribute === 'function' ? idAttribute : x => x[idAttribute];
    this._idAttribute = idAttribute;
    this._meta = options.meta;
    this._defaults = options.defaults;
  }

  getAssignEntity() {
    return this._assignEntity;
  }

  getKey() {
    return this._key;
  }

  getId(entity, key) {
    return this._getId(entity, key);
  }

  getIdAttribute() {
    return this._idAttribute;
  }

  getMeta(prop) {
    if (!prop || typeof prop !== 'string') {
      throw new Error('A string non-empty property name is required');
    }
    return this._meta && this._meta[prop];
  }
  
  getDefaults() {
    return this._defaults;
  }

  define(nestedSchema) {
    for (let key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        this[key] = nestedSchema[key];
      }
    }
  }
}
