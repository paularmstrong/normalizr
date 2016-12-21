# Schema

## `Array(definition)`

Creates a schema to normalize an array of entities.

* `definition`: A singular schema that this array contains.

### Usage

```js
const data = [ { id: 1 }, { id: 2 } ];

const userSchema = new schema.Entity('users');
const myArray = new schema.Array(userSchema);
// or
const myArray = new schema.Array([ userSchema ]);
// or shorthand
const myArray = [ userSchema ];

const normalizedData = normalize(data, myArray);
```

## `Entity(key, definition = {}, options = {})`

* `key`: Required. The key name under which all entities of this type will be listed in the normalized response.
* `definition`: A definition of the nested entities found within this entity. Defaults to empty object.  
You *do not* need to define any keys in your entity other than those that hold nested entities. All other values will be copied to the normalized entity's output.
* `options`:
    - `idAttribute`: The attribute where unique IDs for each of this entity type can be found.  
    Accepts either a string key or a function. Defaults to `id`.  
    As a function, accepts the following arguments, in order: 
        - `entity`: the current entity
        - `parent`: the parent object that holds the entity
        - `key`: the attribute or index at which the `entity` was found on the `parent`
    - `mergeStrategy(entityA, entityB)`: Strategy to use when merging two entities with the same `id` value. Defaults to merge the more recently found entity onto the previous.
    - `processStrategy(entity)`: Strategy to use when pre-processing the entity, prior to normalizing. Use this method to add extra data or defaults, or completely change the entity before normalization is complete. Defaults to returning a shallow copy of the input entity. Note: It is recommended to always return a copy of your input and not modify the original.

### Usage

```js
const user = new schema.Entity('users', {}, { idAttribute: 'id_str' });
const tweet = new schema.Entity('tweets', { user: user }, { 
    idAttribute: 'id_str',
    // Apply everything from entityB over entityA, except for "favorites"
    mergeStrategy: (entityA, entityB) => ({
      ...entityA,
      ...entityB,
      favorites: entityA.favorites
    }),
    // Remove the URL field from the entity
    processStrategy: (entity) => omit(entity, 'url')
});

const normalizedData = normalize(data, tweet);
```

## `Object(definition)`

* `definition`: A definition of the nested entities found within this object. Defaults to empty object.  
You *do not* need to define any keys in your object other than those that hold other entities. All other values will be copied to the normalized output.

### Usage

```js
// Example data response
const data = { users: [ /*...*/ ] };

const user = new schema.Entity('users')
const responseSchema = new schema.Object({ users: new schema.Array(user) });
// or shorthand
const responseSchema = { users: new schema.Array(user) };

const normalizedData = normalize(data, responseSchema);
```

## `Union(definition, schemaAttribute)`

Defines an array that may contain more than one type of entity needing to be normalized.

* `definition`: An object mapping the definition of the nested entities found within the input array
* `schemaAttribute`: The attribute on each entity found that defines what schema, per the definition mapping, to use when normalizing.  
Can be a string or a function. If given a function, accepts the following arguments:  
    * `value`: The input value of the entity
    * `index`: the index at which the entity appears on the parent array.

### Usage

```js
const data = [ { id: 1, type: 'user' }, { id: 2, type: 'group' } ];

const user = new schema.Entity('users');
const group = new schema.Entity('groups');
const unionSchema = new schema.Union({
  user: user,
  group: group
}, 'type');

const normalizedData = normalize(data, unionSchema);
```

## `Values(definition, schemaAttribute)`

Defines an object whose values are entities.

* `definition`: An object mapping the definition of the nested entities found within the input array
* `schemaAttribute`: The attribute on each entity found that defines what schema, per the definition mapping, to use when normalizing.  
Can be a string or a function. If given a function, accepts the following arguments:  
    * `value`: The input value of the entity
    * `key`: the key at which the entity appears on the parent object.

### Usage

```js
const data = { firstThing: { id: 1 }, secondThing: { id: 2 } };

const item = new schema.Entity('items');
const valuesSchema = new schema.Values(item);

const normalizedData = normalize(data, valuesSchema);
```
