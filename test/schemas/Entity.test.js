/* eslint-env jest */
import { normalize, schema } from '../../src';

describe(schema.Entity.name, () => {
  it('must be created with a key name', () => {
    expect(() => new schema.Entity()).toThrow();
  });

  it('key name must be a string', () => {
    expect(() => new schema.Entity(42)).toThrow();
  });

  it('normalizes an entity', () => {
    const entity = new schema.Entity('item');
    expect(normalize({ id: 1 }, entity)).toMatchSnapshot();
  });

  it('can use a custom merging strategy', () => {
    const mergeStrategy = (entityA, entityB) => {
      return { ...entityA, ...entityB, name: entityA.name };
    };
    const mySchema = new schema.Entity('tacos', {}, { mergeStrategy });
    const inputSchema = new schema.Array(mySchema);

    expect(normalize([ { id: 1, name: 'foo' }, { id: 1, name: 'bar', alias: 'bar' } ], inputSchema)).toMatchSnapshot();
  });

  it('can use a custom processing strategy', () => {
    const processStrategy = (entity) => {
      return { ...entity, slug: `thing-${entity.id}` };
    };
    const mySchema = new schema.Entity('tacos', {}, { processStrategy });

    expect(normalize({ id: 1, name: 'foo' }, mySchema)).toMatchSnapshot();
  });

  it('can normalize entity IDs based on their object key', () => {
    const user = new schema.Entity('users', {}, { idAttribute: (entity, parent, key) => key });
    const inputSchema = new schema.Values(user);

    expect(normalize({ 4: { name: 'taco' }, 56: { name: 'burrito' } }, inputSchema)).toMatchSnapshot();
  });

  it('can build the entity\'s ID from the parent object', () => {
    const user = new schema.Entity('users', {}, {
      idAttribute: (entity, parent, key) => `${parent.name}-${entity.id}`
    });
    const inputSchema = new schema.Object({ user });

    expect(normalize({ name: 'tacos', user: { id: '4', name: 'Jimmy' } }, inputSchema)).toMatchSnapshot();
  });
});
