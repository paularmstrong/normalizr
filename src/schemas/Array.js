import PolymorphicSchema from './Polymorphic';

const validateSchema = (definition) => {
  const isArray = Array.isArray(definition);
  if (isArray && definition.length > 1) {
    throw new Error(`Expected schema definition to be a single schema, but found ${definition.length}.`);
  }

  return definition[0];
};

const getValues = (input) => (Array.isArray(input) ? input : Object.keys(input).map((key) => input[key]));

export const normalize = (schema, input, parent, key, visit, addEntity, visitedEntities) => {
  schema = validateSchema(schema);

  const values = getValues(input);

  // Special case: Arrays pass *their* parent on to their children, since there
  // is not any special information that can be gathered from themselves directly
  return values.map((value, index) => visit(value, parent, key, schema, addEntity, visitedEntities));
};

export const denormalize = (schema, input, unvisit) => {
  schema = validateSchema(schema);
  return input && input.map ? input.map((entityOrId) => unvisit(entityOrId, schema)) : input;
};

export default class ArraySchema extends PolymorphicSchema {
  normalize(input, parent, key, visit, addEntity, visitedEntities) {
    const values = getValues(input);

    return values
      .map((value, index) => this.normalizeValue(value, parent, key, visit, addEntity, visitedEntities))
      .filter((value) => value !== undefined && value !== null);
  }

  denormalize(input, unvisit) {
    return input && input.map ? input.map((value) => this.denormalizeValue(value, unvisit)) : input;
  }
}
