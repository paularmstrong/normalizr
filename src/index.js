'use strict';

var EntitySchema = require('./EntitySchema'),
    ArraySchema = require('./ArraySchema'),
    isObject = require('lodash/lang/isObject'),
    isEqual = require('lodash/lang/isEqual');

function defaultAssignEntity(normalized, key, entity) {
  normalized[key] = entity;
}

function visitObject(obj, schema, bag, options) {
  var { assignEntity = defaultAssignEntity } = options;
  var normalized = {};

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var entity = visit(obj[key], schema[key], bag, options);
      assignEntity.call(null, normalized, key, entity);
    }
  }

  return normalized;
}

function visitArray(obj, arraySchema, bag, options) {
  var itemSchema = arraySchema.getItemSchema(),
      normalized;

  normalized = obj.map(function (childObj) {
    return visit(childObj, itemSchema, bag, options);
  });

  return normalized;
}


function mergeIntoEntity(entityA, entityB, entityKey) {
  for (var key in entityB) {
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
  normalized = visitObject(entity, entitySchema, bag, options);

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

function normalize(obj, schema, options = {}) {
  if (!isObject(obj) && !Array.isArray(obj)) {
    throw new Error('Normalize accepts an object or an array as its input.');
  }

  if (!isObject(schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  var bag = {},
      result = visit(obj, schema, bag, options);

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
