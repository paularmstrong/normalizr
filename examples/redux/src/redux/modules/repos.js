export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.SET_REPO:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  SET_REPO: 'SET_REPO'
};

export const setRepo = (repo) => ({
  type: Action.SET_REPO,
  payload: { repo }
});
