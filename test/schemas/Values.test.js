/* eslint-env jest */
import { normalize, schema } from '../../src';

describe(schema.Values.name, () => {
  it('normalizes the values of an object with the given schema', () => {
    const entity = new schema.Entity('item');
    const valuesSchema = new schema.Values(entity);
    expect(normalize({ asdf: { id: 1 }, fdsa: { id: 2 } }, valuesSchema)).toMatchSnapshot();
  });
});
