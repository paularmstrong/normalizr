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
    return this.schema[attr];
  }

  normalizeValue(value, parent, key, visit, addEntity) {
    const schema = this.inferSchema(value, parent, key);
    if (!schema) {
      return value;
    }
    const normalizedValue = visit(value, parent, key, schema, addEntity);
    return this.isSingleSchema || normalizedValue === undefined || normalizedValue === null ?
      normalizedValue :
      { id: normalizedValue, schema: this.getSchemaAttribute(value, parent, key) };
  }

  denormalizeValue(value, unvisit, getDenormalizedEntity) {
    if (!this.isSingleSchema && !value.schema) {
      return value;
    }
    const schema = this.isSingleSchema ? this.schema : this.schema[value.schema];
    return unvisit(value.id || value, schema, getDenormalizedEntity);
  }
}
