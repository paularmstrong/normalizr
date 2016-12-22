# normalizr [![build status](https://img.shields.io/travis/paularmstrong/normalizr/master.svg?style=flat-square)](https://travis-ci.org/paularmstrong/normalizr) [![npm version](https://img.shields.io/npm/v/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr) [![npm downloads](https://img.shields.io/npm/dm/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr)

Normalizes deeply nested JSON API responses according to a schema for [Flux](https://facebook.github.io/flux) and [Redux](https://github.com/reactjs/redux) apps.  
Kudos to Jing Chen for suggesting this approach.

## Installation

```
npm install --save normalizr
```

## Sample App

### Flux

See **[flux-react-router-example](https://github.com/gaearon/flux-react-router-example)**.

### Redux

See **[redux/examples/real-world](https://github.com/reactjs/redux/tree/master/examples/real-world)**.

## The Problem

* You have a JSON API that returns deeply nested objects;  
* You want to port your app to [Flux](https://github.com/facebook/flux) or [Redux](https://github.com/reactjs/redux);
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
const article = new Schema('articles');
const user = new Schema('users');
```

Then we define nesting rules:

```javascript
article.define({
  author: user,
  contributors: arrayOf(user)
});
```

Now we can use this schema in our API response handlers:

```javascript
const ServerActionCreators = {

  // These are two different XHR endpoints with different response schemas.
  // We can use the schema objects defined earlier to express both of them:

  receiveOneArticle(response) {

    // Here, the response is an object containing data about one article.
    // Passing the article schema as second parameter to normalize() lets it
    // correctly traverse the response tree and gather all entities:

    // BEFORE:
    // {
    //   id: 1,
    //   title: 'Some Article',
    //   author: {
    //     id: 7,
    //     name: 'Dan'
    //   },
    //   contributors: [{
    //     id: 10,
    //     name: 'Abe'
    //   }, {
    //     id: 15,
    //     name: 'Fred'
    //   }]
    // }
    //
    // AFTER:
    // {
    //   result: 1,                    // <--- Note object is referenced by ID
    //   entities: {
    //     articles: {
    //       1: {
    //         author: 7,              // <--- Same happens for references to
    //         contributors: [10, 15]  // <--- other entities in the schema
    //         ...}
    //     },
    //     users: {
    //       7: { ... },
    //       10: { ... },
    //       15: { ... }
    //     }
    //   }
    // }

    response = normalize(response, article);

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_ONE_ARTICLE,
      response
    });
  },

  receiveAllArticles(response) {

    // Here, the response is an object with the key 'articles' referencing
    // an array of article objects. Passing { articles: arrayOf(article) } as
    // second parameter to normalize() lets it correctly traverse the response
    // tree and gather all entities:

    // BEFORE:
    // {
    //   articles: [{
    //     id: 1,
    //     title: 'Some Article',
    //     author: {
    //       id: 7,
    //       name: 'Dan'
    //     },
    //     ...
    //   },
    //   ...
    //   ]
    // }
    //
    // AFTER:
    // {
    //   result: {
    //    articles: [1, 2, ...]     // <--- Note how object array turned into ID array
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
    // }

    response = normalize(response, {
      articles: arrayOf(article)
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_ALL_ARTICLES,
      response
    });
  }
}
```

Finally, different Stores can tune in to listen to all API responses and grab entity lists from `action.response.entities`:

```javascript
AppDispatcher.register((payload) => {
  const { action } = payload;

  if (action.response && action.response.entities && action.response.entities.users) {
    mergeUsers(action.response.entities.users);
    UserStore.emitChange();
    break;
  }
});
```

### Dealing with combined endpoints

Sometimes, especially when dealing with low-bandwidth scenarios, you want to combine what would normally be multiple endpoints into one logical endpoint so that you save several server roundtrips. This works out of the box with normalizr. Let's say you want to get `articles` and `categories` to assemble the homepage of a blog.

For this example's sake the relationship between articles and categories is left out.

You create an endpoint `/homepage.json`, which returns the following JSON:

```json
{
  "articles": [
    {
      "id": 1,
      "title": "Some Article"
    }
  ],
  "categories": [
    {
      "id": 2,
      "title": "Some Category"
    }
  ]
}
```

This is automatically dealt with by `normalizr`:

```js
import { Schema, arrayOf, normalize } from 'normalizr';

const article = new Schema('article');
const articles = arrayOf(article);

const category = new Schema('category');
const categories = arrayOf(category);

/**
 * Then after receiving your server response:
 */

const normalizedResponse = normalize(serverResponse, {
  articles: articles,
  categories: categories
});
```

Rather than storing the array of id's directly in the `result` key, `normalizr` will return them under their respective entity names under the `result` key:

```js
{
  result: {
    articles: [1],
    categories: [2]
  },
  entities: {
    articles: {
      1: {
        id: 1,
        title: 'Some Article'
      }
    },
    categories: {
      2: {
        id: 1,
        title: 'Some Category'
      }
    }
  }
}
```

## API Reference

### `new Schema(key, [options])`

Schema lets you define a type of entity returned by your API.  
This should correspond to model in your server code.  

The `key` parameter lets you specify the name of the dictionary for this kind of entity.  

```javascript
const article = new Schema('articles');

// You can use a custom id attribute
const article = new Schema('articles', { idAttribute: 'slug' });

// Or you can specify a function to infer it
function generateSlug(entity) { /* ... */ }
const article = new Schema('articles', { idAttribute: generateSlug });

// The function is passed both the current value and its key
// This is helpful in occasions where your data is keyed by id, but doesn't contain id inside the value
const keyedByIdJson = { 1: { ... }, 2: { ... }, 3: { ... } };
function generateSlug(entity, id) { return id; }
const article = new Schema('articles', { idAttribute: generateSlug });

// You can also specify meta properties to be used for customizing the output in assignEntity (see below)
const article = new Schema('articles', { idAttribute: 'slug', meta: { removeProps: ['publisher'] }});

// You can specify custom `assignEntity` function to be run after the `assignEntity` function passed to `normalize`
const article = new Schema('articles', { assignEntity: function (output, key, value, input) {
  if (key === 'id_str') {
    output.id = value;
    if ('id_str' in output) {
      delete output.id_str;
    }
  } else {
    output[key] = value;
  }
}})

// You can specify default values for the entity
const article = new Schema('articles', { defaults: { likes: 0 } });
```

### `Schema.prototype.define(nestedSchema)`

Lets you specify relationships between different entities.  

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  author: user
});
```

### `Schema.prototype.getKey()`

Returns the key of the schema.

```javascript
const article = new Schema('articles');

article.getKey();
// articles
```

### `Schema.prototype.getIdAttribute()`

Returns the idAttribute of the schema.

```javascript
const article = new Schema('articles');
const slugArticle = new Schema('articles', { idAttribute: 'slug' });

article.getIdAttribute();
// id
slugArticle.getIdAttribute();
// slug
```

### `Schema.prototype.getDefaults()`

Returns the default values of the schema.

```javascript
const article = new Schema('articles', { defaults: { likes: 0 } });

article.getDefaults();
// { likes: 0 }
```

### `arrayOf(schema, [options])`

Describes an array of the schema passed as argument.

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  author: user,
  contributors: arrayOf(user)
});
```

If the array contains entities with different schemas, you can use the `schemaAttribute` option to specify which schema to use for each entity:

```javascript
const article = new Schema('articles');
const image = new Schema('images');
const video = new Schema('videos');
const asset = {
  images: image,
  videos: video
};

