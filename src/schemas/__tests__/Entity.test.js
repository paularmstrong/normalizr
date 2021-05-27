// eslint-env jest
import { schema } from '../..';

describe(`${schema.Entity.name} normalization`, () => {
  describe('key', () => {
    test('must be created with a key name', () => {
      expect(() => new schema.Entity()).toThrow();
    });

    test('key name must be a string', () => {
      expect(() => new schema.Entity(42)).toThrow();
    });
  });
});
