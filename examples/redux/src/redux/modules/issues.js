import * as Labels from './labels';
import * as Milestones from './milestones';
import * as Repo from './repos';
import * as Users from './users';
import { normalize } from '../../../../../src';

export const STATE_KEY = 'issues';

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

export const addIssues = (issues = {}) => ({
  type: Action.ADD_ISSUES,
  payload: issues
});

export const getIssues = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.issues.getForRepo({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.issue ]);
    dispatch(Labels.addLabels(data.entities.labels));
    dispatch(Milestones.addMilestones(data.entities.milestones));
    dispatch(Users.addUsers(data.entities.users));
    dispatch(addIssues(data.entities.issues));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};
