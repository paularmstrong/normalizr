/* eslint-env jest */
import { normalize, schema } from '../../';

describe(schema.Union.name, () => {
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
