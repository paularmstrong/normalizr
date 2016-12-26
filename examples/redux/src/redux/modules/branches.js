export default function reducer(state, action) {
  switch (action.type) {
    case Action.ADD_BRANCHES:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_BRANCHES: 'ADD_BRANCHES'
};

export const addBranches = (issues) => ({
  type: Action.ADD_BRANCHES,
  payload: issues
});
