export default class EntitySchema {
  constructor(key, definition = {}, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error('A string non-empty key is required');
    }

    const {
      idAttribute = 'id',
      mergeStrategy = (entityA, entityB) => {
        return { ...entityA, ...entityB };
      },
      processStrategy = (input) => ({ ...input })
    } = options;

    this._key = key;
    this._getId = typeof idAttribute === 'function' ? idAttribute : (input) => input[idAttribute];
    this._mergeStrategy = mergeStrategy;
    this._processStrategy = processStrategy;
    this.define(definition);
  }

  getKey(entity, parent, key) {
    return this._key;
  }

  define(definition) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  getId(entity, parent, key) {
    return this._getId(entity, parent, key);
  }

  merge(entityA, entityB) {
    return this._mergeStrategy(entityA, entityB);
  }

  normalize(input, parent, key, visit, addEntity) {
    const entity = this._processStrategy(input, parent, key);
    Object.keys(this.schema).forEach((key) => {
      const schema = this.schema[key];
      entity[key] = visit(input[key], input, key, schema, addEntity);
    });

    addEntity(this, entity, parent, key);
    return this.getId(entity, parent, key);
  }
}
