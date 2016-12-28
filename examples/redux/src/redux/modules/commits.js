import * as Repo from './repos';
import { normalize } from '../../../../../src';
import { ADD_ENTITIES, addEntities } from '../actions';

export const STATE_KEY = 'commits';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return {
        ...state,
        ...action.payload.commits
      };

    default:
      return state;
  }
}

export const getCommits = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.repos.getCommits({
    owner,
    repo
  }).then((response) => {
    const data = normalize(response, [ schema.commit ]);
    dispatch(addEntities(data.entities));
    return response;
  }).catch((error) => {
    console.error(error);
  });
};
