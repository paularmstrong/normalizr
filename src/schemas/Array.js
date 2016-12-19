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

    return input.map((value, index) => visit(value, input, index, this.schema, addEntity));
  }
}
