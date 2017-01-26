/* eslint-env jest */
import { denormalize, normalize, schema } from '../../';

describe(`${schema.Object.name} normalization`, () => {
  it('normalizes an object', () => {
    const userSchema = new schema.Entity('user');
    const object = new schema.Object({
      user: userSchema
    });
    expect(normalize({ user: { id: 1 } }, object)).toMatchSnapshot();
  });

  it(`normalizes plain objects as shorthand for ${schema.Object.name}`, () => {
    const userSchema = new schema.Entity('user');
    expect(normalize({ user: { id: 1 } }, { user: userSchema })).toMatchSnapshot();
  });

  it('filters out undefined and null values', () => {
    const userSchema = new schema.Entity('user');
    const users = { foo: userSchema, bar: userSchema, baz: userSchema };
    expect(normalize({ foo: {}, bar: { id: '1' } }, users)).toMatchSnapshot();
  });
});

describe(`${schema.Object.name} denormalization`, () => {
  it('denormalizes an object', () => {
    const userSchema = new schema.Entity('user');
    const object = new schema.Object({
      user: userSchema
    });
    const entities = {
      user: {
        1: { id: 1, name: 'Nacho' }
      }
    };
    expect(denormalize({ user: 1 }, object, entities)).toMatchSnapshot();
  });

  it('denormalizes plain object shorthand', () => {
    const userSchema = new schema.Entity('user');
    const entities = {
      user: {
        1: { id: 1, name: 'Jane' }
      }
    };
    expect(denormalize({ user: 1 }, { user: userSchema, tacos: {} }, entities)).toMatchSnapshot();
  });

  it('returns null when an entity is not found', () => {
    const userSchema = new schema.Entity('user');
    const entities = {
      user: {
        1: { id: 1, name: 'Jane' }
      }
    };
    expect(denormalize(2, userSchema, entities)).toBeNull();
  });

  it('returns empty object when a nested entity is not found', () => {
    const tribeSchema = new schema.Entity('tribe');
    const userSchema = new schema.Entity('user', {
      tribe: tribeSchema
    });
    const entities = {
      user: {
        1: { id: 1, name: 'Jane', tribe: 'tribeId' }
      },
      tribe: {
        tribeId2: { id: 'tribeId2', name: 'cool tribe' }
      }
    };
    expect(denormalize(1, userSchema, entities)).toBeNull();
  });
});