// You can specify the name of the attribute that determines the schema
article.define({
  assets: arrayOf(asset, { schemaAttribute: 'type' })
});

// Or you can specify a function to infer it
function inferSchema(entity) { /* ... */ }
article.define({
  assets: arrayOf(asset, { schemaAttribute: inferSchema })
});
```

### `valuesOf(schema, [options])`

Describes a map whose values follow the schema passed as argument.

```javascript
const article = new Schema('articles');
const user = new Schema('users');

article.define({
  collaboratorsByRole: valuesOf(user)
});
```

If the map contains entities with different schemas, you can use the `schemaAttribute` option to specify which schema to use for each entity:

```javascript
const article = new Schema('articles');
const user = new Schema('users');
const group = new Schema('groups');
const collaborator = {
  users: user,
  groups: group
};

// You can specify the name of the attribute that determines the schema
article.define({
  collaboratorsByRole: valuesOf(collaborator, { schemaAttribute: 'type' })
});

// Or you can specify a function to infer it
function inferSchema(entity) { /* ... */ }
article.define({
  collaboratorsByRole: valuesOf(collaborator, { schemaAttribute: inferSchema })
});
```

### `unionOf(schemaMap, [options])`

Describe a schema which is a union of multiple schemas.  This is useful if you need the polymorphic behavior provided by `arrayOf` or `valuesOf` but for non-collection fields.

Use the required `schemaAttribute` option to specify which schema to use for each entity.

```javascript
const group = new Schema('groups');
const user = new Schema('users');

