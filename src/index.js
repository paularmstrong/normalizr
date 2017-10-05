import EntitySchema from './schemas/Entity';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';
import ArraySchema, * as ArrayUtils from './schemas/Array';
import ObjectSchema, * as ObjectUtils from './schemas/Object';
import * as ImmutableUtils from './schemas/ImmutableUtils';

const visit = (value, parent, key, schema, addEntity) => {
  if (typeof value !== 'object' || !value) {
    return value;
  }

  if (typeof schema === 'object' && (!schema.normalize || typeof schema.normalize !== 'function')) {
    const method = Array.isArray(schema) ? ArrayUtils.normalize : ObjectUtils.normalize;
    return method(schema, value, parent, key, visit, addEntity);
  }

  return schema.normalize(value, parent, key, visit, addEntity);
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

  const result = visit(input, input, null, schema, addEntity);
  return { entities, result };
};

const unvisitEntity = (input, schema, unvisit, getEntity, cache) => {
  if (cache[schema.key] && cache[schema.key].includes(input)) {
    return input;
  }
  const entity = getEntity(input, schema);
  if (typeof entity !== 'object' || entity === null) {
    return entity;
  }

  const id = schema.getId(entity);
  const entityCopy = ImmutableUtils.isImmutable(entity) ? entity : { ...entity };
  return schema.denormalize(entityCopy, unvisit, {
    // create a new cache for this subtree to insure that any entity is only
    // expanded once per subtree
    ...cache,
    // add id of entity to cache
    [schema.key]: [ ...(cache[schema.key] || []), id ]
  });
};

const getUnvisit = (entities) => {
  const getEntity = getEntities(entities);

  return function unvisit(input, schema, cache = {}) {
    if (typeof schema === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
      const method = Array.isArray(schema) ? ArrayUtils.denormalize : ObjectUtils.denormalize;
      return method(schema, input, unvisit, cache);
    }

    if (input === undefined || input === null) {
      return input;
    }

    if (schema instanceof EntitySchema) {
      return unvisitEntity(input, schema, unvisit, getEntity, cache);
    }
    return schema.denormalize(input, unvisit, cache);
  };
};

const getEntities = (entities) => {
  const isImmutable = ImmutableUtils.isImmutable(entities);

  return (entityOrId, schema) => {
    const schemaKey = schema.key;

    if (typeof entityOrId === 'object') {
      return entityOrId;
    }

    return isImmutable ?
      entities.getIn([ schemaKey, entityOrId.toString() ]) :
      entities[schemaKey][entityOrId];
  };
};

export const denormalize = (input, schema, entities) => {
  if (typeof input !== 'undefined') {
    return getUnvisit(entities)(input, schema);
  }
};
