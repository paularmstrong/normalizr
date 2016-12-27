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
