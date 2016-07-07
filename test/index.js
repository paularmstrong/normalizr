'use strict';

var should = require('chai').should(),
    isEqual = require('lodash/isEqual'),
    isObject = require('lodash/isObject'),
    map = require('lodash/map'),
    merge = require('lodash/merge'),
    normalizr = require('../src'),
    normalize = normalizr.normalize,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf,
    valuesOf = normalizr.valuesOf,
    unionOf = normalizr.unionOf;

describe('normalizr', function () {
  it('fails creating nameless schema', function () {
    (function () {
      new Schema();
    }).should.throw();
  });

  it('fails creating entity with non-string name', function () {
    (function () {
      new Schema(42);
    }).should.throw();
  });

  it('fails normalizing something other than array or object', function () {
    (function () {
      normalize(42, {});
    }).should.throw();

    (function () {
      normalize(null, {});
    }).should.throw();

    (function () {
      normalize(undefined, {});
    }).should.throw();

    (function () {
      normalize('42', {});
    }).should.throw();
  });

  it('fails normalizing without an object schema', function () {
    (function () {
      normalize({});
    }).should.throw();

    (function () {
      normalize({}, '42');
    }).should.throw();

    (function () {
      normalize({}, []);
    }).should.throw();
  });

  it('can normalize single entity', function () {
    var article = new Schema('articles'),
        input;

    input = {
      id: 1,
      title: 'Some Article',
      isFavorite: false
    };

    Object.freeze(input);

    article.getIdAttribute().should.eql('id');
    article.getKey().should.eql('articles');

    normalize(input, article).should.eql({
      result: 1,
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            isFavorite: false
          }
        }
      }
    });
  });

  it('can normalize nested entity and delete an existing key using custom function', function () {
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

    normalize(input, article, options).should.eql({
      result: 1,
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            isFavorite: false,
            type: 1
          }
        },
        types: {
          1: {
            id: 1
          }
        }
      }
    });
  });

  it('can update key values based on original input using a custom function', function () {
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

    normalize(input, article, options).should.eql({
      entities: {
        articles: {
          '123': {
            id: '123',
            title: 'My article',
            author: '321',
            media: [
              {
                id: '1345',
                url: 'https://bit.ly/...',
                mediaViewUrl: '/paul/articles/123/photos/0'
              }
            ]
          }
        },
        authors: {
          '321': {
            id: '321',
            screenName: 'paul'
          }
        }
      },
      result: '123'
    });
  });

  it('can specify meta properties on a schema which are then accessible in assignEntity', function () {
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

    normalize(input, article, options).should.eql({
      entities: {
        articles: {
          '123': {
            id: '123',
            title: 'My article',
            authors: ['321', '678']
          }
        },
        authors: {
          '321': {
            id: '321',
            screenName: 'paul'
          },
          '678': {
            id: '678',
            screenName: 'jim'
          }
        }
      },
      result: '123'
    });
  });

  it('can use EntitySchema-specific assignEntity function', function () {
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

    normalize(input, taco).should.eql({
      entities: {
        tacos: {
          '123': { id: '123', type: 'hardshell', filling: 'veggie' }
        }
      },
      result: '123'
    });
  });

  it('can use UnionSchema-specific assignEntity function', function () {
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

    normalize(input, { group: group }).should.eql({
      result: {
        group: 1
      },
      entities: {
        groups: {
          1: {
            id: 1,
            name: 'facebook',
            members: [{
              id: 2,
              schema: 'groups'
            }, {
              id: 3,
              schema: 'users'
            }],
            owner: {
              id: 4,
              schema: 'users'
            },
            relations: {
              friend: {
                id: 5,
                schema: 'users'
              }
            },
            url: '/groups/facebook'
          },
          2: {
            id: 2,
            type: 'groups',
            name: 'react',
            url: '/groups/react'
          }
        },
        users: {
          3: {
            id: 3,
            type: 'users',
            name: 'Huey'
          },
          4: {
            id: 4,
            type: 'users',
            name: 'Jason'
          },
          5: {
            id: 5,
            type: 'users',
            name: 'Nate'
          }
        }
      }
    });
  });

  it('can use Schema-specific assignEntity function in iterables', function () {
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

    normalize(input, article).should.eql({
      result: 1,
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            collection_ids: [1, 7]
          },
        },
        collections: {
          1: {
            id: 1,
            title: 'Awesome Writing',
          },
          7: {
            id: 7,
            title: 'Even Awesomer',
          }
        },
      }
    });
  });

  it('throws if getMeta is called with invalid params', function () {
    var article = new Schema('articles', { meta: { removeProps: ['year', 'publisher'] }});

    (function() {
      article.getMeta();
    }).should.throw();

    (function() {
      article.getMeta('');
    }).should.throw();

    (function() {
      article.getMeta('missingProp');
    }).should.not.throw();

    (function() {
      article.getMeta('removeProps');
    }).should.not.throw();
  });

  it('can merge into entity using custom function', function () {
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

    normalize(input, valuesOf(author), options).should.eql({
      result: {
        author: 1,
        reviewer: 1
      },
      entities: {
        authors: {
          1: {
            id: 1,
            name: 'Ada Lovelace',
            contact: {
              phone: '555-0100',
              email: 'ada@lovelace.com'
            }
          }
        }
      }
    });
  });

  it('can normalize single entity with custom id attribute', function () {
    var article = new Schema('articles', { idAttribute: 'slug' }),
        input;

    input = {
      id: 1,
      slug: 'some-article',
      title: 'Some Article',
      isFavorite: false
    };

    Object.freeze(input);

    article.getIdAttribute().should.eql('slug');
    article.getKey().should.eql('articles');

    normalize(input, article).should.eql({
      result: 'some-article',
      entities: {
        articles: {
          'some-article': {
            id: 1,
            slug: 'some-article',
            title: 'Some Article',
            isFavorite: false
          }
        }
      }
    });
  });

  it('can normalize single entity with custom id attribute function', function () {
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

    normalize(input, article).should.eql({
      result: 'some-article-1983-3-12',
      entities: {
        articles: {
          'some-article-1983-3-12': {
            id: 1,
            title: 'Some Article',
            isFavorite: false,
            posted: {
              day: 12,
              month: 3,
              year: 1983
            }
          }
        }
      }
    });
  });

  it('can normalize an array', function () {
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

    normalize(input, arrayOf(article)).should.eql({
      result: [1, 2],
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article'
          },
          2: {
            id: 2,
            title: 'Other Article'
          }
        }
      }
    });
  });

  it('can normalize a polymorphic array with schema attribute', function () {
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

    normalize(input, arrayOf(articleOrTutorial, { schemaAttribute: 'type' })).should.eql({
      result: [
        {id: 1, schema: 'articles'},
        {id: 1, schema: 'tutorials'}
      ],
      entities: {
        articles: {
          1: {
            id: 1,
            type: 'articles',
            title: 'Some Article'
          }
        },
        tutorials: {
          1: {
            id: 1,
            type: 'tutorials',
            title: 'Some Tutorial'
          }
        }
      }
    });
  });

  it('can normalize a polymorphic array with schema attribute function', function () {
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

    normalize(input, arrayOf(articleOrTutorial, { schemaAttribute: guessSchema })).should.eql({
      result: [
        { id: 1, schema: 'articles' },
        { id: 1, schema: 'tutorials' }
      ],
      entities: {
        articles: {
          1: {
            id: 1,
            type: 'article',
            title: 'Some Article'
          }
        },
        tutorials: {
          1: {
            id: 1,
            type: 'tutorial',
            title: 'Some Tutorial'
          }
        }
      }
    });
  });

  it('can normalize a map', function () {
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

    normalize(input, valuesOf(article)).should.eql({
      result: {
        one: 1,
        two: 2
      },
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article'
          },
          2: {
            id: 2,
            title: 'Other Article'
          }
        }
      }
    });
  });

  it('can normalize a polymorphic map with schema attribute', function () {
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

    normalize(input, valuesOf(articleOrTutorial, { schemaAttribute: 'type' })).should.eql({
      result: {
        one: {id: 1, schema: 'articles'},
        two: {id: 2, schema: 'articles'},
        three: {id: 1, schema: 'tutorials'}
      },
      entities: {
        articles: {
          1: {
            id: 1,
            type: 'articles',
            title: 'Some Article'
          },
          2: {
            id: 2,
            type: 'articles',
            title: 'Another Article'
          }
        },
        tutorials: {
          1: {
            id: 1,
            type: 'tutorials',
            title: 'Some Tutorial'
          }
        }
      }
    });
  });

  it('can normalize a polymorphic map with schema attribute function', function () {
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

    normalize(input, valuesOf(articleOrTutorial, { schemaAttribute: guessSchema })).should.eql({
      result: {
        one: {id: 1, schema: 'articles'},
        two: {id: 2, schema: 'articles'},
        three: {id: 1, schema: 'tutorials'}
      },
      entities: {
        articles: {
          1: {
            id: 1,
            type: 'article',
            title: 'Some Article'
          },
          2: {
            id: 2,
            type: 'article',
            title: 'Another Article'
          }
        },
        tutorials: {
          1: {
            id: 1,
            type: 'tutorial',
            title: 'Some Tutorial'
          }
        }
      }
    });
  });

  it('can normalize nested entities', function () {
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

    normalize(input, article).should.eql({
      result: 1,
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            author: 3
          }
        },
        users: {
          3: {
            id: 3,
            name: 'Mike Persson'
          }
        }
      }
    });
  });

  it('can normalize nested entity using property from parent', function () {
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

    normalize(input, linkablesSchema).should.eql({
      result: 1,
      entities: {
        linkables: {
          1: {
            id: 1,
            module_type: 'article',
            schema_type: 'media',
            data: 2
          }
        },
        media: {
          2: {
            id: 2,
            url: 'catimage.jpg'
          }
        }
      }
    });
  });


  it('can normalize deeply nested entities with arrays', function () {
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

    normalize(input, feedSchema).should.eql({
      result: {
        feed: [1, 2]
      },
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            author: 3,
            collections: [1, 7]
          },
          2: {
            id: 2,
            title: 'Other Article',
            author: 2,
            collections: [2]
          }
        },
        collections: {
          1: {
            id: 1,
            title: 'Awesome Writing',
            curator: 4
          },
          2: {
            id: 2,
            title: 'Neverhood',
            curator: 120
          },
          7: {
            id: 7,
            title: 'Even Awesomer',
            curator: 100
          }
        },
        users: {
          2: {
            id: 2,
            name: 'Pete Hunt'
          },
          3: {
            id: 3,
            name: 'Mike Persson'
          },
          4: {
            id: 4,
            name: 'Andy Warhol'
          },
          100: {
            id: 100,
            name: 'T.S. Eliot'
          },
          120: {
            id: 120,
            name: 'Ada Lovelace'
          }
        }
      }
    });
  });

  it('can normalize deeply nested entities with polymorphic arrays', function () {
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

    normalize(input, feedSchema).should.eql({
      result: {
        feed: [
          { id: 1, schema: 'articles' },
          { id: 1, schema: 'tutorials' }
        ]
      },
      entities: {
        articles: {
          1: {
            id: 1,
            type: 'articles',
            title: 'Some Article',
            author: 3,
            collections: [1, 7]
          }
        },
        tutorials: {
          1: {
            id: 1,
            type: 'tutorials',
            title: 'Some Tutorial',
            author: 2,
            collections: [2]
          }
        },
        collections: {
          1: {
            id: 1,
            title: 'Awesome Writing',
            curator: 4
          },
          2: {
            id: 2,
            title: 'Neverhood',
            curator: 120
          },
          7: {
            id: 7,
            title: 'Even Awesomer',
            curator: 100
          }
        },
        users: {
          2: {
            id: 2,
            name: 'Pete Hunt'
          },
          3: {
            id: 3,
            name: 'Mike Persson'
          },
          4: {
            id: 4,
            name: 'Andy Warhol'
          },
          100: {
            id: 100,
            name: 'T.S. Eliot'
          },
          120: {
            id: 120,
            name: 'Ada Lovelace'
          }
        }
      }
    });
  });

  it('can normalize deeply nested entities with maps', function () {
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

    normalize(input, feedSchema).should.eql({
      result: {
        feed: [1, 2, 3],
        suggestions: {
          1: [2, 3]
        }
      },
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            collaborators: {
              authors: [3],
              reviewers: [2]
            }
          },
          2: {
            id: 2,
            title: 'Other Article',
            collaborators: {
              authors: [2]
            }
          },
          3: {
            id: 3,
            title: 'Last Article'
          }
        },
        users: {
          2: {
            id: 2,
            name: 'Pete Hunt'
          },
          3: {
            id: 3,
            name: 'Mike Persson'
          }
        }
      }
    });
  });

  it('can normalize deeply nested entities with polymorphic maps', function () {
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

    normalize(input, feedSchema).should.eql({
      result: {
        feed: [1, 2, 3],
        suggestions: {
          1: [2, 3]
        }
      },
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            collaborators: {
              author: { id: 3, schema: 'users' },
              reviewer: { id: 2, schema: 'groups' }
            }
          },
          2: {
            id: 2,
            title: 'Other Article',
            collaborators: {
              author: { id: 2, schema: 'users' }
            }
          },
          3: {
            id: 3,
            title: 'Last Article'
          }
        },
        users: {
          2: {
            id: 2,
            type: 'users',
            name: 'Pete Hunt'
          },
          3: {
            id: 3,
            type: 'users',
            name: 'Mike Persson'
          }
        },
        groups: {
          2: {
            id: 2,
            type: 'groups',
            name: 'Reviewer Group'
          }
        }
      }
    });
  });

  it('can normalize mutually recursive entities', function () {
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

    normalize(input, feedSchema).should.eql({
      result: {
        feed: [1]
      },
      entities: {
        articles: {
          1: {
            id: 1,
            title: 'Some Article',
            collections: [1, 7]
          }
        },
        collections: {
          1: {
            id: 1,
            title: 'Awesome Writing',
            subscribers: [4, 100]
          },
          7: {
            id: 7,
            title: 'Even Awesomer',
            subscribers: [100]
          }
        },
        users: {
          4: {
            id: 4,
            name: 'Andy Warhol',
            articles: [1]
          },
          100: {
            id: 100,
            name: 'T.S. Eliot',
            articles: [1]
          }
        }
      }
    });
  });

  it('can normalize self-recursive entities', function () {
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

    normalize(input, user).should.eql({
      result: 1,
      entities: {
        users: {
          1: {
            id: 1,
            name: 'Andy Warhol',
            parent: 7
          },
          7: {
            id: 7,
            name: 'Tom Dale',
            parent: 4
          },
          4: {
            id: 4,
            name: 'Pete Hunt'
          }
        }
      }
    });
  });

  it('can merge entities', function () {
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

    normalize(input, schema).should.eql({
      result: [3, 3],
      entities: {
        writers: {
          3: {
            id: 3,
            isBritish: true,
            name: 'Jo Rowling',
            bio: 'writer',
            books: [1],
            location: {
              x: 100,
              y: 200,
              nested: ['hello', {
                world: true
              }]
            }
          }
        },
        books: {
          1: {
            id: 1,
            isAwesome: true,
            soldWell: true,
            name: 'Harry Potter'
          }
        }
      }
    });
  });

  it('warns about inconsistencies when merging entities', function () {
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

    normalize(input, schema).should.eql({
      result: [3, 3],
      entities: {
        writers: {
          3: {
            id: 3,
            name: 'Jo Rowling',
            books: [1]
          }
        },
        books: {
          1: {
            id: 1,
            soldWell: true,
            name: 'Harry Potter'
          }
        }
      }
    });

    warnCalled.should.eq(true);
    console.warn = realConsoleWarn;
  });

  it('ignores prototype objects and creates new object', function () {
    var writer = new Schema('writers'),
        schema = writer,
        input;
    input = {
      id: 'constructor',
      name: 'Constructor',
      isAwesome: true
    };

    normalize(input, schema).should.eql({
      result: 'constructor',
      entities: {
        writers: {
          constructor: {
            id: 'constructor',
            name: 'Constructor',
            isAwesome: true
          }
        }
      }
    });

  });

  it('can normalize a polymorphic union field and array and map', function () {
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

    normalize(input, { group: group }).should.eql({
      result: {
        group: 1
      },
      entities: {
        groups: {
          1: {
            id: 1,
            name: 'facebook',
            members: [{
              id: 2,
              schema: 'groups'
            }, {
              id: 3,
              schema: 'users'
            }],
            owner: {
              id: 4,
              schema: 'users'
            },
            relations: {
              friend: {
                id: 5,
                schema: 'users'
              }
            }
          },
          2: {
            id: 2,
            type: 'groups',
            name: 'react'
          }
        },
        users: {
          3: {
            id: 3,
            type: 'users',
            name: 'Huey'
          },
          4: {
            id: 4,
            type: 'users',
            name: 'Jason'
          },
          5: {
            id: 5,
            type: 'users',
            name: 'Nate'
          }
        }
      }
    });
  });

  it('fails creating union schema without schemaAttribute', function () {
    (function () {
      var user = new Schema('users'),
          group = new Schema('groups'),
          member = unionOf({
            users: user,
            groups: group
          });
    }).should.throw();
  });

});


