import { normalize, schema } from '../../src';

const userProcessStrategy = (value: any, parent: any, key: string) => {
  switch (key) {
    case 'author':
      return { ...value, posts: [parent.id] };
    case 'commenter':
      return { ...value, comments: [parent.id] };
    default:
      return { ...value };
  }
};

const userMergeStrategy = (entityA: any, entityB: any) => {
  return {
    ...entityA,
    ...entityB,
    posts: [...(entityA.posts || []), ...(entityB.posts || [])],
    comments: [...(entityA.comments || []), ...(entityB.comments || [])],
  };
};

const user = new schema.Entity(
  'users',
  {},
  {
    mergeStrategy: userMergeStrategy,
    processStrategy: userProcessStrategy,
  }
);

const comment = new schema.Entity(
  'comments',
  {
    commenter: user,
  },
  {
    processStrategy: (value: any, parent: any, _key: string) => {
      return { ...value, post: parent.id };
    },
  }
);

const post = new schema.Entity('posts', {
  author: user,
  comments: [comment],
});

const data = {
  /* ...*/
};
const normalizedData = normalize(data, post);
console.log(normalizedData);
