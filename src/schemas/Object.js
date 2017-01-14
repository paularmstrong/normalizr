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

const denormalizeItem = (id, schema, unvisit, entities, visitedEntities) => {
  if (!visitedEntities[schema.key]) {
    visitedEntities[schema.key] = {};
  }

  if (!visitedEntities[schema.key][id]) {
    visitedEntities[schema.key][id] = { ...entities[schema.key][id] };
    visitedEntities[schema.key][id] = unvisit(id, schema, entities, visitedEntities);
  }

  return visitedEntities[schema.key][id];
};

export const denormalize = (schema, input, unvisit, entities, visitedEntities) => {
  const object = { ...input };
  Object.keys(schema).forEach((key) => {
    if (object[key]) {
      if (Array.isArray(object[key])) {
        object[key] = unvisit(object[key], schema[key], entities, visitedEntities);
      } else {
        object[key] = denormalizeItem(object[key], schema[key], unvisit, entities, visitedEntities);
      }
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
