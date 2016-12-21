export default class ArraySchema {
  constructor(definition) {
    this.define(definition);
  }

  define(definition) {
    const isArray = Array.isArray(definition);
    if (isArray && definition.length > 1) {
      throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
    }
    this.schema = isArray ? definition[0] : definition;
  }

  normalize(input, parent, key, visit, addEntity) {
    if (!Array.isArray(input)) {
      console.log(input);
      throw new Error(`Expected array of but found ${typeof input}.`);
    }

    // Special case: Arrays pass *their* parent on to their children, since there
    // is not any special information that can be gathered from themselves directly
    return input.map((value, index) => visit(value, parent, index, this.schema, addEntity));
  }
}