// a member can be either a user or a group
const member = {
  users: user,
  groups: group
};

// You can specify the name of the attribute that determines the schema
group.define({
  owner: unionOf(member, { schemaAttribute: 'type' })
});

// Or you can specify a function to infer it
function inferSchema(entity) { /* ... */ }
group.define({
  creator: unionOf(member, { schemaAttribute: inferSchema })
});
```

A `unionOf` schema can also be combined with `arrayOf` and `valuesOf` with the same behavior as each supplied with the `schemaAttribute` option.

```javascript
const group = new Schema('groups');
const user = new Schema('users');

const member = unionOf({
  users: user,
  groups: group
}, { schemaAttribute: 'type' });

group.define({
  owner: member,
  members: arrayOf(member),
  relationships: valuesOf(member)
});
```

### `normalize(obj, schema, [options])`

Normalizes object according to schema.  
Passed `schema` should be a nested object reflecting the structure of API response.

You may optionally specify any of the following options:

* `assignEntity` (function): This is useful if your backend emits additional fields, such as separate ID fields, you'd like to delete in the normalized entity. See [the tests](https://github.com/gaearon/normalizr/blob/a0931d7c953b24f8f680b537b5f23a20e8483be1/test/index.js#L89-L200) and the [discussion](https://github.com/gaearon/normalizr/issues/10) for a usage example.

* `mergeIntoEntity` (function): You can use this to resolve conflicts when merging entities with the same key. See [the test](https://github.com/gaearon/normalizr/blob/47ed0ecd973da6fa7c8b2de461e35b293ae52047/test/index.js#L132-L197) and the [discussion](https://github.com/gaearon/normalizr/issues/34) for a usage example.

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

// Normalize one article object
const json = { id: 1, author: ... };
const normalized = normalize(json, article);

// Normalize an array of article objects
const arr = [{ id: 1, author: ... }, ...]
const normalized = normalize(arr, arrayOf(article));

// Normalize an array of article objects, referenced by an object key:
const wrappedArr = { articles: [{ id: 1, author: ... }, ...] }
const normalized = normalize(wrappedArr, {
  articles: arrayOf(article)
});
```

## Explanation by Example

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
// With normalizr, users are always in action.response.entities.users

AppDispatcher.register((payload) => {
  const { action } = payload;

  if (action.response && action.response.entities && action.response.entities.users) {
    mergeUsers(action.response.entities.users);
    UserStore.emitChange();
    break;
  }
});
```

## Dependencies

* Some methods from `lodash`, such as `isObject`, `isEqual` and `mapValues`

## Browser Support

Modern browsers with ES5 environments are supported.  
The minimal supported IE version is IE 9.

## Running Tests

```
git clone https://github.com/gaearon/normalizr.git
cd normalizr
yarn install
npm test # run tests once
npm run test:watch # run test watcher
```

## Credits

Normalizr was originally created by [Dan Abramov](http://github.com/gaearon) and inspired by a conversation with [Jing Chen](https://twitter.com/jingc).  
It has since received contributions from different [community members](https://github.com/gaearon/normalizr/graphs/contributors).
