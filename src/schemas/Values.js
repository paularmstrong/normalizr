// @flow
import PolymorphicSchema from './Polymorphic';
import type { AddEntity, Unvisitor, Visitor } from '../types';

export default class ValuesSchema extends PolymorphicSchema {
  normalize(input: {}, parent: ?{}, key: ?string, visit: Visitor, addEntity: AddEntity) {
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

  denormalize(input: { [key: string]: string | { schema?: string, id?: string } }, unvisit: Unvisitor) {
    return Object.keys(input).reduce((output, key) => {
      const entityOrId: string | { schema?: string, id?: string } = input[key];
      return {
        ...output,
        [key]: this.denormalizeValue(entityOrId, unvisit)
      };
    }, {});
  }
}
