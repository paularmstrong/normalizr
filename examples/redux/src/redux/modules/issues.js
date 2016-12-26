export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.ADD_ISSUES:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_ISSUES: 'ADD_ISSUES'
};

export const addIssues = (issues) => ({
  type: Action.ADD_ISSUES,
  payload: issues
});
