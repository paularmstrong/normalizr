export default class ArraySchema {
  constructor(definition, options) {
    this.define(definition);
  }

  define(definition) {
    this.schema = definition;
  }

  normalize(input, parent, key, visit, addEntity) {
    if (!Array.isArray(input)) {
      throw new Error(`Expected array of but found ${typeof input}.`);
    }

    return input.map((value, index) => visit(input, index, value, this.schema, addEntity));
  }
}
