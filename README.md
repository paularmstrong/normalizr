# normalizr [![build status](https://img.shields.io/travis/gaearon/normalizr/master.svg?style=flat-square)](https://travis-ci.org/gaearon/normalizr) [![npm version](https://img.shields.io/npm/v/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr) [![npm downloads](https://img.shields.io/npm/dm/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr)

Normalizes deeply nested JSON API responses according to a schema for Flux application.  
Kudos to Jing Chen for suggesting this approach.

## Installation

```
npm install --save normalizr
```

## Sample App

### Flux

See **[flux-react-router-example](https://github.com/gaearon/flux-react-router-example)**.

### Redux

See **[redux/examples/real-world](https://github.com/rackt/redux/tree/master/examples/real-world)**.

###The Problem

* You have a JSON API that returns deeply nested objects;  
* You want to port your app to [Flux](https://github.com/facebook/flux) or [Redux](http://rackt.github.io/redux);
* You noticed [it's hard](https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg) for Stores (or Reducers) to consume data from nested API responses.  

Normalizr takes JSON and a schema and **replaces nested entities with their IDs, gathering all entities in dictionaries**.

For example,

```javascript
[{
  id: 1,
  title: 'Some Article',
  author: {
    id: 1,
    name: 'Dan'
  }
}, {
  id: 2,
  title: 'Other Article',
  author: {
    id: 1,
    name: 'Dan'
  }
}]
```

can be normalized to

```javascript
{
  result: [1, 2],
  entities: {
    articles: {
      1: {
        id: 1,
        title: 'Some Article',
        author: 1
      },
      2: {
        id: 2,
        title: 'Other Article',
        author: 1
      }
    },
    users: {
      1: {
        id: 1,
        name: 'Dan'
      }
    }
  }
}
```

Note the flat structure (all nesting is gone).

## Features

* Entities can be nested inside other entities, objects and arrays;
* Combine entity schemas to express any kind of API response;
* Entities with same IDs are automatically merged (with a warning if they differ);
* Allows using a custom ID attribute (e.g. slug).

## Usage

```javascript
import { normalize, Schema, arrayOf } from 'normalizr';
```

First, define a schema for our entities:

```javascript
const article = new Schema('articles')
const user = new Schema('users');
const collection = new Schema('collections');
```

Then we define nesting rules:

```javascript
article.define({
  author: user,
  collections: arrayOf(collection)
});

collection.define({
  curator: user
});
```

Now we can use this schema in our API response handlers:

```javascript
const ServerActionCreators = {

  // These are two different XHR endpoints with different response schemas.
  // We can use the schema objects defined earlier to express both of them:

  receiveArticles(response) {
  
    // Passing { articles: arrayOf(article) } as second parameter to normalize()
    // lets it correctly traverse the response tree and gather all entities:
    
    // BEFORE
    // {
    //   articles: [{
    //     id: 1,
    //     title: 'Some Article',
    //     author: {
    //       id: 7,
    //       name: 'Dan',
    //     }
    //   }, ...]
    // }
    //
    // AFTER:
    // {
    //   result: {
    //    articles: [1, 2, ...] // <--- Note how object array turned into ID array
    //   },
    //   entities: {
    //     articles: {
    //       1: { author: 7, ... }, // <--- Same happens for references to other entities in the schema
    //       2: { ... },
    //       ...
    //     },
    //     users: {
    //       7: { ... },
    //       ..
    //     }
    //   }
    
    const normalized = normalize(response, {
      articles: arrayOf(article)
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_ARTICLES,
      normalized: normalized
    });
  },
  
  // Though this is a different API endpoint, we can describe it just as well
  // with our normalizr schema objects:

  receiveUsers(response) {

    // Passing { users: arrayOf(user) } as second parameter to normalize()
    // lets it correctly traverse the response tree and gather all entities:
    
    // BEFORE
    // {
    //   users: [{
    //     id: 7,
    //     name: 'Dan',
    //     ...
    //   }, ...]
    // }
    //
    // AFTER:
    // {
    //   result: {
    //    users: [7, ...] // <--- Note how object array turned into ID array
    //   },
    //   entities: {
    //     users: {
    //       7: { ... },
    //       ..
    //     }
    //   }
    

    const normalized = normalize(response, {
      users: arrayOf(user)
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_USERS,
      normalized: normalized
    });
  }
}
```

Finally, different Stores can tune in to listen to all API responses and grab entity lists from `action.normalized.entities`:

```javascript
AppDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.type) {
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_USERS:
    mergeUsers(action.normalized.entities.users);
    UserStore.emitChange();
    break;
  }
});
```

## API Reference

#### `new Schema(key, [options])`

Schema lets you define a type of entity returned by your API.  
This should correspond to model in your server code.  

The `key` parameter lets you specify the name of the dictionary for this kind of entity.  

```javascript
const article = new Schema('articles');

// You can use a custom id attribute
const article = new Schema('articles', { idAttribute: 'slug' });
```

#### `Schema.prototype.define(nestedSchema)`

Lets you specify relationships between different entities.  

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  author: user
});
```

#### `arrayOf(schema)`

Describes an array of the schema passed as argument.

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  author: user,
  contributors: arrayOf(user)
});
```

#### `normalize(obj, schema, [options])`

Normalizes object according to schema.  
Passed `schema` should be a nested object reflecting the structure of API response.

You may optionally specify a custom `assignEntity` function in `options`. This is useful if your backend emits additional fields, such as separate ID fields, you'd like to delete in the normalized entity. See [the test](https://github.com/babsonmatt/normalizr/blob/de08c29bc03120bf9fc2964041f46ad3950d01af/test/index.js#L80-L126) and the [discussion](https://github.com/gaearon/normalizr/issues/10) for a usage example.

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  author: user,
  contributors: arrayOf(user),
  meta: {
    likes: arrayOf({
      user: user
    })
  }
});

