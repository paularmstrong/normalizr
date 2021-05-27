// eslint-env jest
import { fromJS } from 'immutable';
import { denormalize, schema } from '../..';

describe(`${schema.Array.name} denormalization`, () => {
  describe('Class', () => {
    test('denormalizes multiple entities with mismatched structures', () => {
      const catSchema = new schema.Entity('cats');
      const peopleSchema = new schema.Entity('person');
      const listSchema = new schema.Array(
        {
          cats: catSchema,
          dogs: {},
          people: peopleSchema,
        },
        (input, parent, key) => input.type || 'dogs'
      );

      const entities = {
        cats: {
          123: {
            id: '123',
            type: 'cats',
          },
          456: {
            id: '456',
            type: 'cats',
          },
        },
        person: {
          123: {
            id: '123',
            type: 'people',
          },
        },
      };

      const input = [
        { id: '123', schema: 'cats' },
        { id: '123', schema: 'people' },
        { id: { id: '789' }, schema: 'dogs' },
        { id: '456', schema: 'cats' },
      ];

      expect(denormalize(input, listSchema, entities)).toMatchSnapshot();
      expect(denormalize(input, listSchema, fromJS(entities))).toMatchSnapshot();
    });
  });
});
