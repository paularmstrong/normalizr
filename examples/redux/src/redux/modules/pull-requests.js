import * as Repo from './repos';
import { pullRequest } from '../../api/schema';
import { ADD_ENTITIES, addEntities } from '../actions';
import { denormalize, normalize } from '../../../../../src';

export const STATE_KEY = 'pullRequests';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return {
        ...state,
        ...action.payload.pullRequests,
      };

    default:
      return state;
  }
}

export const getPullRequests = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.pullRequests
    .getAll({
      owner,
      repo,
    })
    .then((response) => {
      const data = normalize(response, [schema.pullRequest]);
      dispatch(addEntities(data.entities));
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const selectHydrated = (state, id) => denormalize(id, pullRequest, state);
