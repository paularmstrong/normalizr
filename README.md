normalizr
=========

Normalizes deeply nested JSON API responses according to a schema for Flux application.  
Kudos to Jing Chen for suggesting this approach.

### The Problem

You have a legacy API that returns deeply nested objects.  
You want to port your app to [Flux](https://github.com/facebook/flux) but [it's hard](https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg) for Stores to read their data from deeply nested API responses.  

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

### Features

* Entities can be nested inside other entities, objects and arrays
* Combine entity schemas to express any kind of API response
* Entities with same IDs are automatically merged (with a warning if they differ)
* Allows using a custom ID attribute (e.g. slug)

### Usage

```javascript
var normalizr = require('normalizr'),
    normalize = normalizr.normalize,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf;

// First, define a schema:

var article = new Schema('articles'),
    user = new Schema('users'),
    collection = new Schema('collections');

// Define nesting rules

article.define({
  author: user,
  collections: arrayOf(collection)
});

collection.define({
  curator: user
});

// Now we can use this schema in our API response code

var ServerActionCreators = {
  receiveArticles: function (response) {
    var normalized = normalize(response, {
      articles: arrayOf(article) // Use our schema
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_RAW_ARTICLES,
      rawArticles: normalized
    });
  },

  receiveUsers: function (response) {
    var normalized = normalize(response, {
      users: arrayOf(users) // Use our schema
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_RAW_USERS,
      rawUsers: normalized
    });
  }
}
```

### API

####`new Schema(key, [options])`

Schema lets you define a type of entity returned by your API.  
This should correspond to model in your server code.  

The `key` parameter lets you specify the name of the dictionary for this kind of entity.  

```javascript
var article = new Schema('articles');

// You can use a custom id attribute
var article = new Schema('articles', { idAttribute: 'slug' });
```

####`Schema.prototype.define(nestedSchema)`

Lets you specify relationships between different entities.  

```javascript
var article = new Schema('articles'),
    user = new Schema('users');

article.define({
  author: user
});
```

####`arrayOf(schema)`

Describes an array of the schema passed as argument.

```javascript
var article = new Schema('articles'),
    user = new Schema('users');

article.define({
  author: user,
  contributors: arrayOf(user)
});
```

####`normalize(obj, schema)`

Normalizes object according to schema.  
Passed `schema` should be a nested object reflecting the structure of API response.


```javascript
var article = new Schema('articles'),
    user = new Schema('users');

article.define({
  author: user,
  contributors: arrayOf(user)
});

// ...

var json = getArticleArray(),
    normalized = normalize(json, arrayOf(article));
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

AppDispatcher.register(function (payload) {
  var action = payload.action;

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

AppDispatcher.register(function (payload) {
  var action = payload.action;

  switch (action.type) {
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_USERS:
    mergeUsers(action.entities.users);
    UserStore.emitChange();
    break;
  }
});
```

### Dependencies

* lodash-node for `isObject` and `isEqual`

### Installing

```
npm install normalizr
```

### Running Tests

```
npm install -g mocha
npm test
```