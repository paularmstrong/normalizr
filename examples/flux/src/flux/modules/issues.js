import * as Constants from '../constants';
import AppDispatcher from '../dispatchers';
import store from '../store';
import api from '../../api';
import { normalize } from '../../../../../src';
import { issue } from '../../api/schema';

export function receiveIssues(payload) {
  AppDispatcher.handleServerAction({
    actionType: Constants.GET_ISSUES_RESPONSE,
    response: payload.issues
  });
}

export function getIssues() {
  AppDispatcher.handleViewAction({
    actionType: Constants.GET_ISSUES
  });

  // read from the store
  const state = store.getState();

  api.issues
    .getForRepo(state.repo)
    .then((response) => {
      const data = normalize(response, [ issue ]);
      receiveIssues(data.entities);
    })
    .catch((error) => {
      console.error(error);
    });
}
