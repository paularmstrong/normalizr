export default class EntitySchema {
  constructor(key, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    this._idAttribute = options.idAttribute || 'id';
    this._key = key;
  }

  getKey() {
    return this._key;
  }

  getIdAttribute() {
    return this._idAttribute;
  }

  define(nestedSchema) {
    for (let key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        this[key] = nestedSchema[key];
      }
    }
  }
}
