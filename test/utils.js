'use strict';

var should = require('chai').should(),
    utils = require('../src/utils'),
    isEqual = utils.isEqual;

describe('isEqual', function() {
  let value, other;

  describe ('two numbers', function(){
    it('returns true for equal numbers', function(){
      isEqual(8, 8).should.equal(true);
    });

    it('returns false for different numbers', function(){
      isEqual(8, 64).should.equal(false);
    });
  });

  describe ('one number, one object', function(){
    it('returns false', function(){
      isEqual(8, {}).should.equal(false);
      isEqual({}, 16).should.equal(false);
    });
  });

  describe ('one function, one object', function(){
    it('returns false', function(){
      value = function(){};
      other = { key: undefined };
      isEqual(value, other).should.equal(false);
    });
  });

  describe ('null and undefined', function(){
    it('returns false', function(){
      isEqual(null, undefined).should.equal(false);
    });
  });

  describe('two object trees, one level deep', function(){
    it('returns true for objects with the same key/value pairs', function(){
      value = { one: 1 };
      other = { one: 1 };
      isEqual(value, other).should.equal(true);

      value = { one: 1, fib: [0, 1, 1, 2, 3, 5, 8] };
      other = { one: 1, fib: [0, 1, 1, 2, 3, 5, 8] };
      isEqual(value, other).should.equal(true);

      value = { one: null };
      other = { one: null };
      isEqual(value, other).should.equal(true);
    });

    it('returns false for objects with different key/value pairs', function(){
      value = { one: 1 };
      other = { two: 1 };
      isEqual(value, other).should.equal(false);

      value = { one: 1 };
      other = { one: 1, two: 2 };
      isEqual(value, other).should.equal(false);
    });
  });

  describe('two object trees, nested levels', function(){
    it('returns true for deeply equal objects', function(){
      value = {
        'nested1': {
          'nested11': 'n',
          'nested12': 12,
          'nested13': [
            '131',
            '132',
            {
              'nested13_0': 130
            }
          ]
        },
        'nested2': {
        }
      }, other = {
        'nested1': {
          'nested11': 'n',
          'nested12': 12,
          'nested13': [
            '131',
            '132',
            {
              'nested13_0': 130
            }
          ]
        },
        'nested2': {
        }
      };
      isEqual(value, other).should.equal(true);

      value = {
        'nested1': [
          1,
          1
        ],
        'nested2': [
          {
            'nested2_0': 1
          }
        ]
      }, other = {
        'nested1': [
          1,
          1
        ],
        'nested2': [
          {
            'nested2_0': 1
          }
        ]
      };
      isEqual(value, other).should.equal(true);
    });

    it('returns false for objects with the slightest difference', function(){
      value = {
        'nested1': {
          'nested11': 'n',
          'nested12': 12,
          'nested13': [
            '131',
            '132',
            {
              'nested13_0': 130
            }
          ]
        },
        'nested2': {
        }
      }, other = {
        'nested1': {
          'nested11': 'n',
          'nested12': 12,
          'nested13': [
            '131',
            '132',
            {
              'nested13_0': 131
            }
          ]
        },
        'nested2': {
        }
      };
      isEqual(value, other).should.equal(false);
    });

    it('returns true for objects with circular references', function(){
      value = {
        'nested1': {
          'nested13': [
            '131',
            {
              'nested13_0': 130
            }
          ]
        },
      }, other = {
        'nested1': {
          'nested13': [
            '131',
            {
              'nested13_0': 130
            }
          ]
        },
      };
      value.nested1.nested14 = value;
      other.nested1.nested14 = value;
      isEqual(value, other).should.equal(true);
    });

    it('detects circular references and returns false before falling in an infinite loop', function(){
      value = {
        'nested1': {
          'nested13': [
            '131',
            {
              'nested13_0': 130
            }
          ]
        },
      }, other = {
        'nested1': {
          'nested13': [
            '131',
            {
              'nested13_0': 130
            }
          ]
        },
      };
      value.nested1.nested14 = value;
      other.nested1.nested14 = other;
      isEqual(value, other).should.equal(false);
    });
  });
});
