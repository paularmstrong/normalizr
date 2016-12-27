/* eslint-env jest */
import { normalize, schema } from '../../';

describe(schema.Entity.name, () => {
  it('normalizes an entity', () => {
    const entity = new schema.Entity('item');
    expect(normalize({ id: 1 }, entity)).toMatchSnapshot();
  });

  describe('key', () => {
    it('must be created with a key name', () => {
      expect(() => new schema.Entity()).toThrow();
    });

    it('key name must be a string', () => {
      expect(() => new schema.Entity(42)).toThrow();
    });

    it('can use a function to infer the key', () => {
      const inferKey = jest.fn(() => 'tacos');
      const entity = new schema.Entity(inferKey);
      expect(normalize({ foo: { id: '4', name: 'bar' } }, { foo: entity })).toMatchSnapshot();
      expect(inferKey.mock.calls).toMatchSnapshot();
    });
  });

  describe('idAttribute', () => {
    it('can use a custom idAttribute string', () => {
      const user = new schema.Entity('users', {}, { idAttribute: 'id_str' });
      expect(normalize({ id_str: '134351', name: 'Kathy' }, user)).toMatchSnapshot();
    });

    it('can normalize entity IDs based on their object key', () => {
      const user = new schema.Entity('users', {}, { idAttribute: (entity, parent, key) => key });
      const inputSchema = new schema.Values({ users: user }, () => 'users');

      expect(normalize({ 4: { name: 'taco' }, 56: { name: 'burrito' } }, inputSchema)).toMatchSnapshot();
    });

    it('can build the entity\'s ID from the parent object', () => {
      const user = new schema.Entity('users', {}, {
        idAttribute: (entity, parent, key) => `${parent.name}-${key}-${entity.id}`
      });
      const inputSchema = new schema.Object({ user });

      expect(normalize({ name: 'tacos', user: { id: '4', name: 'Jimmy' } }, inputSchema)).toMatchSnapshot();
    });
  });

  describe('mergeStrategy', () => {
    it('defaults to plain merging', () => {
      const mySchema = new schema.Entity('tacos');
      expect(normalize([
        { id: 1, name: 'foo' },
        { id: 1, name: 'bar', alias: 'bar' }
      ], [ mySchema ])).toMatchSnapshot();
    });

    it('can use a custom merging strategy', () => {
      const mergeStrategy = (entityA, entityB) => {
        return { ...entityA, ...entityB, name: entityA.name };
      };
      const mySchema = new schema.Entity('tacos', {}, { mergeStrategy });

      expect(normalize([
        { id: 1, name: 'foo' },
        { id: 1, name: 'bar', alias: 'bar' }
      ], [ mySchema ])).toMatchSnapshot();
    });
  });

  describe('processStrategy', () => {
    it('can use a custom processing strategy', () => {
      const processStrategy = (entity) => {
        return { ...entity, slug: `thing-${entity.id}` };
      };
      const mySchema = new schema.Entity('tacos', {}, { processStrategy });

      expect(normalize({ id: 1, name: 'foo' }, mySchema)).toMatchSnapshot();
    });

    it('can use information from the parent in the process strategy', () => {
      const processStrategy = (entity, parent, key) => {
        return { ...entity, parentId: parent.id, parentKey: key };
      };
      const childEntity = new schema.Entity('children', {}, { processStrategy });
      const parentEntity = new schema.Entity('parents', {
        child: childEntity
      });

      expect(normalize({
        id: 1, content: 'parent', child: { id: 4, content: 'child' }
      }, parentEntity)).toMatchSnapshot();
    });

    it('is run before and passed to the schema normalization', () => {
      const processStrategy = (input) => ({ ...Object.values(input)[0], type: Object.keys(input)[0] });
      const attachmentEntity = new schema.Entity('attachments');
      // If not run before, this schema would require a parent object with key "message"
      const myEntity = new schema.Entity('entries', {
        data: { attachment: attachmentEntity }
      }, { idAttribute: (input) => Object.values(input)[0].id, processStrategy });

      expect(normalize({ message: { id: '123', data: { attachment: { id: '456' } } } }, myEntity)).toMatchSnapshot();
    });
  });
});
