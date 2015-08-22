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

function visitObjectForDenorm(obj, schema, bag) {
  var denormalized = {},
    key = Object.keys(obj)[0];

  denormalized[key] = visitForDenorm(obj[key], schema[key], bag);

  return denormalized;
}

function visitArray(obj, arraySchema, bag, options) {
  const itemSchema = arraySchema.getItemSchema();

  const normalized = obj.map(childObj =>
    visit(childObj, itemSchema, bag, options)
  );
  return normalized;
}

function visitArrayForDenorm(obj, arraySchema, bag) {
  var itemSchema = arraySchema.getItemSchema(),
    itemSchemaKey = itemSchema.getKey(),
    denormalized;

  var item = bag[itemSchemaKey];

  denormalized = [];
  obj.forEach(function(itemKey) {
    var keys;
    if (item.hasOwnProperty(itemSchemaKey)) {
      denormalized.push(visitForDenorm(item[itemKey], itemSchema[itemSchemaKey], bag));
    } else {
      keys = Object.keys(itemSchema);
      if (keys.length <= 2) {
        denormalized.push(visitForDenorm(item[itemKey], undefined));
      } else {
        denormalized.push(visitForDenorm(itemKey, itemSchema, bag));
      }
    }
  });

  return denormalized;
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
  const idAttribute = entitySchema.getIdAttribute();
  const id = entity[idAttribute];

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

function visitEntityForDenorm(entity, entitySchema, bag) {
  var entityKey = entitySchema.getKey();
  var denormalized = bag[entityKey][entity];
  Object.keys(entitySchema).forEach(function(schemaKey) {
    if (schemaKey.indexOf('_') !== 0) {  // TODO: better way to access the relevant schema keys?
      if (typeof denormalized === 'object' && denormalized.hasOwnProperty(schemaKey)) {
        denormalized[schemaKey] = visitForDenorm(denormalized[schemaKey], entitySchema[schemaKey], bag);
      }
    }
  });
  return denormalized;
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

function visitForDenorm(obj, schema, bag) {
  if (!isObject(schema)) {
    return obj;
  }

  if (schema instanceof EntitySchema) {
    return visitEntityForDenorm(obj, schema, bag);
  } else if (schema instanceof ArraySchema) {
    return visitArrayForDenorm(obj, schema, bag);
  } else {
    return visitObjectForDenorm(obj, schema, bag);
  }
}

export function arrayOf(schema) {
  return new ArraySchema(schema);
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

export function denormalize(obj, schema) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    throw new Error('Denormalize accepts an object or an array as its input.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  var bag = obj.entities;
  var result = obj.result;
  var denormalized = visitForDenorm(result, schema, bag);

  return denormalized;
}

