import EntitySchema from './schemas/Entity';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';
import ArraySchema, * as ArrayUtils from './schemas/Array';
import ObjectSchema, * as ObjectUtils from './schemas/Object';

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

const unvisit = (input, schema, getDenormalizedEntity) => {
  if (typeof schema === 'object' && (!schema.denormalize || typeof schema.denormalize !== 'function')) {
    const method = Array.isArray(schema) ? ArrayUtils.denormalize : ObjectUtils.denormalize;
    return method(schema, input, unvisit, getDenormalizedEntity);
  }

  return schema.denormalize(input, unvisit, getDenormalizedEntity);
};

const getEntities = (entities, visitedEntities) => (schema, entityOrId) => {
  const schemaKey = schema.key;
  if (!visitedEntities[schemaKey]) {
    visitedEntities[schemaKey] = {};
  }

  const entity = typeof entityOrId === 'object' ? entityOrId : entities[schemaKey][entityOrId];
  const id = schema.getId(entity);
  if (visitedEntities[schemaKey][id]) {
    return id;
  }

  visitedEntities[schemaKey][id] = true;
  return entity;
};

export const denormalize = (input, schema, entities) => {
  if (!input) {
    return input;
  }

  const getDenormalizedEntity = getEntities(entities, {});
  return unvisit(input, schema, getDenormalizedEntity);
};
