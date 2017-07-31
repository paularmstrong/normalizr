/* eslint-env jest */
// import { fromJS } from 'immutable';
import { denormalize, normalize, schema } from '../../';

describe(`${schema.Map.name} normalization`, () => {
  it('normalizes the values of an object with the given schema', () => {
    const dog = new schema.Entity('dogs');
    const pets = new schema.Map(dog);

    const pet = [
      { id: 1, name: 'fido' },
      { id: 2, type: 'oliver' }
    ];

    expect(normalize(pet, pets)).toMatchSnapshot();
  });
});

describe(`${schema.Map.name} denormalization`, () => {
  it('denormalizes the values of an object with the given schema', () => {
    const dog = new schema.Entity('dogs');
    const pets = new schema.Map(dog);

    const entities = { dogs: {
      1: { id: 1, name: 'fido' },
      2: { id: 2, type: 'oliver' }
    } };

    expect(denormalize({
      '1': 1,
      '2': 2
    }, pets, entities)).toMatchSnapshot();
  });
});
