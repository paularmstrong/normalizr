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

  get key() { return this._key; }

  getId(entity, parent, key) { return this._getId(entity, parent, key); }

  merge(entityA, entityB) {
    return this._mergeStrategy(entityA, entityB);
  }

  process(entity, parent, key) {
    return this._processStrategy(entity, parent, key);
  }

  define(definition) {
    this.schema = Object.entries(definition).reduce((entitySchema, [ key, schema ]) => {
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  normalize(input, parent, key, visit, addEntity) {
    const entity = this.process(input, parent, key);
    Object.entries(this.schema).forEach(([ key, schema ]) => {
      entity[key] = visit(input[key], input, key, schema, addEntity);
    });

    addEntity(this, entity, parent, key);
    return this.getId(entity, parent, key);
  }
}
