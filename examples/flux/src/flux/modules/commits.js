import * as Constants from '../constants';
import AppDispatcher from '../dispatchers';
import store from '../store';
import api from '../../api';
import { normalize } from '../../../../../src';
import { commit } from '../../api/schema';

export function receiveCommits(payload) {
  AppDispatcher.handleServerAction({
    actionType: Constants.GET_COMMITS_RESPONSE,
    response: payload.commits
  });
}

export function getCommits() {
  AppDispatcher.handleViewAction({
    actionType: Constants.GET_COMMITS
  });

  // read from the store
  const state = store.getState();

  api.repos
    .getCommits(state.repo)
    .then((response) => {
      const data = normalize(response, [ commit ]);
      receiveCommits(data.entities);
    })
    .catch((error) => {
      console.error(error);
    });
}
