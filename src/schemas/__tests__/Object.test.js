// eslint-env jest
import { fromJS } from 'immutable';
import { denormalize, schema } from '../..';

describe(`${schema.Object.name} denormalization`, () => {
  test('denormalizes plain object shorthand with missing schemas', () => {
    const userSchema = new schema.Entity('user');
    const entities = {
      user: {
        1: { id: 1, name: 'Jane' },
      },
    };
    expect(denormalize({ user: 1 }, { user: userSchema, tacos: {} }, entities)).toMatchSnapshot();
    expect(denormalize({ user: 1 }, { user: userSchema, tacos: {} }, fromJS(entities))).toMatchSnapshot();
    expect(denormalize(fromJS({ user: 1 }), { user: userSchema, tacos: {} }, fromJS(entities))).toMatchSnapshot();
  });
});
