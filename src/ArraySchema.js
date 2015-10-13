import isObject from 'lodash/lang/isObject';

export default class ArraySchema {
  constructor(itemSchema, options = {}) {
    if (!isObject(itemSchema)) {
      throw new Error('ArraySchema requires item schema to be an object.');
    }

    this._itemSchema = itemSchema;

    if (options.schemaAttribute) {
      const schemaAttribute = options.schemaAttribute;
      this._getSchema = typeof schemaAttribute === 'function' ? schemaAttribute : x => x[schemaAttribute];
    }
  }

  getItemSchema() {
    return this._itemSchema;
  }

  isPolymorphicSchema() {
    return !!this._getSchema;
  }

  getSchemaKey(item) {
    return this._getSchema(item);
  }
}
