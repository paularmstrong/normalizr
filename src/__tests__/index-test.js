import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import merge from 'lodash/merge';
import { arrayOf, normalize, Schema, unionOf, valuesOf } from '../';

describe('normalizr', () => {
  it('fails creating nameless schema', () => {
    expect(() => { new Schema(); }).toThrow();
  });

  it('fails creating entity with non-string name', () => {
    expect(() => { new Schema(42); }).toThrow();
  });

  it('fails normalizing something other than array or object', () => {
    expect(() => { normalize(42, {}); }).toThrow();
    expect(() => { normalize(null, {}); }).toThrow();
    expect(() => { normalize(undefined, {}); }).toThrow();
    expect(() => { normalize('42', {}); }).toThrow();
  });

  it('fails normalizing without an object schema', () => {
    expect(() => { normalize({}); }).toThrow();
    expect(() => { normalize({}, '42'); }).toThrow();
    expect(() => { normalize({}, []); }).toThrow();
  });

  it('can normalize single entity', () => {
    const article = new Schema('articles');

    const input = {
      id: 1,
      title: 'Some Article',
      isFavorite: false
    };

    Object.freeze(input);

    expect(article.getIdAttribute()).toMatchSnapshot();
    expect(article.getKey()).toMatchSnapshot();
    expect(normalize(input, article)).toMatchSnapshot()
  });

  it('can provide default values for a single entity', () => {
    const article = new Schema('articles', {defaults: {isFavorite: false}});

    const input = {
      id: 1,
      title: 'Some Article'
    };

    Object.freeze(input);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('does not overwrite the default', () => {
    const article = new Schema('articles', {defaults: {isFavorite: false}});

    const input = {
      id: 1
    };

    Object.freeze(input);

    normalize({ id: 2, title: 'foo' }, article);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('can normalize nested entity and delete an existing key using custom function', () => {
    const article = new Schema('articles');
    const type = new Schema('types');

    article.define({
      type: type
    });

    const input = {
      id: 1,
      title: 'Some Article',
      isFavorite: false,
      typeId: 1,
      type: {
        id: 1,
      }
    };

    Object.freeze(input);

    const options = {
      assignEntity: (obj, key, val, originalInput, schema) => {
        obj[key] = val;
        delete obj[key + 'Id'];
      }
    };

    expect(normalize(input, article, options)).toMatchSnapshot();
  });

  it('can update key values based on original input using a custom function', () => {
    const article = new Schema('articles');
    const author = new Schema('authors');

    article.define({
      author: author
    });

    const input = {
      id: '123',
      title: 'My article',
      author: {
        id: '321',
        screenName: 'paul'
      },
      media: [
        {
          id: '1345',
          url: 'https://bit.ly/...'
        }
      ]
    };

    const options = {
      assignEntity: (obj, key, val, originalInput, schema) => {
        if (key === 'media') {
          const screenName = originalInput.author.screenName;
          val = map(val, (media, i) => {
            return merge({}, media, {
              mediaViewUrl: '/' + screenName + '/articles/' + obj.id + '/photos/' + i
            });
          });
        }
        obj[key] = val;
      }
    };

    expect(normalize(input, article, options)).toMatchSnapshot();
  });

  it('can specify meta properties on a schema which are then accessible in assignEntity', () => {
    const article = new Schema('articles', { meta: { removeProps: ['year', 'publisher'] }});
    const author = new Schema('authors', { meta: { removeProps: ['born'] }});

    article.define({
      authors: arrayOf(author)
    });

    const input = {
      id: '123',
      title: 'My article',
      publisher: 'Random',
      year: 2012,
      authors: [{
        id: '321',
        screenName: 'paul',
        born: 1973
      }, {
        id: '678',
        screenName: 'jim',
        born: 1977
      }]
    };

    const options = {
      assignEntity: (obj, key, val, originalInput, schema) => {
        const itemSchema = schema && schema.getItemSchema ? schema.getItemSchema() : schema;
        const removeProps = itemSchema && itemSchema.getMeta && itemSchema.getMeta("removeProps");
        if (!removeProps || removeProps.indexOf(key) < 0)
          obj[key] = val;
      }
    };

    expect(normalize(input, article, options)).toMatchSnapshot();
  });

  it('can use EntitySchema-specific assignEntity function', () => {
    const taco = new Schema('tacos', { assignEntity: (output, key, value, input) => {
      if (key === 'filling') {
        output[key] = 'veggie';
        return;
      }
      output[key] = value;
    }});

    const input = Object.freeze({
      id: '123',
      type: 'hardshell',
      filling: 'beef'
    });

    expect(normalize(input, taco)).toMatchSnapshot();
  });

  it('can use UnionSchema-specific assignEntity function', () => {
    const user = new Schema('users');
    const group = new Schema('groups', { assignEntity: (output, key, value, input) => {
        if (key === 'name') {
          output.url = '/groups/' + value;
        }
        output[key] = value;
      }
    });
    const member = unionOf({ users: user, groups: group }, { schemaAttribute: 'type' });

    group.define({
      members: arrayOf(member),
      owner: member,
      relations: valuesOf(member)
    });

    const input = {
      group: {
        id: 1,
        name: 'facebook',
        members: [{
          id: 2,
          type: 'groups',
          name: 'react'
        }, {
          id: 3,
          type: 'users',
          name: 'Huey'
        }],
        owner: {
          id: 4,
          type: 'users',
          name: 'Jason'
        },
        relations: {
          friend: {
            id: 5,
            type: 'users',
            name: 'Nate'
          }
        }
      }
    };

    Object.freeze(input);

    expect(normalize(input, { group: group })).toMatchSnapshot();
  });

  it('can use Schema-specific assignEntity function in iterables', () => {
    const article = new Schema('articles', {
      assignEntity: (obj, key, val) => {
        if (key === 'collections') {
          obj['collection_ids'] = val;
          if ('collections' in obj) {
            delete obj['collections'];
          }
        } else {
          obj[key] = val;
        }
      }
    });
    const collection = new Schema('collections');

    article.define({
      collections: arrayOf(collection)
    });

    const input = {
      id: 1,
      title: 'Some Article',
      collections: [{
        id: 1,
        title: 'Awesome Writing',
      }, {
        id: 7,
        title: 'Even Awesomer',
      }]
    };

    Object.freeze(input);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('throws if getMeta is called with invalid params', () => {
    const article = new Schema('articles', { meta: { removeProps: ['year', 'publisher'] }});

    expect(() => { article.getMeta(); }).toThrow();
    expect(() => { article.getMeta(''); }).toThrow();
    expect(() => { article.getMeta('missingProp'); }).not.toThrow();
    expect(() => { article.getMeta('removeProps'); }).not.toThrow();
  });

  it('can merge into entity using custom function', () => {
    const author = new Schema('authors');

    const input = {
      author: {
        id: 1,
        name: 'Ada Lovelace',
        contact: {
          phone: '555-0100'
        }
      },
      reviewer: {
        id: 1,
        name: 'Ada Lovelace',
        contact: {
          email: 'ada@lovelace.com'
        }
      }
    }

    Object.freeze(input);

    const options = {
      mergeIntoEntity: (entityA, entityB, entityKey) => {
        for (let key in entityB) {
          if (!entityB.hasOwnProperty(key)) {
            continue;
          }

          if (!entityA.hasOwnProperty(key) || isEqual(entityA[key], entityB[key])) {
            entityA[key] = entityB[key];
            continue;
          }

          if (isObject(entityA[key]) && isObject(entityB[key])) {
            merge(entityA[key], entityB[key])
            continue;
          }

          console.warn('Unequal data!');
        }
      }
    };

    expect(normalize(input, valuesOf(author), options)).toMatchSnapshot();
  });

  it('can normalize single entity with custom id attribute', () => {
    const article = new Schema('articles', { idAttribute: 'slug' });

    const input = {
      id: 1,
      slug: 'some-article',
      title: 'Some Article',
      isFavorite: false
    };

    Object.freeze(input);

    expect(article.getIdAttribute()).toMatchSnapshot();
    expect(article.getKey()).toMatchSnapshot();

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('can normalize single entity with custom id attribute function', () => {
    const makeSlug = (article) => {
      const posted = article.posted;
      const title = article.title.toLowerCase().replace(' ', '-');

      return [title, posted.year, posted.month, posted.day].join('-');
    };

    const article = new Schema('articles', { idAttribute: makeSlug });

    const input = {
      id: 1,
      title: 'Some Article',
      isFavorite: false,
      posted: {
        day: 12,
        month: 3,
        year: 1983
      }
    };

    Object.freeze(input);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('can normalize an array', () => {
    const article = new Schema('articles');

    const input = [{
      id: 1,
      title: 'Some Article'
    }, {
      id: 2,
      title: 'Other Article'
    }];

    Object.freeze(input);

    expect(normalize(input, arrayOf(article))).toMatchSnapshot();
  });

  it('can provide default values for an array', () => {
    const article = new Schema('articles', {defaults: {isFavorite: false}});

    const input = [{
      id: 1,
      title: 'Some Article'
    }, {
      id: 2,
      title: 'Other Article'
    }];

    Object.freeze(input);

    expect(normalize(input, arrayOf(article))).toMatchSnapshot();
  });

  it('can normalize a polymorphic array with schema attribute', () => {
    const article = new Schema('articles');
    const tutorial = new Schema('tutorials');
    const articleOrTutorial = { articles: article, tutorials: tutorial };

    const input = [{
      id: 1,
      type: 'articles',
      title: 'Some Article'
    }, {
      id: 1,
      type: 'tutorials',
      title: 'Some Tutorial'
    }];

    Object.freeze(input);

    expect(normalize(input, arrayOf(articleOrTutorial, { schemaAttribute: 'type' }))).toMatchSnapshot();
  });

  it('can normalize a polymorphic array with schema attribute function', () => {
    const guessSchema = (item) => `${item.type}s`;

    const article = new Schema('articles');
    const tutorial = new Schema('tutorials');
    const articleOrTutorial = { articles: article, tutorials: tutorial };

    const input = [{
      id: 1,
      type: 'article',
      title: 'Some Article'
    }, {
      id: 1,
      type: 'tutorial',
      title: 'Some Tutorial'
    }];

    Object.freeze(input);

    expect(
      normalize(input, arrayOf(articleOrTutorial, { schemaAttribute: guessSchema }))
    ).toMatchSnapshot();
  });

  it('can normalize a map', () => {
    const article = new Schema('articles');

    const input = {
      one: {
        id: 1,
        title: 'Some Article'
      },
      two: {
        id: 2,
        title: 'Other Article'
      }
    };

    Object.freeze(input);

    expect(normalize(input, valuesOf(article))).toMatchSnapshot();
  });

  it('can normalize a polymorphic map with schema attribute', () => {
    const article = new Schema('articles');
    const tutorial = new Schema('tutorials');
    const articleOrTutorial = { articles: article, tutorials: tutorial };

    const input = {
      one: {
        id: 1,
        type: 'articles',
        title: 'Some Article'
      },
      two: {
        id: 2,
        type: 'articles',
        title: 'Another Article'
      },
      three: {
        id: 1,
        type: 'tutorials',
        title: 'Some Tutorial'
      }
    };

    Object.freeze(input);

    expect(normalize(input, valuesOf(articleOrTutorial, { schemaAttribute: 'type' }))).toMatchSnapshot();
  });

  it('can normalize a polymorphic map with schema attribute function', () => {
    const guessSchema = (item) => `${item.type}s`;

    const article = new Schema('articles');
    const tutorial = new Schema('tutorials');
    const articleOrTutorial = { articles: article, tutorials: tutorial };

    const input = {
      one: {
        id: 1,
        type: 'article',
        title: 'Some Article'
      },
      two: {
        id: 2,
        type: 'article',
        title: 'Another Article'
      },
      three: {
        id: 1,
        type: 'tutorial',
        title: 'Some Tutorial'
      }
    };

    Object.freeze(input);

    expect(
      normalize(input, valuesOf(articleOrTutorial, { schemaAttribute: guessSchema }))
    ).toMatchSnapshot();
  });

  it('can normalize nested entity using property from parent', () => {
    const linkablesSchema = new Schema('linkables');
    const mediaSchema = new Schema('media');
    const listsSchema = new Schema('lists');

    const schemaMap = {
      media: mediaSchema,
      lists: listsSchema
    };

    linkablesSchema.define({
      data: (parent) => schemaMap[parent.schema_type]
    });

    const input = {
      id: 1,
      module_type: 'article',
      schema_type: 'media',
      data: {
        id: 2,
        url: 'catimage.jpg'
      }
    };

    Object.freeze(input);

    expect(normalize(input, linkablesSchema)).toMatchSnapshot();
  });

  it('can normalize nested entities', () => {
    const article = new Schema('articles');
    const user = new Schema('users');

    article.define({
      author: user
    });

    const input = {
      id: 1,
      title: 'Some Article',
      author: {
        id: 3,
        name: 'Mike Persson'
      }
    };

    Object.freeze(input);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('can normalize deeply nested entities with arrays', () => {
    const article = new Schema('articles');
    const user = new Schema('users');
    const collection = new Schema('collections');

    article.define({
      author: user,
      collections: arrayOf(collection)
    });

    collection.define({
      curator: user
    });

    const feedSchema = {
      feed: arrayOf(article)
    };

    const input = {
      feed: [{
        id: 1,
        title: 'Some Article',
        author: {
          id: 3,
          name: 'Mike Persson'
        },
        collections: [{
          id: 1,
          title: 'Awesome Writing',
          curator: {
            id: 4,
            name: 'Andy Warhol'
          }
        }, {
          id: 7,
          title: 'Even Awesomer',
          curator: {
            id: 100,
            name: 'T.S. Eliot'
          }
        }]
      }, {
        id: 2,
        title: 'Other Article',
        collections: [{
          id: 2,
          title: 'Neverhood',
          curator: {
            id: 120,
            name: 'Ada Lovelace'
          }
        }],
        author: {
          id: 2,
          name: 'Pete Hunt'
        }
      }]
    };

    Object.freeze(input);

    expect(normalize(input, feedSchema)).toMatchSnapshot();
  });

  it('can normalize deeply nested entities with polymorphic arrays', () => {
    const article = new Schema('articles');
    const tutorial = new Schema('tutorials');
    const articleOrTutorial = { articles: article, tutorials: tutorial };
    const user = new Schema('users');
    const collection = new Schema('collections');

    article.define({
      author: user,
      collections: arrayOf(collection)
    });

    tutorial.define({
      author: user,
      collections: arrayOf(collection)
    });

    collection.define({
      curator: user
    });

    const feedSchema = {
      feed: arrayOf(articleOrTutorial, { schemaAttribute: 'type' })
    };

    const input = {
      feed: [{
        id: 1,
        type: 'articles',
        title: 'Some Article',
        author: {
          id: 3,
          name: 'Mike Persson'
        },
        collections: [{
          id: 1,
          title: 'Awesome Writing',
          curator: {
            id: 4,
            name: 'Andy Warhol'
          }
        }, {
          id: 7,
          title: 'Even Awesomer',
          curator: {
            id: 100,
            name: 'T.S. Eliot'
          }
        }]
      }, {
        id: 1,
        type: 'tutorials',
        title: 'Some Tutorial',
        collections: [{
          id: 2,
          title: 'Neverhood',
          curator: {
            id: 120,
            name: 'Ada Lovelace'
          }
        }],
        author: {
          id: 2,
          name: 'Pete Hunt'
        }
      }]
    };

    Object.freeze(input);

    expect(normalize(input, feedSchema)).toMatchSnapshot();
  });

  it('can normalize deeply nested entities with maps', () => {
    const article = new Schema('articles');
    const user = new Schema('users');

    article.define({
      collaborators: valuesOf(arrayOf(user))
    });

    const feedSchema = {
      feed: arrayOf(article),
      suggestions: valuesOf(arrayOf(article))
    };

    const input = {
      feed: [{
        id: 1,
        title: 'Some Article',
        collaborators: {
          authors: [{
            id: 3,
            name: 'Mike Persson'
          }],
          reviewers: [{
            id: 2,
            name: 'Pete Hunt'
          }]
        }
      }, {
        id: 2,
        title: 'Other Article',
        collaborators: {
          authors: [{
            id: 2,
            name: 'Pete Hunt'
          }]
        }
      }, {
        id: 3,
        title: 'Last Article'
      }],
      suggestions: {
        1: [{
          id: 2,
          title: 'Other Article',
          collaborators: {
            authors: [{
              id: 2,
              name: 'Pete Hunt'
            }]
          }
        }, {
          id: 3,
          title: 'Last Article'
        }]
      }
    };

    Object.freeze(input);

    expect(normalize(input, feedSchema)).toMatchSnapshot();
  });

  it('can normalize deeply nested entities with polymorphic maps', () => {
    const article = new Schema('articles');
    const user = new Schema('users');
    const group = new Schema('groups');
    const userOrGroup = { users: user, groups: group };

    article.define({
      collaborators: valuesOf(userOrGroup, { schemaAttribute: 'type' })
    });

    const feedSchema = {
      feed: arrayOf(article),
      suggestions: valuesOf(arrayOf(article))
    };

    const input = {
      feed: [{
        id: 1,
        title: 'Some Article',
        collaborators: {
          author: {
            id: 3,
            type: 'users',
            name: 'Mike Persson'
          },
          reviewer: {
            id: 2,
            type: 'groups',
            name: 'Reviewer Group'
          }
        }
      }, {
        id: 2,
        title: 'Other Article',
        collaborators: {
          author: {
            id: 2,
            type: 'users',
            name: 'Pete Hunt'
          }
        }
      }, {
        id: 3,
        title: 'Last Article'
      }],
      suggestions: {
        1: [{
          id: 2,
          title: 'Other Article'
        }, {
          id: 3,
          title: 'Last Article'
        }]
      }
    };

    Object.freeze(input);

    expect(normalize(input, feedSchema)).toMatchSnapshot();
  });

  it('can normalize mutually recursive entities', () => {
    const article = new Schema('articles');
    const user = new Schema('users');
    const collection = new Schema('collections');

    user.define({
      articles: arrayOf(article)
    });

    article.define({
      collections: arrayOf(collection)
    });

    collection.define({
      subscribers: arrayOf(user)
    });

    const feedSchema = {
      feed: arrayOf(article)
    };

    const input = {
      feed: [{
        id: 1,
        title: 'Some Article',
        collections: [{
          id: 1,
          title: 'Awesome Writing',
          subscribers: [{
            id: 4,
            name: 'Andy Warhol',
            articles: [{
              id: 1,
              title: 'Some Article'
            }]
          }, {
            id: 100,
            name: 'T.S. Eliot',
            articles: [{
              id: 1,
              title: 'Some Article'
            }]
          }]
        }, {
          id: 7,
          title: 'Even Awesomer',
          subscribers: [{
            id: 100,
            name: 'T.S. Eliot',
            articles: [{
              id: 1,
              title: 'Some Article'
            }]
          }]
        }]
      }]
    };

    Object.freeze(input);

    expect(normalize(input, feedSchema)).toMatchSnapshot();
  });

  it('can normalize self-recursive entities', () => {
    const user = new Schema('users');

    user.define({
      parent: user
    });

    const input = {
      id: 1,
      name: 'Andy Warhol',
      parent: {
        id: 7,
        name: 'Tom Dale',
        parent: {
          id: 4,
          name: 'Pete Hunt'
        }
      }
    };

    Object.freeze(input);

    expect(normalize(input, user)).toMatchSnapshot();
  });

  it('can merge entities', () => {
    const writer = new Schema('writers');
    const book = new Schema('books');
    const schema = arrayOf(writer);

    writer.define({
      books: arrayOf(book)
    });

    const input = [{
      id: 3,
      name: 'Jo Rowling',
      isBritish: true,
      location: {
        x: 100,
        y: 200,
        nested: ['hello', {
          world: true
        }]
      },
      books: [{
        id: 1,
        soldWell: true,
        name: 'Harry Potter'
      }]
    }, {
      id: 3,
      name: 'Jo Rowling',
      bio: 'writer',
      location: {
        x: 100,
        y: 200,
        nested: ['hello', {
          world: true
        }]
      },
      books: [{
        id: 1,
        isAwesome: true,
        name: 'Harry Potter'
      }]
    }];

    expect(normalize(input, schema)).toMatchSnapshot();
  });

  it('warns about inconsistencies when merging entities', () => {
    const writer = new Schema('writers');
    const book = new Schema('books');
    const schema = arrayOf(writer);

    writer.define({
      books: arrayOf(book)
    });

    const input = [{
      id: 3,
      name: 'Jo Rowling',
      books: [{
        id: 1,
        soldWell: true,
        name: 'Harry Potter'
      }]
    }, {
      id: 3,
      name: 'Jo Rowling',
      books: [{
        id: 1,
        soldWell: false,
        name: 'Harry Potter'
      }]
    }];

    console.warn = jest.fn();

    expect(normalize(input, schema)).toMatchSnapshot();

    expect(console.warn).toHaveBeenCalled();
  });

  it('ignores prototype objects and creates new object', () => {
    const schema = new Schema('writers');
    const input = {
      id: 'constructor',
      name: 'Constructor',
      isAwesome: true
    };

    expect(normalize(input, schema)).toMatchSnapshot();
  });

  it('can normalize a polymorphic union field and array and map', () => {
    const user = new Schema('users');
    const group = new Schema('groups');
    const member = unionOf({
      users: user,
      groups: group
    }, { schemaAttribute: 'type' });

    group.define({
      members: arrayOf(member),
      owner: member,
      relations: valuesOf(member)
    });

    const input = {
      group: {
        id: 1,
        name: 'facebook',
        members: [{
          id: 2,
          type: 'groups',
          name: 'react'
        }, {
          id: 3,
          type: 'users',
          name: 'Huey'
        }],
        owner: {
          id: 4,
          type: 'users',
          name: 'Jason'
        },
        relations: {
          friend: {
            id: 5,
            type: 'users',
            name: 'Nate'
          }
        }
      }
    };

    Object.freeze(input);

    expect(normalize(input, { group: group })).toMatchSnapshot();
  });

  it('fails creating union schema without schemaAttribute', () => {
    expect(() => {
      const user = new Schema('users');
      const group = new Schema('groups');
      const member = unionOf({
        users: user,
        groups: group
      });
    }).toThrow();
  });

  it('can normalize iterables keyed with their id', () => {
    const user = new Schema('users', {
      idAttribute: (obj, key) => key
    });

    const input = {
      1: {
        name: 'Adam'
      },
      4: {
        name: 'Jeremy'
      }
    };

    Object.freeze(input);

    expect(normalize(input, valuesOf(user))).toMatchSnapshot();
  });
});
