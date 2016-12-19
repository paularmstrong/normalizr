/* eslint-env jest */
import { normalize, schema } from '../../src';

describe(schema.Union.name, () => {
  it('normalizes an array of multiple entities using string schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      user: user,
      group: group
    }, { schemaAttribute: 'type' });

    expect(normalize([ { id: 1, type: 'user' }, { id: 2, type: 'group' } ], union)).toMatchSnapshot();
  });

  it('normalizes an array of multiple entities using a function to infer the schemaAttribute', () => {
    const user = new schema.Entity('users');
    const group = new schema.Entity('groups');
    const union = new schema.Union({
      user: user,
      group: group
    }, { schemaAttribute: (input) => { return input.username ? 'user' : 'group'; } });

    expect(normalize([ { id: 1, username: 'Janey' }, { id: 2, groupname: 'People' } ], union)).toMatchSnapshot();
  });
});
