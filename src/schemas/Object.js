export default class ObjectSchema {
  constructor(definition = {}, options) {
    this.define(definition);
  }

  define(definition) {
    this.schema = Object.entries(definition).reduce((entitySchema, [ key, schema ]) => {
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  normalize(input, parent, key, addEntity, visit) {
    const object = { ...input };
    Object.entries(this.schema).forEach(([ key, schema ]) => {
      object[key] = visit(input, key, input[key], schema, addEntity);
    });
    return object;
  }
}
