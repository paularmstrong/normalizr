# Normalizing GitHub Issues

This is a barebones example for node to illustrate how normalizing the GitHub Issues API endpoint could work.

## Running

```sh
# from the root directory:
yarn
# from this directory:
../../node_modules/.bin/babel-node ./index.js
```

## Files

* [index.js](/examples/github/index.js): Pulls live data from the GitHub API for this project's issues and normalizes the JSON.
* [output.json](/examples/github/output.json): A sample of the normalized output.
* [schema.js](/examples/github/schema.js): The schema used to normalize the GitHub issues.
