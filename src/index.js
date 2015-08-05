'use strict';

var EntitySchema = require('./EntitySchema'),
    ArraySchema = require('./ArraySchema'),
    isObject = require('lodash/lang/isObject'),
    isEqual = require('lodash/lang/isEqual');

function visitObject(obj, schema, bag, assignEntity) {
  var normalized = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var entity = visit(obj[prop], schema[prop], bag, assignEntity);
      if (assignEntity)
        assignEntity(normalized, prop, entity);
      else
        normalized[prop] = entity;
    }
  }

  return normalized;
}

function visitArray(obj, arraySchema, bag, assignEntity) {
  var itemSchema = arraySchema.getItemSchema(),
      normalized;

  normalized = obj.map(function (childObj) {
    return visit(childObj, itemSchema, bag, assignEntity);
  });

  return normalized;
}


function mergeIntoEntity(entityA, entityB, entityKey) {
  for (var prop in entityB) {
    if (!entityB.hasOwnProperty(prop)) {
      continue;
    }

    if (!entityA.hasOwnProperty(prop) || isEqual(entityA[prop], entityB[prop])) {
      entityA[prop] = entityB[prop];
      continue;
    }

    console.warn(
      'When merging two ' + entityKey + ', found shallowly unequal data in their "' + prop + '" values. Using the earlier value.',
      entityA[prop], entityB[prop]
    );
  }
}

function visitEntity(entity, entitySchema, bag, assignEntity) {
  var entityKey = entitySchema.getKey(),
      idAttribute = entitySchema.getIdAttribute(),
      id = entity[idAttribute],
      stored,
      normalized;

  if (!bag[entityKey]) {
    bag[entityKey] = {};
  }

  if (!bag[entityKey][id]) {
    bag[entityKey][id] = {};
  }

  stored = bag[entityKey][id];
  normalized = visitObject(entity, entitySchema, bag, assignEntity);

  mergeIntoEntity(stored, normalized, entityKey);

  return id;
}

function visit(obj, schema, bag, assignEntity) {
  if (!isObject(obj) || !isObject(schema)) {
    return obj;
  }

  if (schema instanceof EntitySchema) {
    return visitEntity(obj, schema, bag, assignEntity);
  } else if (schema instanceof ArraySchema) {
    return visitArray(obj, schema, bag, assignEntity);
  } else {
    return visitObject(obj, schema, bag, assignEntity);
  }
}

function normalize(obj, schema, assignEntity) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    throw new Error('Normalize accepts an object or an array as its input.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  var bag = {},
      result = visit(obj, schema, bag, assignEntity);

  return {
    entities: bag,
    result: result
  };
}

function arrayOf(schema) {
  return new ArraySchema(schema);
}

module.exports = {
  Schema: EntitySchema,
  arrayOf: arrayOf,
  normalize: normalize
};
