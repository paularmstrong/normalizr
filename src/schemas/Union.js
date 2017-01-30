import PolymorphicSchema from './Polymorphic';

export default class UnionSchema extends PolymorphicSchema {
  constructor(definition, schemaAttribute) {
    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    super(definition, schemaAttribute);
  }

  normalize(input, parent, key, visit, addEntity) {
    return this.normalizeValue(input, parent, key, visit, addEntity);
  }

  denormalize(input, unvisit, getDenormalizedEntity) {
    return this.denormalizeValue(input, unvisit, getDenormalizedEntity);
  }
}
