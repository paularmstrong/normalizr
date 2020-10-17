export const STATE_KEY = 'repo';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.SET_REPO:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

const Action = {
  SET_REPO: 'SET_REPO',
};

export const setRepo = (slug) => {
  const [owner, repo] = slug.split('/');
  return {
    type: Action.SET_REPO,
    payload: { owner, repo },
  };
};

export const selectOwner = (state) => state[STATE_KEY].owner;
export const selectRepo = (state) => state[STATE_KEY].repo;
