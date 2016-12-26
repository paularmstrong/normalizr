import * as Repo from './repos';
import { normalize } from '../../../../../src';

export const STATE_KEY = 'labels';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.ADD_LABELS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_LABELS: 'ADD_LABELS'
};

export const addLabels = (labels = {}) => ({
  type: Action.ADD_LABELS,
  payload: labels
});

export const getLabels = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.issues.getLabels({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.label ]);
    dispatch(addLabels(data.entities.labels));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};
