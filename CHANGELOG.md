# v3.2.0

* **Added** Support denormalizing from Immutable entities (gh-228)
* **Added** Brought back `get idAttribute()` to `schema.Entity` (gh-226)
* **Fixed** Gracefully handle missing data in `denormalize` (gh-232)
* **Fixed** Prevent infinite recursion in `denormalize` (gh-220)

# v3.1.0

* **Added** `denormalize`. (gh-214)
* **Changed** No longer requires all input in a polymorphic schema (`Array`, `Union`, `Values`) have a matching schema definition. (gh-208)
* **Changed** Builds do both rollup and plain babel file conversions. `"main"` property in package.json points to babel-converted files.

# v3.0.0

The entire normalizr package has been rewritten from v2.x for this version. Please refer to the [documentation](/docs) for all changes.

## Added

* `schema.Entity`
    * `processStrategy` for modifying `Entity` objects before they're moved to the `entities` stack.
    * `mergeStrategy` for merging with multiple entities with the same ID.
* Added `schema.Object`, with a shorthand of `{}`
* Added `schema.Array`, with a shorthand of `[ schema ]`

## Changed

* `Schema` has been moved to a `schema` namespace, available at `schema.Entity`
* `arrayOf` has been replaced by `schema.Array` or `[]`
* `unionOf` has been replaced by `schema.Union`
* `valuesOf` has been replaced by `schema.Values`

## Removed

* `normalize` no longer accepts an optional `options` argument. All options are assigned at the schema level.
* Entity schema no longer accepts `defaults` as an option. Use a custom `processStrategy` option to apply defaults as needed.
* `assignEntity` has been replaced by `processStrategy`
* `meta` option. See `processStrategy`
