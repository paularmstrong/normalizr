'use strict';

var should = require('chai').should(),
    normalizr = require('../src'),
    normalize = normalizr.normalize,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf;

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
      assignEntity: function(obj, key, val) {
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

});
