/* eslint-env jest */
import { normalize, schema } from '../src';

describe('normalize', () => {
  it('normalizes entities', () => {
    const mySchema = new schema.Entity('tacos');
    const inputSchema = new schema.Array(mySchema);

    expect(normalize([ { id: 1, type: 'foo' }, { id: 2, type: 'bar' } ], inputSchema)).toMatchSnapshot();
  });

  it('normalizes nested entities', () => {
    const user = new schema.Entity('users');
    const comment = new schema.Entity('comments', {
      user: user
    });
    const article = new schema.Entity('articles', {
      author: user,
      comments: new schema.Array(comment)
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
});
