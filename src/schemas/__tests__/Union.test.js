/* eslint-env jest */
import { denormalize, normalize, schema } from '../../';

describe(`${schema.Union.name} normalization`, () => {
  it('throws if not given a schemaAttribute', () => {
    expect(() => new schema.Union({})).toThrow();
  });

  it('normalizes an object using string schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      users: user,
      groups: group
    }, 'type');

    expect(normalize({ id: 1, type: 'users' }, union)).toMatchSnapshot();
    expect(normalize({ id: 2, type: 'groups' }, union)).toMatchSnapshot();
  });

  it('normalizes an array of multiple entities using a function to infer the schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      users: user,
      groups: group
    }, (input) => { return input.username ? 'users' : input.groupname ? 'groups' : null; });

    expect(normalize({ id: 1, username: 'Janey' }, union)).toMatchSnapshot();
    expect(normalize({ id: 2, groupname: 'People' }, union)).toMatchSnapshot();
    expect(normalize({ id: 3, notdefined: 'yep' }, union)).toMatchSnapshot();
  });
});

describe(`${schema.Union.name} denormalization`, () => {
  const user = new schema.Entity('users');
  const group = new schema.Entity('groups');
  const entities = {
    users: {
      1: { id: 1, username: 'Janey', type: 'users' }
    },
    groups: {
      2: { id: 2, groupname: 'People', type: 'groups' }
    }
  };

  it('denormalizes an object using string schemaAttribute', () => {
    const union = new schema.Union({
      users: user,
      groups: group
    }, 'type');

    expect(denormalize({ id: 1, schema: 'users' }, union, entities)).toMatchSnapshot();
    expect(denormalize({ id: 2, schema: 'groups' }, union, entities)).toMatchSnapshot();
  });

  it('denormalizes an array of multiple entities using a function to infer the schemaAttribute', () => {
    const union = new schema.Union({
      users: user,
      groups: group
    }, (input) => { return input.username ? 'users' : 'groups'; });

    expect(denormalize({ id: 1, schema: 'users' }, union, entities)).toMatchSnapshot();
    expect(denormalize({ id: 2, schema: 'groups' }, union, entities)).toMatchSnapshot();
  });

  it('returns the original value no schema is given', () => {
    const union = new schema.Union({
      users: user,
      groups: group
    }, (input) => { return input.username ? 'users' : 'groups'; });

    expect(denormalize({ id: 1 }, union, entities)).toMatchSnapshot();
  });
});
