import PolymorphicSchema from './Polymorphic';

export default class ValuesSchema extends PolymorphicSchema {
  normalize(input, parent, key, visit, addEntity, context) {
    return Object.keys(input).reduce((output, key, index) => {
      const value = input[key];
      return value !== undefined && value !== null
        ? {
            ...output,
            [key]: this.normalizeValue(value, input, key, visit, addEntity, context)
          }
        : output;
    }, {});
  }

  denormalize(input, unvisit) {
    return Object.keys(input).reduce((output, key) => {
      const entityOrId = input[key];
      return {
        ...output,
        [key]: this.denormalizeValue(entityOrId, unvisit)
      };
    }, {});
  }
}
