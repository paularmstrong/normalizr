import PolymorphicSchema from './Polymorphic';

export default class ValuesSchema extends PolymorphicSchema {
  normalize(input, parent, key, visit, addEntity) {
    return Object.keys(input).reduce((output, key, index) => {
      const value = input[key];
      return value !== undefined && value !== null
        ? {
            ...output,
            [key]: this.normalizeValue(value, input, key, visit, addEntity)
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
  
  define(definition) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }
}
