export default class PolymorphicSchema {
  constructor(definition, schemaAttribute) {
    if (schemaAttribute) {
      this._schemaAttribute = typeof schemaAttribute === 'string' ?
        (input) => input[schemaAttribute] :
        schemaAttribute;
    }
    this.define(definition);
  }

  get isSingleSchema() {
    return !this._schemaAttribute;
  }

  define(definition) {
    this.schema = definition;
  }

  getSchemaAttribute(input, parent, key) {
    return !this.isSingleSchema && this._schemaAttribute(input, parent, key);
  }

  inferSchema(input, parent, key) {
    if (this.isSingleSchema) {
      return this.schema;
    }

    const attr = this.getSchemaAttribute(input, parent, key);
    const schema = this.schema[attr];
    if (!schema) {
      throw new Error(`No schema found for attribute "${attr}".`);
    }
    return schema;
  }

  normalizeValue(value, parent, key, visit, addEntity) {
    const schema = this.inferSchema(value, parent, key);
    const normalizedValue = visit(value, parent, key, schema, addEntity);
    return this.isSingleSchema ?
      normalizedValue :
      { id: normalizedValue, schema: this.getSchemaAttribute(value, parent, key) };
  }
}
