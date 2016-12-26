export const STATE_KEY = 'users';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.ADD_USERS:
      return Object.entries(action.payload).reduce((mergedUsers, [ id, user ]) => {
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

const Action = {
  ADD_USERS: 'ADD_USERS'
};

export const addUsers = (users = {}) => ({
  type: Action.ADD_USERS,
  payload: users
});
