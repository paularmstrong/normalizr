# v3.0.0

## Added

* Ability to write custom schema. [example](/#TODO)
* `schema.Entity`
    * `processStrategy` for modifying `Entity` objects before they're moved to the `entities` stack. [example](/#TODO)
    * `mergeStrategy` for merging with multiple entities with the same ID. [example](/#TODO)
* Added `schema.Object`, with a shorthand of `{}`
* Added `schema.Array`, with a shorthand of `[ schema ]`

## Changed

* `arrayOf` has been replaced by `schema.Array` or `[]`
* `unionOf` has been replaced by `schema.Union`
* `valuesOf` has been replaced by `schema.Values`

## Removed

* `normalize` no longer accepts an optional `options` argument. All options are assigned at the schema level.
* Entity schema no longer accepts `defaults` as an option. Use a custom `processStrategy` option to apply defaults as needed. [example](/#TODO)
* `assignEntity` has been replaced by `processStrategy`
* `meta` option. See `processStrategy`
