# Introduction

## Motivation

Many APIs, public or not, return JSON data that has deeply nested objects. Using data in this kind of structure is often [very difficult](https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg) for JavaScript applications, especially those using [Flux](http://facebook.github.io/flux/) or [Redux](http://redux.js.org/).

## Solution

Normalizr is a small, but powerful utility for taking JSON with a schema definition and returning nested entities with their IDs, gathered in dictionaries.

### Example

The following nested object:

```js
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

Can be normalized to:

```js
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

## Build Files

Normalizr is built for various environments

* `src/*`
  - CommonJS, unpacked files. These are the recommended files for use with your own package bundler and are the default in-point as defined by this modules `package.json`.
* `normalizr.js`, `normalizr.min.js`
  - [CommonJS](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)
* `normalizr.amd.js`, `normalizr.amd.min.js`
  - [Asynchronous Module Definition](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)
* `normalizr.umd.js`, `normalizr.umn.min.js`
  - [Universal Module Definition](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)
* `normalizr.browser.js`, `normalizr.browser.min.js`
  - [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) / Immediately-Invoked Function Expression, suitable for use as a standalone script import in the browser.
  - Note: It is not recommended to use packages like Normalizr with direct browser `<script src="normalizr.js"></script>` tags. Consider a package bundler like [webpack](https://webpack.github.io/), [rollup](https://rollupjs.org/), or [browserify](http://browserify.org/) instead.
