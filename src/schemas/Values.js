import UnionSchema from './Union';

export default class ValuesSchema extends UnionSchema {
  normalize(input, parent, key, visit, addEntity) {
    if (typeof input !== 'object') {
      throw new Error(`Expected object of but found ${typeof input}.`);
    }

    return Object.keys(input).reduce((output, key, index) => {
      const value = input[key];
      const schema = this.inferSchema(value, key);
      return { ...output, [key]: visit(value, input, key, schema, addEntity) };
    }, {});
  }
}
