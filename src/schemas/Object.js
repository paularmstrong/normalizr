// @flow
import * as ImmutableUtils from './ImmutableUtils';
import type { AddEntity, Unvisitor, Visitor } from '../types';

type ObjectInput = {};
type SchemaDefinition = {};

export const normalize = (
  schema: SchemaDefinition,
  input: ObjectInput,
  parent: ?{},
  key: ?string,
  visit: Visitor,
  addEntity: AddEntity
): {} => {
  const object = { ...input };
  Object.keys(schema).forEach((key) => {
    const localSchema = schema[key];
    const value = visit(input[key], input, key, localSchema, addEntity);
    if (value === undefined || value === null) {
      delete object[key];
    } else {
      object[key] = value;
    }
  });
  return object;
};

export const denormalize = <T: mixed>(schema: {}, input: T, unvisit: Unvisitor): {} | T => {
  if (ImmutableUtils.isImmutable(input)) {
    return ImmutableUtils.denormalizeImmutable(schema, input, unvisit);
  }

  if (typeof input !== 'object') {
    return input;
  }

  const object = { ...input };
  Object.keys(schema).forEach((key) => {
    if (object[key]) {
      object[key] = unvisit(object[key], schema[key]);
    }
  });
  return object;
};

export default class ObjectSchema {
  schema: SchemaDefinition;

  constructor(definition: SchemaDefinition) {
    this.define(definition);
  }

  define(definition: {}) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  normalize(...args: *) {
    return normalize(this.schema, ...args);
  }

  denormalize(...args: *) {
    return denormalize(this.schema, ...args);
  }
}
