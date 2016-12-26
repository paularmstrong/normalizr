import * as Repo from './repos';
import { normalize } from '../../../../../src';

export const STATE_KEY = 'milestones';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case Action.ADD_MILESTONES:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

const Action = {
  ADD_MILESTONES: 'ADD_MILESTONES'
};

export const addMilestones = (milestones = {}) => ({
  type: Action.ADD_MILESTONES,
  payload: milestones
});

export const getMilestones = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.issues.getMilestones({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.milestone ]);
    dispatch(addMilestones(data.entities.milestones));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};
