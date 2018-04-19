// @flow
import * as ImmutableUtils from './schemas/ImmutableUtils';
import EntitySchema from './schemas/Entity';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';
import type { AddEntity, Schema, Unvisitor, Visitor } from './types';
import ArraySchema, * as ArrayUtils from './schemas/Array';
import ObjectSchema, * as ObjectUtils from './schemas/Object';

const visit: Visitor = (value, parent, key, schema, addEntity) => {
  if (typeof value !== 'object' || !value) {
    return value;
  }

  if (Array.isArray(schema)) {
    return ArrayUtils.normalize(schema, value, parent, key, visit, addEntity);
  }

  if (typeof schema === 'object' && (!schema.normalize || typeof schema.normalize !== 'function')) {
    return ObjectUtils.normalize(schema, value, parent, key, visit, addEntity);
  }

  if (typeof schema.normalize === 'function') {
    return schema.normalize(value, parent, key, visit, addEntity);
  }

  return value;
};

const addEntities = (entities): AddEntity => (schema, processedEntity, value, parent, key) => {
  const schemaKey = schema.key;
  const id = schema.getId(value, parent, key);
  if (!(schemaKey in entities)) {
    entities[schemaKey] = {};
  }

  const existingEntity = entities[schemaKey][id];
  if (existingEntity) {
    entities[schemaKey][id] = schema.merge(existingEntity, processedEntity);
  } else {
    entities[schemaKey][id] = processedEntity;
  }
};

export const schema = {
  Array: ArraySchema,
  Entity: EntitySchema,
  Object: ObjectSchema,
  Union: UnionSchema,
  Values: ValuesSchema
};

export const normalize = (input: mixed, schema: Schema) => {
  if (!input || typeof input !== 'object') {
    throw new Error(`Unexpected input given to normalize. Expected type to be "object", found "${typeof input}".`);
  }

  const entities = {};
  const addEntity = addEntities(entities);

  const result = visit(input, input, null, schema, addEntity);
  return { entities, result };
};

const unvisitEntity = (id, schema, unvisit, getEntity, cache) => {
  const entity = getEntity(id, schema);
  if (typeof entity !== 'object' || Array.isArray(entity) || entity === null) {
    return entity;
  }

  if (!cache[schema.key]) {
    cache[schema.key] = {};
  }

  if (!cache[schema.key][id]) {
    // Ensure we don't mutate it non-immutable objects
    const entityCopy = ImmutableUtils.isImmutable(entity) ? entity : { ...entity };

    // Need to set this first so that if it is referenced further within the
    // denormalization the reference will already exist.
    cache[schema.key][id] = entityCopy;
    cache[schema.key][id] = schema.denormalize(entityCopy, unvisit);
  }

  return cache[schema.key][id];
};

const getUnvisit = (entities) => {
  const cache = {};
  const getEntity = getEntities(entities);

  const unvisit: Unvisitor = (input, schema) => {
    if (Array.isArray(schema)) {
      if (Array.isArray(input)) {
        return ArrayUtils.denormalize(schema, input, unvisit);
      }
    }

    if (typeof schema === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
      // $FlowFixMe Arrays are already filtered out from schema/input
      return ObjectUtils.denormalize(schema, input, unvisit);
    }

    if (input === undefined || input === null) {
      return input;
    }

    if (schema instanceof EntitySchema) {
      return unvisitEntity(input, schema, unvisit, getEntity, cache);
    }

    // $FlowFixMe disallowed inputs already filtered out
    return schema.denormalize(input, unvisit);
  };
  return unvisit;
};

const getEntities = (entities) => {
  const isImmutable = ImmutableUtils.isImmutable(entities);

  return (entityOrId, schema) => {
    const schemaKey = schema.key;

    if (typeof entityOrId === 'object') {
      return entityOrId;
    }

    // $FlowFixMe can't understand Immutable/ImmutableUtils
    return isImmutable ? entities.getIn([schemaKey, entityOrId.toString()]) : entities[schemaKey][entityOrId];
  };
};

export const denormalize = (input: mixed, schema: Schema, entities: {}) => {
  if (typeof input !== 'undefined') {
    return getUnvisit(entities)(input, schema);
  }
};
