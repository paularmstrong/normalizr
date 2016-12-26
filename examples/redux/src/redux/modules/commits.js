export default function reducer(state, action) {
  switch (action.type) {
    case Action.ADD_COMMENTS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_COMMENTS: 'ADD_COMMENTS'
};

export const addComments = (issues) => ({
  type: Action.ADD_COMMENTS,
  payload: issues
});
