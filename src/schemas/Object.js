import * as ImmutableUtils from './ImmutableUtils';

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

export const denormalize = (schema, input, unvisit, getDenormalizedEntity) => {
  let processedObject = ImmutableUtils.isImmutable(input) ? input : { ...input };
  Object.keys(schema).forEach((key) => {
    if (ImmutableUtils.hasIn(processedObject, [ key ])) {
      const localSchema = schema[key];
      const value = ImmutableUtils.getIn(processedObject, [ key ]);
      const denormalizedEntity = unvisit(value, localSchema, getDenormalizedEntity);
      processedObject = ImmutableUtils.setIn(processedObject, [ key ], denormalizedEntity);
    }
  });
  return processedObject;
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
