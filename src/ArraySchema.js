import isObject from 'lodash/lang/isObject';

export default class ArraySchema {
  constructor(itemSchema) {
    if (!isObject(itemSchema)) {
      throw new Error('ArraySchema requires item schema to be an object.');
    }

    this._itemSchema = itemSchema;
  }

  getItemSchema() {
    return this._itemSchema;
  }
}
