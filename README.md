normalizr
=========

Normalizes deeply nested JSON API responses according to a schema for Flux application.  
Kudos to Jing Chen for suggesting this approach.

### Sample App

See **[flux-react-router-example](https://github.com/gaearon/flux-react-router-example)**.

### The Problem

* You have a JSON API that returns deeply nested objects;  
* You want to port your app to [Flux](https://github.com/facebook/flux);
* You noticed [it's hard](https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg) for Stores to consume data from nested API responses.  

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

* Entities can be nested inside other entities, objects and arrays;
* Combine entity schemas to express any kind of API response;
* Entities with same IDs are automatically merged (with a warning if they differ);
* Allows using a custom ID attribute (e.g. slug).

### Usage

```javascript
var normalizr = require('normalizr'),
    normalize = normalizr.normalize,
    Schema = normalizr.Schema,
    arrayOf = normalizr.arrayOf;
```

First, define a schema for our entities:

```javascript
var article = new Schema('articles'),
    user = new Schema('users'),
    collection = new Schema('collections');
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
var ServerActionCreators = {

  // These are two different XHR endpoints with different response schemas.
  // We can use the schema objects defined earlier to express both of them:

  receiveArticles: function (response) {
  
    // Passing { articles: arrayOf(article) } as second parameter to normalize()
    // lets it correctly traverse the response tree and gather all entities:
    
    // BEFORE
    // {
    //   articles: [{
    //     id: 1,
    //     title: 'Some Article',
    //     user: {
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
    //       1: { ... },
    //       2: { ... },
    //       ...
    //     },
    //     users: {
    //       7: { ... },
    //       ..
    //     }
    //   }
    
    var normalized = normalize(response, {
      articles: arrayOf(article)
    });

    AppDispatcher.handleServerAction({
      type: ActionTypes.RECEIVE_ARTICLES,
      normalized: normalized
    });
  },
  
  // Though this is a different API endpoint, we can describe it just as well
  // with our normalizr schema objects:

  receiveUsers: function (response) {

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
    

    var normalized = normalize(response, {
      users: arrayOf(users)
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
AppDispatcher.register(function (payload) {
  var action = payload.action;

  switch (action.type) {
  case ActionTypes.RECEIVE_ARTICLES:
  case ActionTypes.RECEIVE_USERS:
    mergeUsers(action.normalized.entities.users);
    UserStore.emitChange();
    break;
  }
});
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
    mergeUsers(action.normalized.entities.users);
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
