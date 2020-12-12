# API

- [normalize](#normalizedata-schema)
- [denormalize](#denormalizeinput-schema-entities)
- [schema](#schema)
  - [Array](#arraydefinition)
  - [Entity](#entitykey-definition---options--)
  - [Object](#objectdefinition)
  - [Values](#valuesdefinition)
  - [Union](#uniondefinition-schemaattribute)

## `normalize(data, schema)`

Normalizes input data per the schema definition provided.

- `data`: **required** Input JSON (or plain JS object) data that needs normalization.
- `schema`: **required** A schema definition

### Usage

```js
import { normalize, schema } from 'normalizr';

const myData = { users: [{ id: 1 }, { id: 2 }] };
const user = new schema.Entity('users');
const mySchema = { users: [user] };
const normalizedData = normalize(myData, mySchema);
```

### Output

```js
{
  result: { users: [ 1, 2 ] },
  entities: {
    users: {
      '1': { id: 1 },
      '2': { id: 2 }
    }
  }
}
```

## `denormalize(input, schema, entities)`

Denormalizes an input based on schema and provided entities from a plain object or Immutable data. The reverse of `normalize`.

_Special Note:_ Be careful with denormalization. Prematurely reverting your data to large, nested objects could cause performance impacts in React (and other) applications.

If your schema and data have recursive references, only the first instance of an entity will be given. Subsequent references will be returned as the `id` provided.

- `input`: **required** The normalized result that should be _de-normalized_. Usually the same value that was given in the `result` key of the output of `normalize`.
- `schema`: **required** A schema definition that was used to get the value for `input`.
- `entities`: **required** An object, keyed by entity schema names that may appear in the denormalized output. Also accepts an object with Immutable data.

### Usage

```js
import { denormalize, schema } from 'normalizr';

const user = new schema.Entity('users');
const mySchema = { users: [user] };
const entities = { users: { '1': { id: 1 }, '2': { id: 2 } } };
const denormalizedData = denormalize({ users: [1, 2] }, mySchema, entities);
```

### Output

```js
{
  users: [{ id: 1 }, { id: 2 }];
}
```

## `schema`

### `Array(definition)`

Creates a schema to normalize an array of schemas. If the input value is an `Object` instead of an `Array`, the normalized result will be an `Array` of the `Object`'s values.

_Note: The same behavior can be defined with shorthand syntax: `[ mySchema ]`_

- `definition`: **required** A schema that this array contains.

#### Instance Methods

- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Array` constructor. This method tends to be useful for creating circular references in schema.

#### Usage

```js
const data = [{ id: '123', name: 'Jim' }, { id: '456', name: 'Jane' }];
const userSchema = new schema.Entity('users');

const userListSchema = new schema.Array(userSchema);
// or use shorthand syntax:
const userListSchema = [userSchema];

const normalizedData = normalize(data, userListSchema);
```

#### Output

```js
{
  entities: {
    users: {
      '123': { id: '123', name: 'Jim' },
      '456': { id: '456', name: 'Jane' }
    }
  },
  result: [ '123', '456' ]
}
```

### `Entity(key, definition = {}, options = {})`

- `key`: **required** The key name under which all entities of this type will be listed in the normalized response. Must be a string name.
- `definition`: A definition of the nested entities found within this entity. Defaults to empty object.  
  You _do not_ need to define any keys in your entity other than those that hold nested entities. All other values will be copied to the normalized entity's output.
- `options`:
  - `idAttribute`: The attribute where unique IDs for each of this entity type can be found.  
    Accepts either a string `key` or a function that returns the IDs `value`. Defaults to `'id'`.  
    As a function, accepts the following arguments, in order:
    - `value`: The input value of the entity.
    - `parent`: The parent object of the input array.
    - `key`: The key at which the input array appears on the parent object.
  - `mergeStrategy(entityA, entityB)`: Strategy to use when merging two entities with the same `id` value. Defaults to merge the more recently found entity onto the previous.
  - `processStrategy(value, parent, key)`: Strategy to use when pre-processing the entity. Use this method to add extra data, defaults, and/or completely change the entity before normalization is complete. Defaults to returning a shallow copy of the input entity.  
    _Note: It is recommended to always return a copy of your input and not modify the original._  
    The function accepts the following arguments, in order:
    - `value`: The input value of the entity.
    - `parent`: The parent object of the input array.
    - `key`: The key at which the input array appears on the parent object.
  - `fallbackStrategy(key, schema)`: Strategy to use when denormalizing data structures with id references to missing entities.
    - `key`: The key at which the input array appears on the parent object.
    - `schema`: The schema of the missing entity

#### Instance Methods

- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Entity` constructor. This method tends to be useful for creating circular references in schema.

#### Instance Attributes

- `key`: Returns the key provided to the constructor.
- `idAttribute`: Returns the idAttribute provided to the constructor in options.

#### Usage

```js
const data = { id_str: '123', url: 'https://twitter.com', user: { id_str: '456', name: 'Jimmy' } };

const user = new schema.Entity('users', {}, { idAttribute: 'id_str' });
const tweet = new schema.Entity(
  'tweets',
  { user: user },
  {
    idAttribute: 'id_str',
    // Apply everything from entityB over entityA, except for "favorites"
    mergeStrategy: (entityA, entityB) => ({
      ...entityA,
      ...entityB,
      favorites: entityA.favorites
    }),
    // Remove the URL field from the entity
    processStrategy: (entity) => omit(entity, 'url')
  }
);

const normalizedData = normalize(data, tweet);
```

#### Output

```js
{
  entities: {
    tweets: { '123': { id_str: '123', user: '456' } },
    users: { '456': { id_str: '456', name: 'Jimmy' } }
  },
  result: '123'
}
```

#### `idAttribute` Usage

When passing the `idAttribute` a function, it should return the IDs value.

For Example:

```js
const data = [{ id: '1', guest_id: null, name: 'Esther' }, { id: '1', guest_id: '22', name: 'Tom' }];

const patronsSchema = new schema.Entity('patrons', undefined, {
  // idAttribute *functions* must return the ids **value** (not key)
  idAttribute: (value) => (value.guest_id ? `${value.id}-${value.guest_id}` : value.id)
});

normalize(data, [patronsSchema]);
```

#### Output

```js
{
  entities: {
    patrons: {
      '1': { id: '1', guest_id: null, name: 'Esther' },
      '1-22': { id: '1', guest_id: '22', name: 'Tom' },
    }
  },
  result: ['1', '1-22']
}
```

#### `fallbackStrategy` Usage
```js
const users = {
  '1': { id: '1', name: "Emily", requestState: 'SUCCEEDED' },
  '2': { id: '2', name: "Douglas", requestState: 'SUCCEEDED' }
};
const books = {
  '1': {id: '1', name: "Book 1", author: 1 },
  '2': {id: '2', name: "Book 2", author: 2 },
  '3': {id: '3', name: "Book 3", author: 3 }
};

const authorSchema = new schema.Entity('authors', {}, {
  fallbackStrategy: (key, schema) => {
    return {
      [schema.idAttribute]: key,
      name: 'Unknown',
      requestState: 'NONE'
    };
  }
});
const bookSchema = new schema.Entity('books', {
  author: authorSchema
});

denormalize([1, 2, 3], [bookSchema], {
  books,
  authors: users
})

```


#### Output
```js
[
  {
    id: '1', 
    name: "Book 1", 
    author: { id: '1', name: "Emily", requestState: 'SUCCEEDED' }
  },
  {
    id: '2', 
    name: "Book 2", 
    author: { id: '2', name: "Douglas", requestState: 'SUCCEEDED' },
  },
  {
    id: '3', 
    name: "Book 3", 
    author: { id: '3', name: "Unknown", requestState: 'NONE' },
  }
]

```

### `Object(definition)`

Define a plain object mapping that has values needing to be normalized into Entities. _Note: The same behavior can be defined with shorthand syntax: `{ ... }`_

- `definition`: **required** A definition of the nested entities found within this object. Defaults to empty object.  
  You _do not_ need to define any keys in your object other than those that hold other entities. All other values will be copied to the normalized output.

#### Instance Methods

- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Object` constructor. This method tends to be useful for creating circular references in schema.

#### Usage

```js
// Example data response
const data = { users: [{ id: '123', name: 'Beth' }] };

const user = new schema.Entity('users');
const responseSchema = new schema.Object({ users: new schema.Array(user) });
// or shorthand
const responseSchema = { users: new schema.Array(user) };

const normalizedData = normalize(data, responseSchema);
```

#### Output

```js
{
  entities: {
    users: { '123': { id: '123', name: 'Beth' } }
  },
  result: { users: [ '123' ] }
}
```

### `Values(definition)`

Describes a map whose values follow the given schema.

- `definition`: **required** A schema that this array contains.

#### Instance Methods

- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Values` constructor. This method tends to be useful for creating circular references in schema.

#### Usage

```js
const data = { firstThing: { id: 1 }, secondThing: { id: 2 } };

const item = new schema.Entity('items');
const valuesSchema = new schema.Values(item);

const normalizedData = normalize(data, valuesSchema);
```

#### Output

```js
{
  entities: {
    items: { '1': { id: 1 }, '2': { id: 2 } }
  },
  result: { firstThing: 1, secondThing: 2 }
}
```

### `Union(definition, schemaAttribute)`

Describe a schema which is a union of multiple schemas. This is useful if you need the polymorphic behavior.

- `definition`: **required** An object mapping the definition of the nested entities found within the input array
- `schemaAttribute`: **required** The attribute on each entity found that defines what schema, per the definition mapping, to use when normalizing.  
  Can be a string or a function. If given a function, accepts the following arguments:
  - `value`: The input value of the entity.
  - `parent`: The parent object of the input array.
  - `key`: The key at which the input array appears on the parent object.

#### Instance Methods

- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Union` constructor. This method tends to be useful for creating circular references in schema.

#### Usage

_Note: If your data returns an object that you did not provide a mapping for, the original object will be returned in the result and an entity will not be created._

```js
const data = { owner: { id: 1, type: 'user', name: 'Anne' } };

const user = new schema.Entity('users');
const group = new schema.Entity('groups');
const unionSchema = new schema.Union(
  {
    user: user,
    group: group
  },
  'type'
);

const normalizedData = normalize(data, { owner: unionSchema });
```

#### Output

```js
{
  entities: {
    users: { '1': { id: 1, type: 'user', name: 'Anne' } }
  },
  result: { owner: { id: 1, schema: 'user' } }
}
```

```js
const data = { firstThing: { id: 1, type: 1 }, secondThing: { id: 2, type: 2 } };

const item = new schema.Entity('items');
const other = new schema.Entity('others');

const unionSchema = new schema.Union(
  {
    item: item,
    other: other
  },
  (value, parent, key) => {
    if(value.type === 1){
      return 'item';
    }
    
    return 'other';
  }
);

const valuesSchema = new schema.Values(unionSchema);

const normalizedData = normalize(data, valuesSchema);
```

#### Output

```js
{
  entities: {
    items: { "1": { id: 1, type: 1 } },
    others: { "2": { id: 2, type: 2 }}
  },
  result: {
    firstThing: { id: 1, schema: "item" },
    secondThing: { id: 2, schema: "other" }
  }
}
```


```js
const data = [{ id: 1, type: 1 }, { id: 2, type: 2 } ];

const item = new schema.Entity('items');
const other = new schema.Entity('others');

const unionSchema = new schema.Union(
  {
    item: item,
    other: other
  },
  (value, parent, key) => {
    if(value.type === 1){
      return 'item';
    }
    
    return 'other';
  }
);

const valuesSchema = new schema.Array(unionSchema);

const normalizedData = normalize(data, valuesSchema);
```

#### Output

```js
{
  entities: { 
    items: { "1": { id: 1, type: 1 } },
    others: { "2": { id: 2, type: 2 } }
  },
  result: [
    { id: 1, schema: "item" },
    { id: 2, schema: "other" }
  ]
}
```
