import { ADD_ENTITIES } from '../actions';

export const STATE_KEY = 'users';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return Object.entries(action.payload.users).reduce((mergedUsers, [ id, user ]) => {
        return {
          ...mergedUsers,
          [id]: {
            ...(mergedUsers[id] || {}),
            ...user
          }
        };
      }, state);

    default:
      return state;
  }
}
