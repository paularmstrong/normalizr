'use strict';

exports.__esModule = true;
exports.arrayOf = arrayOf;
exports.valuesOf = valuesOf;
exports.unionOf = unionOf;
exports.normalize = normalize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _EntitySchema = require('./EntitySchema');

var _EntitySchema2 = _interopRequireDefault(_EntitySchema);

var _IterableSchema = require('./IterableSchema');

var _IterableSchema2 = _interopRequireDefault(_IterableSchema);

var _UnionSchema = require('./UnionSchema');

var _UnionSchema2 = _interopRequireDefault(_UnionSchema);

var _lodashIsEqual = require('lodash/isEqual');

var _lodashIsEqual2 = _interopRequireDefault(_lodashIsEqual);

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

function defaultAssignEntity(normalized, key, entity) {
  normalized[key] = entity;
}

function visitObject(obj, schema, bag, options) {
  var _options$assignEntity = options.assignEntity;
  var assignEntity = _options$assignEntity === undefined ? defaultAssignEntity : _options$assignEntity;

  var normalized = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var actualAssignEntity = schema[key] && schema[key].getAssignEntity && schema[key].getAssignEntity() || assignEntity;
      var entity = visit(obj[key], schema[key], bag, options);
      actualAssignEntity.call(null, normalized, key, entity, obj);
    }
  }
  return normalized;
}

function defaultMapper(iterableSchema, itemSchema, bag, options) {
  return function (obj) {
    return visit(obj, itemSchema, bag, options);
  };
}

function polymorphicMapper(iterableSchema, itemSchema, bag, options) {
  return function (obj) {
    var schemaKey = iterableSchema.getSchemaKey(obj);
    var result = visit(obj, itemSchema[schemaKey], bag, options);
    return { id: result, schema: schemaKey };
  };
}

function visitIterable(obj, iterableSchema, bag, options) {
  var itemSchema = iterableSchema.getItemSchema();
  var curriedItemMapper = defaultMapper(iterableSchema, itemSchema, bag, options);

  if (Array.isArray(obj)) {
    return obj.map(curriedItemMapper);
  } else {
    return Object.keys(obj).reduce(function (objMap, key) {
      objMap[key] = curriedItemMapper(obj[key]);
      return objMap;
    }, {});
  }
}

function visitUnion(obj, unionSchema, bag, options) {
  var itemSchema = unionSchema.getItemSchema();
  return polymorphicMapper(unionSchema, itemSchema, bag, options)(obj);
}

function defaultMergeIntoEntity(entityA, entityB, entityKey) {
  for (var key in entityB) {
    if (!entityB.hasOwnProperty(key)) {
      continue;
    }

    if (!entityA.hasOwnProperty(key) || _lodashIsEqual2['default'](entityA[key], entityB[key])) {
      entityA[key] = entityB[key];
      continue;
    }

    console.warn('When merging two ' + entityKey + ', found unequal data in their "' + key + '" values. Using the earlier value.', entityA[key], entityB[key]);
  }
}

function visitEntity(entity, entitySchema, bag, options) {
  var _options$mergeIntoEntity = options.mergeIntoEntity;
  var mergeIntoEntity = _options$mergeIntoEntity === undefined ? defaultMergeIntoEntity : _options$mergeIntoEntity;

  var entityKey = entitySchema.getKey();
  var id = entitySchema.getId(entity);

  if (!bag.hasOwnProperty(entityKey)) {
    bag[entityKey] = {};
  }

  if (!bag[entityKey].hasOwnProperty(id)) {
    bag[entityKey][id] = {};
  }

  var stored = bag[entityKey][id];
  var normalized = visitObject(entity, entitySchema, bag, options);
  mergeIntoEntity(stored, normalized, entityKey);

  return id;
}

function visit(obj, schema, bag, options) {
  if (!_lodashIsObject2['default'](obj) || !_lodashIsObject2['default'](schema)) {
    return obj;
  }

  if (schema instanceof _EntitySchema2['default']) {
    return visitEntity(obj, schema, bag, options);
  } else if (schema instanceof _IterableSchema2['default']) {
    return visitIterable(obj, schema, bag, options);
  } else if (schema instanceof _UnionSchema2['default']) {
    return visitUnion(obj, schema, bag, options);
  } else {
    return visitObject(obj, schema, bag, options);
  }
}

function arrayOf(schema, options) {
  return new _IterableSchema2['default'](schema, options);
}

function valuesOf(schema, options) {
  return new _IterableSchema2['default'](schema, options);
}

function unionOf(schema, options) {
  return new _UnionSchema2['default'](schema, options);
}

exports.Schema = _EntitySchema2['default'];

function normalize(obj, schema) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (!_lodashIsObject2['default'](obj)) {
    throw new Error('Normalize accepts an object or an array as its input.');
  }

  if (!_lodashIsObject2['default'](schema) || Array.isArray(schema)) {
    throw new Error('Normalize accepts an object for schema.');
  }

  var bag = {};
  var result = visit(obj, schema, bag, options);

  return {
    entities: bag,
    result: result
  };
}