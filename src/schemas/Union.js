// @flow
import PolymorphicSchema from './Polymorphic';
import type { SchemaAttribute } from './Polymorphic';
import type { AddEntity, Unvisitor, Visitor } from '../types';

export default class UnionSchema extends PolymorphicSchema {
  constructor(definition: {}, schemaAttribute: SchemaAttribute) {
    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    super(definition, schemaAttribute);
  }

  normalize(input: {}, parent: ?{}, key: ?string, visit: Visitor, addEntity: AddEntity) {
    return this.normalizeValue(input, parent, key, visit, addEntity);
  }

  denormalize(input: { schema?: string, id?: string }, unvisit: Unvisitor) {
    return this.denormalizeValue(input, unvisit);
  }
}
