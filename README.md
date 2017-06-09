# normalizr [![build status](https://img.shields.io/travis/paularmstrong/normalizr/master.svg?style=flat-square)](https://travis-ci.org/paularmstrong/normalizr) [![Coverage Status](https://img.shields.io/coveralls/paularmstrong/normalizr/master.svg?style=flat-square)](https://coveralls.io/github/paularmstrong/normalizr?branch=master) [![npm version](https://img.shields.io/npm/v/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr) [![npm downloads](https://img.shields.io/npm/dm/normalizr.svg?style=flat-square)](https://www.npmjs.com/package/normalizr)

## Motivation

Many APIs, public or not, return JSON data that has deeply nested objects. Using data in this kind of structure is often [very difficult](https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg) for JavaScript applications, especially those using [Flux](http://facebook.github.io/flux/) or [Redux](http://redux.js.org/).

## Solution

Normalizr is a small, but powerful utility for taking JSON with a schema definition and returning nested entities with their IDs, gathered in dictionaries.

## Documentation

* [Introduction](/docs/introduction.md)
  - [Build Files](/docs/introduction.md#build-files)
* [Quick Start](/docs/quickstart.md)
* [API](/docs/api.md)
    - [normalize](/docs/api.md#normalizedata-schema)
    - [denormalize](/docs/api.md#denormalizeinput-schema-entities)
    - [schema](/docs/api.md#schema)
* [Using with JSONAPI](/docs/jsonapi.md)

## Examples

* [Normalizing GitHub Issues](/examples/github)
* [Relational Data](/examples/relationships)
* [Interactive Redux](/examples/redux)

## Quick Start

Consider a typical blog post. The API response for a single post might look something like this:

```json
{
  "id": "123",
  "author": {
    "id": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": [
    {
      "id": "324",
      "commenter": {
        "id": "2",
        "name": "Nicole"
      }
    }
  ]
}
```

We have two nested entity types within our `article`: `users` and `comments`. Using various `schema`, we can normalize all three entity types down:

```js
import { normalize, schema } from 'normalizr';

// Define a users schema
const user = new schema.Entity('users');

// Define your comments schema
const comment = new schema.Entity('comments', {
  commenter: user
});

// Define your article 
const article = new schema.Entity('articles', { 
  author: user,
  comments: [ comment ]
});

const normalizedData = normalize(originalData, article);
```

Now, `normalizedData` will be:

```js
{
  result: "123",
  entities: {
    "articles": { 
      "123": { 
        id: "123",
        author: "1",
        title: "My awesome blog post",
        comments: [ "324" ]
      }
    },
    "users": {
      "1": { "id": "1", "name": "Paul" },
      "2": { "id": "2", "name": "Nicole" }
    },
    "comments": {
      "324": { id: "324", "commenter": "2" }
    }
  }
}
```

## Dependencies

None.

## Credits

Normalizr was originally created by [Dan Abramov](http://github.com/gaearon) and inspired by a conversation with [Jing Chen](https://twitter.com/jingc). Since v3, it was completely rewritten and maintained by [Paul Armstrong](https://twitter.com/paularmstrong). It has also received much help, enthusiasm, and contributions from [community members](https://github.com/paularmstrong/normalizr/graphs/contributors).
