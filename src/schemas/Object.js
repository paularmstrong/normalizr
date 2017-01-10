export const normalize = (schema, input, parent, key, visit, addEntity) => {
  const object = { ...input };
  Object.keys(schema).forEach((key) => {
    const localSchema = schema[key];
    const value = visit(input[key], input, key, localSchema, addEntity);
    if (value === undefined || value === null) {
      delete object[key];
    } else {
      object[key] = value;
    }
  });
  return object;
};

export const denormalize = (schema, input, unvisit, entities) => {
  const object = { ...input };
  Object.keys(schema).forEach((key) => {
    const localSchema = schema[key];
    const value = unvisit(object[key], localSchema, entities);
    if (value) {
      object[key] = value;
    }
  });
  return object;
};

export default class ObjectSchema {
  constructor(definition) {
    this.define(definition);
  }

  define(definition) {
    this.schema = Object.keys(definition).reduce((entitySchema, key) => {
      const schema = definition[key];
      return { ...entitySchema, [key]: schema };
    }, this.schema || {});
  }

  normalize(...args) {
    return normalize(this.schema, ...args);
  }

  denormalize(...args) {
    return denormalize(this.schema, ...args);
  }
}
