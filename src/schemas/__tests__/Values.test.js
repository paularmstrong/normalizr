/* eslint-env jest */
import { denormalize, normalize, schema } from '../../';

describe(`${schema.Values.name} normalization`, () => {
  it('normalizes the values of an object with the given schema', () => {
    const cat = new schema.Entity('cats');
    const dog = new schema.Entity('dogs');
    const valuesSchema = new schema.Values({
      dogs: dog,
      cats: cat
    }, (entity, key) => entity.type);

    expect(normalize({
      fido: { id: 1, type: 'dogs' },
      fluffy: { id: 1, type: 'cats' }
    }, valuesSchema)).toMatchSnapshot();
  });

  it('can use a function to determine the schema when normalizing', () => {
    const cat = new schema.Entity('cats');
    const dog = new schema.Entity('dogs');
    const valuesSchema = new schema.Values({
      dogs: dog,
      cats: cat
    }, (entity, key) => `${entity.type}s`);

    expect(normalize({
      fido: { id: 1, type: 'dog' },
      fluffy: { id: 1, type: 'cat' },
      jim: { id: 2, type: 'lizard' }
    }, valuesSchema)).toMatchSnapshot();
  });

  it('filters out null and undefined values', () => {
    const cat = new schema.Entity('cats');
    const dog = new schema.Entity('dogs');
    const valuesSchema = new schema.Values({
      dogs: dog,
      cats: cat
    }, (entity, key) => entity.type);

    expect(normalize({
      fido: undefined,
      milo: null,
      fluffy: { id: 1, type: 'cats' }
    }, valuesSchema)).toMatchSnapshot();
  });
});

describe(`${schema.Values.name} denormalization`, () => {
  it('denormalizes the values of an object with the given schema', () => {
    const cat = new schema.Entity('cats');
    const dog = new schema.Entity('dogs');
    const valuesSchema = new schema.Values({
      dogs: dog,
      cats: cat
    }, (entity, key) => entity.type);

    const entities = {
      cats: { 1: { id: 1, type: 'cats' } },
      dogs: { 1: { id: 1, type: 'dogs' } }
    };

    expect(denormalize({
      fido: { id: 1, schema: 'dogs' },
      fluffy: { id: 1, schema: 'cats' }
    }, valuesSchema, entities)).toMatchSnapshot();
  });
});
