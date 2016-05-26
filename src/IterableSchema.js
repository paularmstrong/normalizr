import isObject from 'lodash/isObject';
import UnionSchema from './UnionSchema';

export default class ArraySchema {
  constructor(itemSchema, options = {}) {
    if (!isObject(itemSchema)) {
      throw new Error('ArraySchema requires item schema to be an object.');
    }

    if (options.schemaAttribute) {
      const schemaAttribute = options.schemaAttribute;
      const polymorphicItem = options.polymorphicItem;
      this._itemSchema = new UnionSchema(itemSchema, { schemaAttribute, polymorphicItem })
    } else {
      this._itemSchema = itemSchema;
    }
  }

  getItemSchema() {
    return this._itemSchema;
  }
}
