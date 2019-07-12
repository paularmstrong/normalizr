import * as ImmutableUtils from './schemas/ImmutableUtils';
import EntitySchema from './schemas/Entity';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';
import ArraySchema, * as ArrayUtils from './schemas/Array';
import ObjectSchema, * as ObjectUtils from './schemas/Object';

const visit = (value, parent, key, schema, addEntity, visitedEntities) => {
  if (typeof value !== 'object' || !value) {
    return value;
  }

  if (typeof schema === 'object' && (!schema.normalize || typeof schema.normalize !== 'function')) {
    const method = Array.isArray(schema) ? ArrayUtils.normalize : ObjectUtils.normalize;
    return method(schema, value, parent, key, visit, addEntity, visitedEntities);
  }

  return schema.normalize(value, parent, key, visit, addEntity, visitedEntities);
};

const addEntities = (entities) => (schema, processedEntity, value, parent, key) => {
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

export const normalize = (input, schema) => {
  if (!input || typeof input !== 'object') {
    throw new Error(`Unexpected input given to normalize. Expected type to be "object", found "${typeof input}".`);
  }

  const entities = {};
  const addEntity = addEntities(entities);
  const visitedEntities = [];

  const result = visit(input, input, null, schema, addEntity, visitedEntities);
  return { entities, result };
};

const unvisitEntity = (id, schema, unvisit, getEntity, cache) => {
  const entity = getEntity(id, schema);
  if (typeof entity !== 'object' || entity === null) {
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

  return function unvisit(input, schema) {
    if (typeof schema === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
      const method = Array.isArray(schema) ? ArrayUtils.denormalize : ObjectUtils.denormalize;
      return method(schema, input, unvisit);
    }

    if (input === undefined || input === null) {
      return input;
    }

    if (schema instanceof EntitySchema) {
      return unvisitEntity(input, schema, unvisit, getEntity, cache);
    }

    if (typeof schema.denormalize === 'function') {
      return schema.denormalize(input, unvisit);
    }

    return input;
  };
};

const getEntities = (entities) => {
  const isImmutable = ImmutableUtils.isImmutable(entities);

  return (entityOrId, schema) => {
    const schemaKey = schema.key;

    if (typeof entityOrId === 'object') {
      return entityOrId;
    }

    if (isImmutable) {
      return entities.getIn([schemaKey, entityOrId.toString()]);
    }

    return entities[schemaKey] && entities[schemaKey][entityOrId];
  };
};

export const denormalize = (input, schema, entities) => {
  if (typeof input !== 'undefined') {
    return getUnvisit(entities)(input, schema);
  }
};
