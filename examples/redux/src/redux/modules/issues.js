import * as Repo from './repos';
import { issue } from '../../api/schema';
import { denormalize, normalize } from '../../../../../src';
import { ADD_ENTITIES, addEntities } from '../actions';

export const STATE_KEY = 'issues';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return {
        ...state,
        ...action.payload.issues
      };

    default:
      return state;
  }
}

export const getIssues = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.issues.getForRepo({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.issue ]);
    dispatch(addEntities(data.entities));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};

export const selectHydrated = (state, id) => denormalize(id, issue, state);
