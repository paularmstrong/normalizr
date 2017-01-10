import { denormalize, normalize, schema } from '../../../index';

type User = {
  id_str: string,
  name: string
};

type Tweet = {
  id_str: string,
  url: string,
  user: User
};


const data = { /*...*/ };
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
    processStrategy: (entity: Tweet, parent, key) => {
      const {url, ...entityWithoutUrl} = entity;
      return entityWithoutUrl;
    }
});

const normalizedData = normalize(data, tweet);
const denormalizedData = denormalize(normalizedData.result, tweet, normalizedData.entities);
