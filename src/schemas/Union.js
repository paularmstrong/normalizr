export default class UnionSchema {
  constructor(definition, options) {
    const { schemaAttribute } = options;
    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    this._schemaAttribute = typeof schemaAttribute === 'string' ?
      (input) => input[schemaAttribute] :
      schemaAttribute;
    this.define(definition);
  }

  getSchemaAttribute(input) {
    return this._schemaAttribute(input);
  }

  inferSchema(input) {
    const attr = this.getSchemaAttribute(input);
    const schema = this.schema[attr];
    if (!schema) {
      throw new Error(`No schema found for attribute "${attr}".`);
    }
    return schema;
  }

  define(definition) {
    this.schema = definition;
  }

  normalize(input, parent, key, addEntity, visit) {
    if (!Array.isArray(input)) {
      throw new Error(`Expected array of but found ${typeof input}.`);
    }

    return input.map((value, index) => {
      const schema = this.inferSchema(value);
      return { id: visit(input, index, value, schema, addEntity), schema: schema.key };
    });
  }
}
