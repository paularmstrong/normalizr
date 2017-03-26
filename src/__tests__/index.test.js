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

  it('normalizes polymorphic collections of entities', () => {
    // schemas
    const adminSchema = new schema.Entity('admins');
    const visitorSchema = new schema.Entity('visitors');
    // a polymorphic collection schema
    const usersSchema = new schema.Array({
      admins: adminSchema,
      visitors: visitorSchema
    }, (input) => `${input.type}s`);

    // data
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
    const data = [ admin, visitor ];

    expect(normalize(data, usersSchema)).toMatchSnapshot();
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

  it('denormalizes polymorphic collections of entities', () => {
    // schemas
    const adminSchema = new schema.Entity('admins');
    const visitorSchema = new schema.Entity('visitors');
    // a polymorphic collection schema
    const usersSchema = new schema.Array({
      admins: adminSchema,
      visitors: visitorSchema
    }, (input) => `${input.type}s`);

    // data
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
    const data = [ admin, visitor ];

    const { result, entities } = normalize(data, usersSchema);
    const denormalizedData = denormalize(result, usersSchema, entities);

    expect(denormalizedData).toEqual(data); // this works
  });

  it('denormalizes entities created using nested polymorphic schemas', () => {
    // schemas
    const adminSchema = new schema.Entity('admins');
    const visitorSchema = new schema.Entity('visitors');
    // let’s create a polymorphic collection of schemas
    const usersSchema = new schema.Array({
      admins: adminSchema,
      visitors: visitorSchema
    }, (input) => `${input.type}s`);
    // and let’s nest this polymorpic collection inside another schema
    const recordSchema = new schema.Entity('records');
    recordSchema.define({
      users: usersSchema
    });

    // sample data
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
      users: [ admin, visitor ] // <- polymorphic collection of entities
    };

    // so now let’s test an array of entities created using schemas containing nested polymorphic schemas
    const data = [ record ];

    const { result, entities } = normalize(data, new schema.Array(recordSchema));
    const denormalizedData = denormalize(result, new schema.Array(recordSchema), entities);

    expect(denormalizedData).toEqual(data);
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
