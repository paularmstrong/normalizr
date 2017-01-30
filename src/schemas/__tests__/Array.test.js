/* eslint-env jest */
import { denormalize, normalize, schema } from '../../';

describe(`${schema.Array.name} normalization`, () => {
  describe('Object', () => {
    it(`normalizes plain arrays as shorthand for ${schema.Array.name}`, () => {
      const userSchema = new schema.Entity('user');
      expect(normalize([ { id: 1 }, { id: 2 } ], [ userSchema ])).toMatchSnapshot();
    });

    it('throws an error if created with more than one schema', () => {
      const userSchema = new schema.Entity('users');
      const catSchema = new schema.Entity('cats');
      expect(() => normalize([ { id: 1 } ], [ catSchema, userSchema ])).toThrow();
    });

    it('passes its parent to its children when normalizing', () => {
      const processStrategy = (entity, parent, key) => {
        return { ...entity, parentId: parent.id, parentKey: key };
      };
      const childEntity = new schema.Entity('children', {}, { processStrategy });
      const parentEntity = new schema.Entity('parents', {
        children: [ childEntity ]
      });

      expect(normalize({
        id: 1, content: 'parent', children: [ { id: 4, content: 'child' } ]
      }, parentEntity)).toMatchSnapshot();
    });

    it('normalizes Objects using their values', () => {
      const userSchema = new schema.Entity('user');
      expect(normalize({ foo: { id: 1 }, bar: { id: 2 } }, [ userSchema ])).toMatchSnapshot();
    });
  });

  describe('Class', () => {
    it('normalizes a single entity', () => {
      const cats = new schema.Entity('cats');
      const listSchema = new schema.Array(cats);
      expect(normalize([ { id: 1 }, { id: 2 } ], listSchema)).toMatchSnapshot();
    });

    it('normalizes multiple entities', () => {
      const inferSchemaFn = jest.fn((input, parent, key) => input.type || 'dogs');
      const catSchema = new schema.Entity('cats');
      const peopleSchema = new schema.Entity('person');
      const listSchema = new schema.Array({
        cats: catSchema,
        people: peopleSchema
      }, inferSchemaFn);

      expect(normalize([
        { type: 'cats', id: '123' },
        { type: 'people', id: '123' },
        { id: '789', name: 'fido' },
        { type: 'cats', id: '456' }
      ], listSchema)).toMatchSnapshot();
      expect(inferSchemaFn.mock.calls).toMatchSnapshot();
    });

    it('normalizes Objects using their values', () => {
      const userSchema = new schema.Entity('user');
      const users = new schema.Array(userSchema);
      expect(normalize({ foo: { id: 1 }, bar: { id: 2 } }, users)).toMatchSnapshot();
    });

    it('filters out undefined and null normalized values', () => {
      const userSchema = new schema.Entity('user');
      const users = new schema.Array(userSchema);
      expect(normalize([ undefined, { id: 123 }, null ], users)).toMatchSnapshot();
    });
  });
});

describe(`${schema.Array.name} denormalization`, () => {
  describe('Object', () => {
    it('denormalizes a single entity', () => {
      const cats = new schema.Entity('cats');
      const entities = {
        cats: {
          1: { id: 1, name: 'Milo' },
          2: { id: 2, name: 'Jake' }
        }
      };
      expect(denormalize([ 1, 2 ], [ cats ], entities)).toMatchSnapshot();
    });

    it('returns the input value if is not an array', () => {
      const filling = new schema.Entity('fillings');
      const taco = new schema.Entity('tacos', { fillings: [ filling ] });
      const entities = {
        tacos: {
          '123': {
            id: '123',
            fillings: null
          }
        }
      };

      expect(denormalize('123', taco, entities)).toMatchSnapshot();
    });
  });

  describe('Class', () => {
    it('denormalizes a single entity', () => {
      const cats = new schema.Entity('cats');
      const entities = {
        cats: {
          1: { id: 1, name: 'Milo' },
          2: { id: 2, name: 'Jake' }
        }
      };
      const catList = new schema.Array(cats);
      expect(denormalize([ 1, 2 ], catList, entities)).toMatchSnapshot();
    });

    it('denormalizes multiple entities', () => {
      const catSchema = new schema.Entity('cats');
      const peopleSchema = new schema.Entity('person');
      const listSchema = new schema.Array({
        cats: catSchema,
        dogs: {},
        people: peopleSchema
      }, (input, parent, key) => input.type || 'dogs');

      const entities = {
        cats: {
          '123': {
            id: '123',
            type: 'cats'
          },
          '456': {
            id: '456',
            type: 'cats'
          }
        },
        person: {
          '123': {
            id: '123',
            type: 'people'
          }
        }
      };

      const input = [
        { id: '123', schema: 'cats' },
        { id: '123', schema: 'people' },
        { id: { id: '789' }, schema: 'dogs' },
        { id: '456', schema: 'cats' }
      ];

      expect(denormalize(input, listSchema, entities)).toMatchSnapshot();
    });

    it('returns the input value if is not an array', () => {
      const filling = new schema.Entity('fillings');
      const fillings = new schema.Array(filling);
      const taco = new schema.Entity('tacos', { fillings });
      const entities = {
        tacos: {
          '123': {
            id: '123',
            fillings: null
          }
        }
      };

      expect(denormalize('123', taco, entities)).toMatchSnapshot();
    });
  });
});
