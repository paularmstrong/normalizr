export default function reducer(state, action) {
  switch (action.type) {
    case Action.ADD_PULL_REQUESTS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_PULL_REQUESTS: 'ADD_PULL_REQUESTS'
};

export const addPullRequests = (issues) => ({
  type: Action.ADD_PULL_REQUESTS,
  payload: issues
});
