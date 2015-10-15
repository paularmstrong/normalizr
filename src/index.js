import EntitySchema from './EntitySchema';
import ArraySchema from './ArraySchema';
import isObject from 'lodash/lang/isObject';
import isEqual from 'lodash/lang/isEqual';

function defaultAssignEntity(normalized, key, entity) {
  normalized[key] = entity;
}

function visitObject(obj, schema, bag, options) {
  const { assignEntity = defaultAssignEntity } = options;

  let normalized = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const entity = visit(obj[key], schema[key], bag, options);
      assignEntity.call(null, normalized, key, entity);
    }
  }
  return normalized;
}

function defaultMapper(arraySchema, itemSchema, bag, options) {
  return (obj) => visit(obj, itemSchema, bag, options);
}

function polymorphicMapper(arraySchema, itemSchema, bag, options) {
  return (obj) => {
    const schemaKey = arraySchema.getSchemaKey(obj);
    const result = visit(obj, itemSchema[schemaKey], bag, options);
    return {id: result, schema: schemaKey};
  };
}

function visitArray(obj, arraySchema, bag, options) {
  const itemSchema = arraySchema.getItemSchema();
  const isPolymorphicSchema = arraySchema.isPolymorphicSchema();
  const itemMapper = isPolymorphicSchema ? polymorphicMapper : defaultMapper;

  return obj.map(itemMapper(arraySchema, itemSchema, bag, options));
}


function mergeIntoEntity(entityA, entityB, entityKey) {
  for (let key in entityB) {
    if (!entityB.hasOwnProperty(key)) {
      continue;
    }

    if (!entityA.hasOwnProperty(key) || isEqual(entityA[key], entityB[key])) {
      entityA[key] = entityB[key];
      continue;
    }

    console.warn(
      'When merging two ' + entityKey + ', found unequal data in their "' + key + '" values. Using the earlier value.',
      entityA[key], entityB[key]
    );
  }
}

function visitEntity(entity, entitySchema, bag, options) {
  const entityKey = entitySchema.getKey();
  const id = entitySchema.getId(entity);

  if (!bag[entityKey]) {
    bag[entityKey] = {};
  }

  if (!bag[entityKey][id]) {
    bag[entityKey][id] = {};
  }

  let stored = bag[entityKey][id];
  let normalized = visitObject(entity, entitySchema, bag, options);
  mergeIntoEntity(stored, normalized, entityKey);

  return id;
}

function visit(obj, schema, bag, options) {
  if (!isObject(obj) || !isObject(schema)) {
    return obj;
  }

  if (schema instanceof EntitySchema) {
    return visitEntity(obj, schema, bag, options);
  } else if (schema instanceof ArraySchema) {
    return visitArray(obj, schema, bag, options);
  } else {
    return visitObject(obj, schema, bag, options);
  }
}

export function arrayOf(schema, options) {
  return new ArraySchema(schema, options);
}

export { EntitySchema as Schema };

export function normalize(obj, schema, options = {}) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    throw new Error('Normalize accepts an object or an array as its input.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  let bag = {};
  let result = visit(obj, schema, bag, options);

  return {
    entities: bag,
    result
  };
}
