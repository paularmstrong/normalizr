import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import map from 'lodash/map';
import merge from 'lodash/merge';
import { arrayOf, normalize, Schema, unionOf, valuesOf } from '../';

describe('normalizr', () => {
  it('fails creating nameless schema', () => {
    expect(function () {
      new Schema();
    }).toThrow();
  });

  it('fails creating entity with non-string name', () => {
    expect(function () {
      new Schema(42);
    }).toThrow();
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
    var article = new Schema('articles'),
        input;

    input = {
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
    var article = new Schema('articles', {defaults: {isFavorite: false}}),
      input;

    input = {
      id: 1,
      title: 'Some Article'
    };

    Object.freeze(input);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('does not overwrite the default', () => {
    var article = new Schema('articles', {defaults: {isFavorite: false}}),
      input;

    input = {
      id: 1
    };

    Object.freeze(input);

    normalize({ id: 2, title: 'foo' }, article);

    expect(normalize(input, article)).toMatchSnapshot();
  });

  it('can normalize nested entity and delete an existing key using custom function', () => {
    var article = new Schema('articles'),
        type = new Schema('types'),
        input;

    article.define({
      type: type
    });

    input = {
      id: 1,
      title: 'Some Article',
      isFavorite: false,
      typeId: 1,
      type: {
        id: 1,
      }
    };

    Object.freeze(input);

    var options = {
      assignEntity: function(obj, key, val, originalInput, schema) {
        obj[key] = val;
        delete obj[key + 'Id'];
      }
    };

    expect(normalize(input, article, options)).toMatchSnapshot();
  });

  it('can update key values based on original input using a custom function', () => {
    var article = new Schema('articles'),
        author = new Schema('authors'),
        input;

    article.define({
      author: author
    });

    input = {
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

    var options = {
      assignEntity: function (obj, key, val, originalInput, schema) {
        if (key === 'media') {
          var screenName = originalInput.author.screenName;
          val = map(val, function (media, i) {
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
    var article = new Schema('articles', { meta: { removeProps: ['year', 'publisher'] }}),
        author = new Schema('authors', { meta: { removeProps: ['born'] }}),
        input;

    article.define({
      authors: arrayOf(author)
    });

    input = {
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

    var options = {
      assignEntity: function (obj, key, val, originalInput, schema) {
        var itemSchema = schema && schema.getItemSchema ? schema.getItemSchema() : schema;
        var removeProps = itemSchema && itemSchema.getMeta && itemSchema.getMeta("removeProps");
        if (!removeProps || removeProps.indexOf(key) < 0)
          obj[key] = val;
      }
    };

    expect(normalize(input, article, options)).toMatchSnapshot();
  });

  it('can use EntitySchema-specific assignEntity function', () => {
    var taco = new Schema('tacos', { assignEntity: function (output, key, value, input) {
      if (key === 'filling') {
        output[key] = 'veggie';
        return;
      }
      output[key] = value;
    }});

    var input = Object.freeze({
      id: '123',
      type: 'hardshell',
      filling: 'beef'
    });

    expect(normalize(input, taco)).toMatchSnapshot();
  });

  it('can use UnionSchema-specific assignEntity function', () => {
    var user = new Schema('users'),
        group = new Schema('groups', { assignEntity: function (output, key, value, input) {
            if (key === 'name') {
              output.url = '/groups/' + value;
            }
            output[key] = value;
          }
        }),
        member = unionOf({ users: user, groups: group }, { schemaAttribute: 'type' }),
        input;

    group.define({
      members: arrayOf(member),
      owner: member,
      relations: valuesOf(member)
    });

    input = {
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
    var article = new Schema('articles', {
        assignEntity: function(obj, key, val) {
          if (key === 'collections') {
            obj['collection_ids'] = val;
            if ('collections' in obj) {
              delete obj['collections'];
            }
          } else {
            obj[key] = val;
          }
        }
      }),
      collection = new Schema('collections'),
      input;

    article.define({
      collections: arrayOf(collection)
    });

    input = {
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
    var article = new Schema('articles', { meta: { removeProps: ['year', 'publisher'] }});

    expect(() => { article.getMeta(); }).toThrow();
    expect(() => { article.getMeta(''); }).toThrow();
    expect(() => { article.getMeta('missingProp'); }).not.toThrow();
    expect(() => { article.getMeta('removeProps'); }).not.toThrow();
  });

  it('can merge into entity using custom function', () => {
    var author = new Schema('authors'),
        input;

    input = {
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

    var options = {
      mergeIntoEntity: function(entityA, entityB, entityKey) {
        var key;

        for (key in entityB) {
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
    var article = new Schema('articles', { idAttribute: 'slug' }),
        input;

    input = {
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
    function makeSlug(article) {
      var posted = article.posted,
          title = article.title.toLowerCase().replace(' ', '-');

      return [title, posted.year, posted.month, posted.day].join('-');
    }

    var article = new Schema('articles', { idAttribute: makeSlug }),
        input;

    input = {
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
    var article = new Schema('articles'),
        input;

    input = [{
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
    var article = new Schema('articles', {defaults: {isFavorite: false}}),
      input;

    input = [{
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
    var article = new Schema('articles'),
        tutorial = new Schema('tutorials'),
        articleOrTutorial = { articles: article, tutorials: tutorial },
        input;

    input = [{
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
    function guessSchema(item) {
      return item.type + 's';
    }

    var article = new Schema('articles'),
        tutorial = new Schema('tutorials'),
        articleOrTutorial = { articles: article, tutorials: tutorial },
        input;

    input = [{
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
    var article = new Schema('articles'),
        input;

    input = {
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
    var article = new Schema('articles'),
        tutorial = new Schema('tutorials'),
        articleOrTutorial = { articles: article, tutorials: tutorial },
        input;

    input = {
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
    function guessSchema(item) {
      return item.type + 's';
    }

    var article = new Schema('articles'),
        tutorial = new Schema('tutorials'),
        articleOrTutorial = { articles: article, tutorials: tutorial },
        input;

    input = {
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
    var linkablesSchema = new Schema('linkables'),
        mediaSchema = new Schema('media'),
        listsSchema = new Schema('lists'),
        input;

    var schemaMap = {
      media: mediaSchema,
      lists: listsSchema
    };

    linkablesSchema.define({
      data: (parent) => schemaMap[parent.schema_type]
    });

    input = {
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
    var article = new Schema('articles'),
        user = new Schema('users'),
        input;

    article.define({
      author: user
    });

    input = {
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
    var article = new Schema('articles'),
        user = new Schema('users'),
        collection = new Schema('collections'),
        feedSchema,
        input;

    article.define({
      author: user,
      collections: arrayOf(collection)
    });

    collection.define({
      curator: user
    });

    feedSchema = {
      feed: arrayOf(article)
    };

    input = {
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
    var article = new Schema('articles'),
        tutorial = new Schema('tutorials'),
        articleOrTutorial = { articles: article, tutorials: tutorial },
        user = new Schema('users'),
        collection = new Schema('collections'),
        feedSchema,
        input;

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

    feedSchema = {
      feed: arrayOf(articleOrTutorial, { schemaAttribute: 'type' })
    };

    input = {
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
    var article = new Schema('articles'),
        user = new Schema('users'),
        feedSchema,
        input;

    article.define({
      collaborators: valuesOf(arrayOf(user))
    });

    feedSchema = {
      feed: arrayOf(article),
      suggestions: valuesOf(arrayOf(article))
    };

    input = {
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
    var article = new Schema('articles'),
        user = new Schema('users'),
        group = new Schema('groups'),
        userOrGroup = { users: user, groups: group },
        feedSchema,
        input;

    article.define({
      collaborators: valuesOf(userOrGroup, { schemaAttribute: 'type' })
    });

    feedSchema = {
      feed: arrayOf(article),
      suggestions: valuesOf(arrayOf(article))
    };

    input = {
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
    var article = new Schema('articles'),
        user = new Schema('users'),
        collection = new Schema('collections'),
        feedSchema,
        input;

    user.define({
      articles: arrayOf(article)
    });

    article.define({
      collections: arrayOf(collection)
    });

    collection.define({
      subscribers: arrayOf(user)
    });

    feedSchema = {
      feed: arrayOf(article)
    };

    input = {
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
    var user = new Schema('users'),
        input;

    user.define({
      parent: user
    });

    input = {
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
    var writer = new Schema('writers'),
        book = new Schema('books'),
        schema = arrayOf(writer),
        input;

    writer.define({
      books: arrayOf(book)
    });

    input = [{
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
    var writer = new Schema('writers'),
        book = new Schema('books'),
        schema = arrayOf(writer),
        input;

    writer.define({
      books: arrayOf(book)
    });

    input = [{
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

    var warnCalled = false,
        realConsoleWarn;

    function mockWarn() {
      warnCalled = true;
    }

    realConsoleWarn = console.warn;
    console.warn = mockWarn;

    expect(normalize(input, schema)).toMatchSnapshot();

    expect(warnCalled).toBe(true);
    console.warn = realConsoleWarn;
  });

  it('ignores prototype objects and creates new object', () => {
    var writer = new Schema('writers'),
        schema = writer,
        input;
    input = {
      id: 'constructor',
      name: 'Constructor',
      isAwesome: true
    };

    expect(normalize(input, schema)).toMatchSnapshot();
  });

  it('can normalize a polymorphic union field and array and map', () => {
    var user = new Schema('users'),
        group = new Schema('groups'),
        member = unionOf({
          users: user,
          groups: group
        }, { schemaAttribute: 'type' }),
        input;

    group.define({
      members: arrayOf(member),
      owner: member,
      relations: valuesOf(member)
    });

    input = {
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
    expect(function () {
      var user = new Schema('users'),
          group = new Schema('groups'),
          member = unionOf({
            users: user,
            groups: group
          });
    }).toThrow();
  });

  it('can normalize iterables keyed with their id', () => {
    var user = new Schema('users', {
      idAttribute: function(obj, key) {
        return key;
      }
    })

    var input = {
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
