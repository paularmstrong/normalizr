'use strict';

var EntitySchema = require('./EntitySchema'),
    ArraySchema = require('./ArraySchema'),
    isObject = require('lodash/lang/isObject'),
    isEqual = require('lodash/lang/isEqual');

function visitObject(obj, schema, bag, options) {
  var normalized = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var entity = visit(obj[prop], schema[prop], bag, options);
      if (options && options.hasOwnProperty('assignEntity'))
        options.assignEntity(normalized, prop, entity);
      else
        normalized[prop] = entity;
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
  for (var prop in entityB) {
    if (!entityB.hasOwnProperty(prop)) {
      continue;
    }

    if (!entityA.hasOwnProperty(prop) || isEqual(entityA[prop], entityB[prop])) {
      entityA[prop] = entityB[prop];
      continue;
    }

    console.warn(
      'When merging two ' + entityKey + ', found unequal data in their "' + prop + '" values. Using the earlier value.',
      entityA[prop], entityB[prop]
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

function normalize(obj, schema, options) {
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
