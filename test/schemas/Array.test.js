/* eslint-env jest */
import { normalize, schema } from '../../src';

describe(schema.Array.name, () => {
  it('normalizes an array of objects', () => {
    const entity = new schema.Entity('item');
    const arraySchema = new schema.Array(entity);
    expect(normalize([ { id: 1 }, { id: 2 } ], arraySchema)).toMatchSnapshot();
  });

  it(`auto-converts plain arrays to ${schema.Array.name}`, () => {
    const userSchema = new schema.Entity('user');
    expect(normalize([ { id: 1 }, { id: 2 } ], [ userSchema ])).toMatchSnapshot();
  });

  it('throws an error if created with more than one schema', () => {
    const userSchema = new schema.Entity('users');
    const catSchema = new schema.Entity('cats');
    expect(() => normalize([ { id: 1 } ], [ catSchema, userSchema ])).toThrow();
    expect(() => normalize([ { id: 1 } ], new schema.Array([ catSchema, userSchema ]))).toThrow();
  });
});
