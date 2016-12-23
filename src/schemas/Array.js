import UnionSchema from './Union';

const validateSchema = (definition) => {
  const isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
  }

  return isArray ? definition[0] : definition;
};

export const normalize = (schema, input, parent, key, visit, addEntity) => {
  schema = validateSchema(schema);

  const values = Array.isArray(input) ? input : Object.values(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map((value, index) => visit(value, parent, key, schema, addEntity));
};

export default class ArraySchema extends UnionSchema {
  normalize(input, parent, key, visit, addEntity) {
    const values = Array.isArray(input) ? values : Object.values(input);

    return input.map((value, index) => {
      const schema = this.inferSchema(value, input, index);
      return visit(value, parent, key, schema, addEntity);
    });
  }
}