// ...

const json = getArticleArray();
const normalized = normalize(json, arrayOf(article));
```

### Explanation by Example

Say, you have `/articles` API with the following schema:

```
articles: article*

article: {
  author: user,
  likers: user*
  primary_collection: collection?
  collections: collection*
}

collection: {
  curator: user
}
```

Without normalizr, your Stores would need to know too much about API response schema.  
For example, `UserStore` would include a lot of boilerplate to extract fresh user info when articles are fetched:

```javascript
// Without normalizr, you'd have to do this in every store:

AppDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.type) {
  case ActionTypes.RECEIVE_USERS:
    mergeUsers(action.rawUsers);
    break;

  case ActionTypes.RECEIVE_ARTICLES:
    action.rawArticles.forEach(rawArticle => {
      mergeUsers([rawArticle.user]);
      mergeUsers(rawArticle.likers);

      mergeUsers([rawArticle.primaryCollection.curator]);
      rawArticle.collections.forEach(rawCollection => {
        mergeUsers(rawCollection.curator);
      });
    });

    UserStore.emitChange();
    break;
  }
});
```

Normalizr solves the problem by converting API responses to a flat form where nested entities are replaced with IDs:

```javascript
{
  result: [12, 10, 3, ...],
  entities: {
    articles: {
      12: {
        authorId: 3,
        likers: [2, 1, 4],
        primaryCollection: 12,
        collections: [12, 11]
      },
      ...
    },
    users: {
      3: {
        name: 'Dan'
      },
      2: ...,
      4: ....
    },
    collections: {
      12: {
        curator: 2,
        name: 'Stuff'
      },
      ...
    }
  }
}
```

Then `UserStore` code can be rewritten as:

```javascript
// With normalizr, users are always in action.entities.users

AppDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.type) {
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_USERS:
    mergeUsers(action.normalized.entities.users);
    UserStore.emitChange();
    break;
  }
});
```

## Dependencies

* `lodash` for `isObject` and `isEqual`

## Running Tests

```
git clone https://github.com/gaearon/normalizr.git
cd normalizr
npm install
npm test # run tests once
npm run test:watch # run test watcher
```
