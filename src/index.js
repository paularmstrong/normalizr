import EntitySchema from './EntitySchema';
import IterableSchema from './IterableSchema';
import UnionSchema from './UnionSchema';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';

function defaultAssignEntity(normalized, key, entity) {
  normalized[key] = entity;
}

function visitObject(obj, schema, parentObj, bag, options) {
  const { assignEntity = defaultAssignEntity } = options;

  const defaults = schema && schema.getDefaults && schema.getDefaults();
  const schemaAssignEntity = schema && schema.getAssignEntity && schema.getAssignEntity();
  let normalized = isObject(defaults) ? { ...defaults } : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const entity = visit(obj[key], schema[key], obj, bag, options);
      assignEntity.call(null, normalized, key, entity, obj, schema);
      if (schemaAssignEntity) {
        schemaAssignEntity.call(null, normalized, key, entity, obj, schema);
      }
    }
  }
  return normalized;
}

function defaultMapper(iterableSchema, itemSchema, parentObj, bag, options) {
  return (obj) => visit(obj, itemSchema, parentObj, bag, options);
}

function polymorphicMapper(iterableSchema, itemSchema, parentObj, bag, options) {
  return (obj) => {
    const schemaKey = iterableSchema.getSchemaKey(obj);
    const result = visit(obj, itemSchema[schemaKey], parentObj, bag, options);
    return { id: result, schema: schemaKey };
  };
}

function visitIterable(obj, iterableSchema, parentObj, bag, options) {
  const itemSchema = iterableSchema.getItemSchema();
  const curriedItemMapper = defaultMapper(iterableSchema, itemSchema, parentObj, bag, options);

  if (Array.isArray(obj)) {
    return obj.map(curriedItemMapper);
  } else {
    return Object.keys(obj).reduce(function (objMap, key) {
      objMap[key] = curriedItemMapper(obj[key]);
      return objMap;
    }, {});
  }
}

function visitUnion(obj, unionSchema, parentObj, bag, options) {
  const itemSchema = unionSchema.getItemSchema();
  return polymorphicMapper(unionSchema, itemSchema, parentObj, bag, options)(obj);
}

function defaultMergeIntoEntity(entityA, entityB, entityKey) {
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

function visitEntity(entity, entitySchema, parentObj, bag, options) {
  const { mergeIntoEntity = defaultMergeIntoEntity } = options;

  const entityKey = entitySchema.getKey();
  const id = entitySchema.getId(entity, parentObj);

  if (!bag.hasOwnProperty(entityKey)) {
    bag[entityKey] = {};
  }

  if (!bag[entityKey].hasOwnProperty(id)) {
    bag[entityKey][id] = {};
  }

  let stored = bag[entityKey][id];
  let normalized = visitObject(entity, entitySchema, parentObj, bag, options);
  mergeIntoEntity(stored, normalized, entityKey);

  return id;
}

// TODO: default value here maybe?
function visit(obj, schema, parentObj, bag, options) {
  if (!isObject(obj) || !isObject(schema)) {
    return obj;
  }

  if (schema instanceof EntitySchema) {
    return visitEntity(obj, schema, parentObj, bag, options);
  } else if (schema instanceof IterableSchema) {
    return visitIterable(obj, schema, parentObj, bag, options);
  } else if (schema instanceof UnionSchema) {
    return visitUnion(obj, schema, parentObj, bag, options);
  } else {
    return visitObject(obj, schema, parentObj, bag, options);
  }
}

export function arrayOf(schema, options) {
  return new IterableSchema(schema, options);
}

export function valuesOf(schema, options) {
  return new IterableSchema(schema, options);
}

export function unionOf(schema, options) {
  return new UnionSchema(schema, options);
}

export { EntitySchema as Schema };

export function normalize(obj, schema, options = {}) {
  if (!isObject(obj)) {
    throw new Error('Normalize accepts an object or an array as its input.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  let bag = {};
  let result = visit(obj, schema, null, bag, options);

  return {
    entities: bag,
    result
  };
}
