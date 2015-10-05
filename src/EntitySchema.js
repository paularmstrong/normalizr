export default class EntitySchema {
  constructor(key, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    this._key = key;

    const idAttribute = options.idAttribute || 'id';
    this._getId = typeof idAttribute === 'function' ? idAttribute : x => x[idAttribute];
  }

  getKey() {
    return this._key;
  }

  getId(entity) {
    return this._getId(entity);
  }

  define(nestedSchema) {
    for (let key in nestedSchema) {
      if (nestedSchema.hasOwnProperty(key)) {
        this[key] = nestedSchema[key];
      }
    }
  }
}
