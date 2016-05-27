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

    this._getPolymorphic = options.polymorphic || ( () => ({}) );
  }

  getItemSchema() {
    return this._itemSchema;
  }

  getSchemaKey(item) {
    return this._getSchema(item);
  }

  getPolymorphic(item) {
    return this._getPolymorphic(item);
  }
}
