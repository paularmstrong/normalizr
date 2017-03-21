/* eslint-env jest */
import { denormalize, normalize, schema } from '../';

describe('normalize', () => {
  [ 42, null, undefined, '42', () => {} ].forEach((input) => {
    it(`cannot normalize input that == ${input}`, () => {
      expect(() => normalize(input, new schema.Entity('test'))).toThrow();
    });
  });

  it('cannot normalize without a schema', () => {
    expect(() => normalize({})).toThrow();
  });

  it('normalizes entities', () => {
    const mySchema = new schema.Entity('tacos');

    expect(normalize([ { id: 1, type: 'foo' }, { id: 2, type: 'bar' } ], [ mySchema ])).toMatchSnapshot();
  });

  it('normalizes nested entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: [ comment ]
    });

    const input = {
      id: '123',
      title: 'A Great Article',
      author: {
        id: '8472',
        name: 'Paul'
      },
      body: 'This article is great.',
      comments: [
        {
          id: 'comment-123-4738',
          comment: 'I like it!',
          user: {
            id: '10293',
            name: 'Jane'
          }
        }
      ]
    };
    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('does not modify the original input', () => {
    const user = new schema.Entity('users');
    const article = new schema.Entity('articles', { author: user });
    const input = Object.freeze({
      id: '123',
      title: 'A Great Article',
      author: Object.freeze({
        id: '8472',
        name: 'Paul'
      })
    });
    expect(() => normalize(input, article)).not.toThrow();
  });

  it('ignores null values', () => {
    const myEntity = new schema.Entity('myentities');
    expect(normalize([ null ], [ myEntity ])).toMatchSnapshot();
    expect(normalize([ undefined ], [ myEntity ])).toMatchSnapshot();
    expect(normalize([ false ], [ myEntity ])).toMatchSnapshot();
  });

  it('can use fully custom entity classes', () => {
    class MyEntity extends schema.Entity {
      schema = {
        children: [ new schema.Entity('children') ]
      };

      getId(entity, parent, key) {
        return entity.uuid;
      }

      normalize(input, parent, key, visit, addEntity) {
        const entity = { ...input };
        Object.keys(this.schema).forEach((key) => {
          const schema = this.schema[key];
          entity[key] = visit(input[key], input, key, schema, addEntity);
        });
        addEntity(this, entity, parent, key);
        return {
          uuid: this.getId(entity),
          schema: this.key
        };
      }
    }

    const mySchema = new MyEntity('food');
    expect(normalize({
      uuid: '1234',
      name: 'tacos',
      children: [
        { id: 4, name: 'lettuce' }
      ]
    }, mySchema)).toMatchSnapshot();
  });

  it('uses the non-normalized input when getting the ID for an entity', () => {
    const userEntity = new schema.Entity('users');
    const idAttributeFn = jest.fn((nonNormalized, parent, key) => nonNormalized.user.id);
    const recommendation = new schema.Entity('recommendations', { user: userEntity }, {
      idAttribute: idAttributeFn
    });
    expect(normalize({ user: { id: '456' } }, recommendation)).toMatchSnapshot();
    expect(idAttributeFn.mock.calls).toMatchSnapshot();
    expect(recommendation.idAttribute).toBe(idAttributeFn);
  });

  it('passes over pre-normalized values', () => {
    const userEntity = new schema.Entity('users');
    const articleEntity = new schema.Entity('articles', { author: userEntity });

    expect(normalize({ id: '123', title: 'normalizr is great!', author: 1 }, articleEntity)).toMatchSnapshot();
  });
});

describe('denormalize', () => {
  it('cannot denormalize without a schema', () => {
    expect(() => denormalize({})).toThrow();
  });

  it('returns the input if falsy', () => {
    expect(denormalize(false, {}, {})).toBe(false);
  });

  it('denormalizes entities', () => {
    const mySchema = new schema.Entity('tacos');
    const entities = {
      tacos: {
        1: { id: 1, type: 'foo' },
        2: { id: 2, type: 'bar' }
      }
    };
    expect(denormalize([ 1, 2 ], [ mySchema ], entities)).toMatchSnapshot();
  });

  it('denormalizes nested entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: [ comment ]
    });

    const entities = {
      articles: {
        '123': {
          author: '8472',
          body: 'This article is great.',
          comments: [
            'comment-123-4738'
          ],
          id: '123',
          title: 'A Great Article'
        }
      },
      comments: {
        'comment-123-4738': {
          comment: 'I like it!',
          id: 'comment-123-4738',
          user: '10293'
        }
      },
      users: {
        '10293': {
          id: '10293',
          name: 'Jane'
        },
        '8472': {
          id: '8472',
          name: 'Paul'
        }
      }
    };
    expect(denormalize('123', article, entities)).toMatchSnapshot();
  });

  it('denormalizes arrays of entities normalized using Union schemas)', () => {
    const admin = {
      type: 'admin',
      id: 1,
      name: 'Mr. Admin'
    };
    const visitor = {
      type: 'visitor',
      id: 2,
      name: 'Ms Visitor'
    };
    const adminSchema = new schema.Entity('admin');
    const visitorSchema = new schema.Entity('visitor');
    const userSchema = new schema.Union({
      admin: adminSchema,
      visitor: visitorSchema
    }, 'type');
    const data = [ admin, visitor ];
    const { result, entities } = normalize(data, new schema.Array(userSchema));

    // example when schema for denormalization is created using a javascript array
    const denormalizedData1 = denormalize(result, [ userSchema ], entities);
    // example when schema for denormalization is created using schema.Array constructor
    const denormalizedData2 = denormalize(result, new schema.Array(userSchema), entities);

    expect(denormalizedData1).toEqual(data); // this works
    expect(denormalizedData2).toEqual(data); // this doesn’t work, and fails the test
  });

  it('denormalizes schemas containing array schemas)', () => {
    const adminSchema = new schema.Entity('admin');
    const visitorSchema = new schema.Entity('visitor');
    const userSchema = new schema.Union({
      admin: adminSchema,
      visitor: visitorSchema
    }, 'type');
    const recordSchema1 = new schema.Entity('record');
    const recordSchema2 = new schema.Entity('record');
    recordSchema1.define({
      users: [ userSchema ]
    });
    recordSchema2.define({
      users: new schema.Array(userSchema)
    });
    const admin = {
      type: 'admin',
      id: 1,
      name: 'Mr. Admin'
    };
    const visitor = {
      type: 'visitor',
      id: 2,
      name: 'Ms Visitor'
    };
    const record = {
      id: 1,
      users: [ admin, visitor ]
    };

    const { result: result1, entities: entities1 } = normalize(record, recordSchema1);
    const { result: result2, entities: entities2 } = normalize(record, recordSchema2);

    const denormalizedData1 = denormalize(result1, recordSchema1, entities1);
    expect(denormalizedData1).toEqual(record); // this works

    const denormalizedData2 = denormalize(result2, recordSchema2, entities2);
    expect(denormalizedData2).toEqual(record); // this does not work, and fails the test
  });

  it('does not modify the original entities', () => {
    const user = new schema.Entity('users');
    const article = new schema.Entity('articles', { author: user });
    const entities = Object.freeze({
      articles: Object.freeze({
        '123': Object.freeze({
          id: '123',
          title: 'A Great Article',
          author: '8472'
        })
      }),
      users: Object.freeze({
        '8472': Object.freeze({
          id: '8472',
          name: 'Paul'
        })
      })
    });
    expect(() => denormalize('123', article, entities)).not.toThrow();
  });
});
