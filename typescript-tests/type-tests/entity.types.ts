import { denormalize, normalize, schema, KeyType } from '../../src';

type User = {
  id_str: string;
  name: string;
};

type Tweet = {
  id_str: string;
  url: string;
  user: User;
};

const data = {
  /* ...*/
};
const user = new schema.Entity<User>(
  'users',
  {},
  { idAttribute: 'id_str', fallbackStrategy: (key) => ({ id_str: key, name: 'Unknown' }) }
);
const tweet = new schema.Entity(
  'tweets',
  { user: user },
  {
    idAttribute: 'id_str',
    // Apply everything from entityB over entityA, except for "favorites"
    mergeStrategy: (entityA, entityB) => ({
      ...entityA,
      ...entityB,
      favorites: entityA.favorites,
    }),
    // Remove the URL field from the entity
    processStrategy: (entity: Tweet, _parent, _key) => {
      const { url, ...entityWithoutUrl } = entity;
      return entityWithoutUrl;
    },
  }
);

const normalizedData: {result: KeyType, entities: Record<string, any>} = normalize(data, tweet);
denormalize(normalizedData.result, tweet, normalizedData.entities);
