const validateSchema = (definition) => {
  const isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
  }

  return isArray ? definition[0] : definition;
};

export const normalize = (schema, input, parent, key, visit, addEntity) => {
  schema = validateSchema(schema);

  if (!Array.isArray(input)) {
    console.log(input);
    throw new Error(`Expected array of but found ${typeof input}.`);
  }

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return input.map((value, index) => visit(value, parent, index, schema, addEntity));
};

export default class ArraySchema {
  constructor(definition) {
    this.define(definition);
  }

  define(definition) {
    this.schema = definition;
  }

  normalize(...args) {
    return normalize(this.schema, ...args);
  }
}
