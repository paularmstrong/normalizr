/* eslint-env jest */
import { normalize, schema } from '../../';

describe(schema.Object.name, () => {
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
