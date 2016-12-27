/* eslint-env jest */
import { normalize, schema } from '../../';

describe(schema.Array.name, () => {
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
        dogs: {},
        people: peopleSchema
      }, inferSchemaFn);

      expect(normalize([
        { type: 'cats', id: '123' },
        { type: 'people', id: '123' },
        { id: '789' },
        { type: 'cats', id: '456' }
      ], listSchema)).toMatchSnapshot();
      expect(inferSchemaFn.mock.calls).toMatchSnapshot();
    });

    it('normalizes Objects using their values', () => {
      const userSchema = new schema.Entity('user');
      const users = new schema.Array(userSchema);
      expect(normalize({ foo: { id: 1 }, bar: { id: 2 } }, users)).toMatchSnapshot();
    });
  });
});
