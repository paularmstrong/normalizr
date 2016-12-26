export default function reducer(state, action) {
  switch (action.type) {
    case Action.ADD_USERS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_USERS: 'ADD_USERS'
};

export const addUsers = (issues) => ({
  type: Action.ADD_USERS,
  payload: issues
});
