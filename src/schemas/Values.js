import PolymorphicSchema from './Polymorphic';

export default class ValuesSchema extends PolymorphicSchema {
  normalize(input, parent, key, visit, addEntity) {
    if (typeof input !== 'object') {
      throw new Error(`Expected object of but found ${typeof input}.`);
    }

    return Object.keys(input).reduce((output, key, index) => {
      const value = input[key];
      return {
        ...output,
        [key]: this.normalizeValue(value, input, key, visit, addEntity)
      };
    }, {});
  }
}
