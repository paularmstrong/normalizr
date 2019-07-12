// eslint-env jest
import { denormalize, normalize, schema } from '../';

describe('normalize', () => {
  [42, null, undefined, '42', () => {}].forEach((input) => {
    test(`cannot normalize input that == ${input}`, () => {
      expect(() => normalize(input, new schema.Entity('test'))).toThrow();
    });
  });

  test('cannot normalize without a schema', () => {
    expect(() => normalize({})).toThrow();
  });

  test('normalizes entities', () => {
    const mySchema = new schema.Entity('tacos');

    expect(normalize([{ id: 1, type: 'foo' }, { id: 2, type: 'bar' }], [mySchema])).toMatchSnapshot();
  });

  test('normalizes schema with extra members', () => {
    const mySchema = new schema.Entity('tacos');

    expect(
      normalize(
        { data: [{ id: 1, type: 'foo' }, { id: 2, type: 'bar' }], extra: 'five' },
        { data: [mySchema], extra: '' }
      )
    ).toMatchSnapshot();
  });

  test('normalizes entities with circular references', () => {
    const user = new schema.Entity('users');
    user.define({
      friends: [user]
    });

    const input = { id: 123, friends: [] };
    input.friends.push(input);

    expect(normalize(input, user)).toMatchSnapshot();
  });

  test('normalizes nested entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
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

  test('does not modify the original input', () => {
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

  test('ignores null values', () => {
    const myEntity = new schema.Entity('myentities');
    expect(normalize([null], [myEntity])).toMatchSnapshot();
    expect(normalize([undefined], [myEntity])).toMatchSnapshot();
    expect(normalize([false], [myEntity])).toMatchSnapshot();
  });

  test('can use fully custom entity classes', () => {
    class MyEntity extends schema.Entity {
      schema = {
        children: [new schema.Entity('children')]
      };

      getId(entity, parent, key) {
        return entity.uuid;
      }

      normalize(input, parent, key, visit, addEntity, visitedEntities) {
        const entity = { ...input };
        Object.keys(this.schema).forEach((key) => {
          const schema = this.schema[key];
          entity[key] = visit(input[key], input, key, schema, addEntity, visitedEntities);
        });
        addEntity(this, entity, parent, key);
        return {
          uuid: this.getId(entity),
          schema: this.key
        };
      }
    }

    const mySchema = new MyEntity('food');
    expect(
      normalize(
        {
          uuid: '1234',
          name: 'tacos',
          children: [{ id: 4, name: 'lettuce' }]
        },
        mySchema
      )
    ).toMatchSnapshot();
  });

  test('uses the non-normalized input when getting the ID for an entity', () => {
    const userEntity = new schema.Entity('users');
    const idAttributeFn = jest.fn((nonNormalized, parent, key) => nonNormalized.user.id);
    const recommendation = new schema.Entity(
      'recommendations',
      { user: userEntity },
      {
        idAttribute: idAttributeFn
      }
    );
    expect(normalize({ user: { id: '456' } }, recommendation)).toMatchSnapshot();
    expect(idAttributeFn.mock.calls).toMatchSnapshot();
    expect(recommendation.idAttribute).toBe(idAttributeFn);
  });

  test('passes over pre-normalized values', () => {
    const userEntity = new schema.Entity('users');
    const articleEntity = new schema.Entity('articles', { author: userEntity });

    expect(normalize({ id: '123', title: 'normalizr is great!', author: 1 }, articleEntity)).toMatchSnapshot();
  });

  test('can normalize object without proper object prototype inheritance', () => {
    const test = { id: 1, elements: [] };
    test.elements.push(
      Object.assign(Object.create(null), {
        id: 18,
        name: 'test'
      })
    );

    const testEntity = new schema.Entity('test', {
      elements: [new schema.Entity('elements')]
    });

    expect(() => normalize(test, testEntity)).not.toThrow();
  });
});

describe('denormalize', () => {
  test('cannot denormalize without a schema', () => {
    expect(() => denormalize({})).toThrow();
  });

  test('returns the input if undefined', () => {
    expect(denormalize(undefined, {}, {})).toBeUndefined();
  });

  test('denormalizes entities', () => {
    const mySchema = new schema.Entity('tacos');
    const entities = {
      tacos: {
        1: { id: 1, type: 'foo' },
        2: { id: 2, type: 'bar' }
      }
    };
    expect(denormalize([1, 2], [mySchema], entities)).toMatchSnapshot();
  });

  test('denormalizes schema with extra members', () => {
    const mySchema = new schema.Entity('tacos');
    const entities = {
      tacos: {
        1: { id: 1, type: 'foo' },
        2: { id: 2, type: 'bar' }
      }
    };
    expect(denormalize({ data: [1, 2], extra: '5' }, { data: [mySchema], extra: '' }, entities)).toMatchSnapshot();
  });

  test('denormalizes nested entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    });

    const entities = {
      articles: {
        '123': {
          author: '8472',
          body: 'This article is great.',
          comments: ['comment-123-4738'],
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

  test('set to undefined if schema key is not in entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    });

    const entities = {
      articles: {
        '123': {
          id: '123',
          author: '8472',
          comments: ['1']
        }
      },
      comments: {
        '1': {
          user: '123'
        }
      }
    };
    expect(denormalize('123', article, entities)).toMatchSnapshot();
  });

  test('does not modify the original entities', () => {
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

  test('denormalizes with function as idAttribute', () => {
    const normalizedData = {
      entities: {
        patrons: {
          '1': { id: '1', guest: null, name: 'Esther' },
          '2': { id: '2', guest: 'guest-2-1', name: 'Tom' }
        },
        guests: { 'guest-2-1': { guest_id: 1 } }
      },
      result: ['1', '2']
    };

    const guestSchema = new schema.Entity(
      'guests',
      {},
      {
        idAttribute: (value, parent, key) => `${key}-${parent.id}-${value.guest_id}`
      }
    );

    const patronsSchema = new schema.Entity('patrons', {
      guest: guestSchema
    });

    expect(denormalize(normalizedData.result, [patronsSchema], normalizedData.entities)).toMatchSnapshot();
  });
});
