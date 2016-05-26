import isObject from 'lodash/isObject';

export default class UnionSchema {
  constructor(itemSchema, options) {
    if (!isObject(itemSchema)) {
      throw new Error('UnionSchema requires item schema to be an object.');
    }

    if (!options || !options.schemaAttribute) {
      throw new Error('UnionSchema requires schemaAttribute option.');
    }

    this._itemSchema = itemSchema;

    const schemaAttribute = options.schemaAttribute;
    this._getSchema = typeof schemaAttribute === 'function' ? schemaAttribute : x => x[schemaAttribute];

    function defaultPolymorphicItem(item) {
      return { schema: this._getSchema(item) };
    }

    this._getSchemaKeys = options.polymorphicItem || defaultPolymorphicItem;
  }

  getItemSchema() {
    return this._itemSchema;
  }

  getSchemaKey(item) {
    return this._getSchema(item);
  }

  getSchemaKeys(item) {
    return this._getSchemaKeys(item);
  }
}
