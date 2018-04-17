// @flow
import PolymorphicSchema from './Polymorphic';
import type { AddEntity, Schema, Unvisitor, Visitor } from './types';

type ArrayInput = Array<*> | Object;

const validateSchema = (definition) => {
  const isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
  }

  return definition[0];
};

const getValues = (input: ArrayInput): Array<*> => {
  if (Array.isArray(input)) {
    return input;
  } else {
    // $FlowFixMe we know this is an object now
    return Object.keys(input).map((key) => input[key]);
  }
};

export const normalize = (
  schema: Schema,
  input: ArrayInput,
  parent: mixed,
  key: string,
  visit: Visitor,
  addEntity: AddEntity
): Array<*> => {
  schema = validateSchema(schema);

  const values = getValues(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map((value, index) => visit(value, parent, key, schema, addEntity));
};

export const denormalize = (schema: Schema, input: ?Array<*>, unvisit: Unvisitor): ?Array<*> => {
  schema = validateSchema(schema);
  return input && input.map ? input.map((entityOrId) => unvisit(entityOrId, schema)) : input;
};

export default class ArraySchema extends PolymorphicSchema {
  normalize(input: ArrayInput, parent: Object, key: string, visit: Visitor, addEntity: AddEntity): Array<*> {
    const values = getValues(input);

    return values
      .map((value, index) => this.normalizeValue(value, parent, key, visit, addEntity))
      .filter((value) => value !== undefined && value !== null);
  }

  denormalize(input: ?Array<*>, unvisit: Unvisitor): ?Array<*> {
    return input && input.map ? input.map((value) => this.denormalizeValue(value, unvisit)) : input;
  }
}
