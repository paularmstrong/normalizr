/* eslint-env jest */
import { normalize, schema } from '../../src';

describe(schema.Array.name, () => {
  it('normalizes an array of objects', () => {
    const entity = new schema.Entity('item');
    const arraySchema = new schema.Array(entity);
    expect(normalize([ { id: 1 }, { id: 2 } ], arraySchema)).toMatchSnapshot();
  });
});
