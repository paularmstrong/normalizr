export default class UnionSchema {
  constructor(definition, schemaAttribute) {
    if (!schemaAttribute) {
      throw new Error('Expected option "schemaAttribute" not found on UnionSchema.');
    }
    this._schemaAttribute = typeof schemaAttribute === 'string' ?
      (input) => input[schemaAttribute] :
      schemaAttribute;
    this.define(definition);
  }

  define(definition) {
    this.schema = definition;
  }

  getSchemaAttribute(input, parent, key) {
    return this._schemaAttribute(input, parent, key);
  }

  inferSchema(input, parent, key) {
    const attr = this.getSchemaAttribute(input, parent, key);
    const schema = this.schema[attr];
    if (!schema) {
      throw new Error(`No schema found for attribute "${attr}".`);
    }
    return schema;
  }

  normalize(input, parent, key, visit, addEntity) {
    if (!Array.isArray(input)) {
      throw new Error(`Expected array of but found ${typeof input}.`);
    }

    return input.map((value, index) => {
      const schema = this.inferSchema(value, input, index);
      return {
        id: visit(value, input, index, schema, addEntity),
        schema: this.getSchemaAttribute(value, input, index)
      };
    });
  }
}
