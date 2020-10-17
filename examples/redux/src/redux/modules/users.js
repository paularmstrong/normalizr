import { ADD_ENTITIES } from '../actions';
import { denormalize } from '../../../../../src';
import { user } from '../../api/schema';

export const STATE_KEY = 'users';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return Object.entries(action.payload.users).reduce((mergedUsers, [id, user]) => {
        return {
          ...mergedUsers,
          [id]: {
            ...(mergedUsers[id] || {}),
            ...user,
          },
        };
      }, state);

    default:
      return state;
  }
}

export const selectHydrated = (state, id) => denormalize(id, user, state);
