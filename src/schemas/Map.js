import ValuesSchema from './Values';

export default class MapSchema extends ValuesSchema {
  normalize(input, parent, key, visit, addEntity) {
    return Object.keys(input).reduce((output, key) => {
      const value = input[key];
      const id = value[this.schema.idAttribute];

      return value !== undefined && value !== null ? {
        ...output,
        [id]: this.normalizeValue(value, input, key, visit, addEntity)
      } : output;
    }, {});
  }

  denormalize(input, unvisit) {
    return Object.keys(input).reduce((output, key) => {
      const entityOrId = input[key];
      output.push(this.denormalizeValue(entityOrId, unvisit));
      return output;
    }, []);
  }
}
