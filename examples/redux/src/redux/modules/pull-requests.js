import * as Labels from './labels';
import * as Milestones from './milestones';
import * as Repo from './repos';
import * as Users from './users';
import { normalize } from '../../../../../src';

export const STATE_KEY = 'pullRequests';

export default function reducer(state = {}, action) {
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

export const addPullRequests = (pullRequests = {}) => ({
  type: Action.ADD_PULL_REQUESTS,
  payload: pullRequests
});

export const getPullRequests = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.pullRequests.getAll({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.pullRequest ]);
    dispatch(Labels.addLabels(data.entities.labels));
    dispatch(Milestones.addMilestones(data.entities.milestones));
    dispatch(Users.addUsers(data.entities.users));
    dispatch(addPullRequests(data.entities.pullRequests));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};
