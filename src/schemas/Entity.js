import { denormalize } from './Object';

export default class EntitySchema {
  constructor(key, definition = {}, options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error(`Expected a string key for Entity, but found ${key}.`);
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

  get key() {
    return this._key;
  }

  define(definition) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  getId(input, parent, key) {
    return this._getId(input, parent, key);
  }

  merge(entityA, entityB) {
    return this._mergeStrategy(entityA, entityB);
  }

  normalize(input, parent, key, visit, addEntity) {
    const processedEntity = this._processStrategy(input, parent, key);
    Object.keys(this.schema).forEach((key) => {
      if (processedEntity.hasOwnProperty(key) && typeof processedEntity[key] === 'object') {
        const schema = this.schema[key];
        processedEntity[key] = visit(processedEntity[key], processedEntity, key, schema, addEntity);
      }
    });

    addEntity(this, processedEntity, input, parent, key);
    return this.getId(input, parent, key);
  }

  denormalize(entityOrId, unvisit, entities, visitedEntities) {
    const entity = typeof entityOrId === 'object' ? entityOrId : entities[this.key][entityOrId];
    return denormalize(this.schema, entity, unvisit, entities, visitedEntities);
  }
}
