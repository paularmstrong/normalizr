/* eslint-env jest */
import { normalize, schema } from '../../';

describe(schema.Union.name, () => {
  it('normalizes an array of multiple entities using string schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      users: user,
      groups: group
    }, 'type');

    expect(normalize([ { id: 1, type: 'users' }, { id: 2, type: 'groups' } ], union)).toMatchSnapshot();
  });

  it('normalizes an array of multiple entities using a function to infer the schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      users: user,
      groups: group
    }, (input) => { return input.username ? 'users' : 'groups'; });

    expect(normalize([ { id: 1, username: 'Janey' }, { id: 2, groupname: 'People' } ], union)).toMatchSnapshot();
  });
});
