import { schema } from '../../src';

const userProcessStrategy = (value, parent, key) => {
  switch (key) {
    case 'author':
      return { ...value, posts: [parent.id] };
    case 'commenter':
      return { ...value, comments: [parent.id] };
    default:
      return { ...value };
  }
};

const userMergeStrategy = (entityA, entityB) => {
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
    processStrategy: (value, parent, key) => {
      return { ...value, post: parent.id };
    },
  }
);

const post = new schema.Entity('posts', {
  author: user,
  comments: [comment],
});

export default [post];
