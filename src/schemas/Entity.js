// @flow
import * as ImmutableUtils from './ImmutableUtils';
import type { AddEntity, Unvisitor, Visitor } from '../types';

const getDefaultGetId = (idAttribute: string) => (input) =>
  ImmutableUtils.isImmutable(input) ? input.get(idAttribute) : input[idAttribute];

type GetId = (input: Object, parent: Object, key: string) => string;
type IdAttribute = string;
type MergeStrategy = (entityA: Object, entityB: Object) => Object;
type ProcessStrategy = (input: Object, parent: Object, key: string) => Object;

type Options = {
  idAttribute?: GetId | IdAttribute,
  mergeStrategy?: MergeStrategy,
  processStrategy?: ProcessStrategy
};

const defaultOptions = {
  idAttribute: 'id',
  mergeStrategy: (entityA, entityB) => {
    return { ...entityA, ...entityB };
  },
  processStrategy: (input) => ({ ...input })
};

export default class EntitySchema {
  _key: string;
  _getId: GetId;
  _idAttribute: GetId | IdAttribute;
  _mergeStrategy: MergeStrategy;
  _processStrategy: ProcessStrategy;

  schema: Object;

  constructor(key: string, definition: Object = {}, options: Options = {}) {
    if (!key || typeof key !== 'string') {
      throw new Error(`Expected a string key for Entity, but found ${key}.`);
    }

    const { idAttribute, mergeStrategy, processStrategy } = options;

    this._key = key;
    this._idAttribute = options.idAttribute || defaultOptions.idAttribute;
    this._getId = typeof this._idAttribute === 'function' ? this._idAttribute : getDefaultGetId(this._idAttribute);
    this._mergeStrategy = options.mergeStrategy || defaultOptions.mergeStrategy;
    this._processStrategy = options.processStrategy || defaultOptions.processStrategy;
    this.define(definition);
  }

  get key(): string {
    return this._key;
  }

  get idAttribute(): GetId | IdAttribute {
    return this._idAttribute;
  }

  define(definition: Object) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  getId(input: Object, parent: Object, key: string) {
    return this._getId(input, parent, key);
  }

  merge(entityA: Object, entityB: Object) {
    return this._mergeStrategy(entityA, entityB);
  }

  normalize(input: Object, parent: Object, key: string, visit: Visitor, addEntity: AddEntity) {
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

  denormalize(entity: Object, unvisit: Unvisitor) {
    if (ImmutableUtils.isImmutable(entity)) {
      return ImmutableUtils.denormalizeImmutable(this.schema, entity, unvisit);
    }

    Object.keys(this.schema).forEach((key) => {
      if (entity.hasOwnProperty(key)) {
        const schema = this.schema[key];
        entity[key] = unvisit(entity[key], schema);
      }
    });
    return entity;
  }
}
