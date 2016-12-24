import PolymorphicSchema from './Polymorphic';

export default class UnionSchema extends PolymorphicSchema {
  constructor(definition, schemaAttribute) {
    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    super(definition, schemaAttribute);
  }

  normalize(input, parent, key, visit, addEntity) {
    if (!Array.isArray(input)) {
      throw new Error(`Expected array of but found ${typeof input}.`);
    }

    return input.map((value, index) => this.normalizeValue(value, input, index, visit, addEntity));
  }
}
