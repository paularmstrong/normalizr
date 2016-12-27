import PolymorphicSchema from './Polymorphic';

const validateSchema = (definition) => {
  const isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
  }

  return definition[0];
};

export const normalize = (schema, input, parent, key, visit, addEntity) => {
  schema = validateSchema(schema);

  const values = Array.isArray(input) ? input : Object.values(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map((value, index) => visit(value, parent, key, schema, addEntity));
};

export default class ArraySchema extends PolymorphicSchema {
  normalize(input, parent, key, visit, addEntity) {
    const values = Array.isArray(input) ? input : Object.values(input);

    return values.map((value, index) => this.normalizeValue(value, parent, key, visit, addEntity))
      .filter((value) => value !== undefined && value !== null);
  }
}
