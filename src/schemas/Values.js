export default class ValuesSchema {
  constructor(definition, options) {
    this.define(definition);
  }

  define(definition) {
    this.schema = definition;
  }

  normalize(input, parent, key, addEntity, visit) {
    if (typeof input !== 'object') {
      throw new Error(`Expected object of but found ${typeof input}.`);
    }

    return Object.entries(input).reduce((output, [ key, value ], index) => {
      return { ...output, [key]: visit(input, key, value, this.schema, addEntity) };
    }, {});
  }
}
