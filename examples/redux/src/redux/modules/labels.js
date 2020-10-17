import * as Repo from './repos';
import { label } from '../../api/schema';
import { ADD_ENTITIES, addEntities } from '../actions';
import { denormalize, normalize } from '../../../../../src';

export const STATE_KEY = 'labels';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case ADD_ENTITIES:
      return {
        ...state,
        ...action.payload.labels,
      };

    default:
      return state;
  }
}

export const getLabels = ({ page = 0 } = {}) => (dispatch, getState, { api, schema }) => {
  const state = getState();
  const owner = Repo.selectOwner(state);
  const repo = Repo.selectRepo(state);
  return api.issues
    .getLabels({
      owner,
      repo,
    })
    .then((response) => {
      const data = normalize(response, [schema.label]);
      dispatch(addEntities(data.entities));
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const selectHydrated = (state, id) => denormalize(id, label, state);
