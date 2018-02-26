import * as Constants from '../constants';
import AppDispatcher from '../dispatchers';

export function setRepo(slug) {
  const [ owner, repo ] = slug.split('/');
  AppDispatcher.handleViewAction({
    actionType: Constants.SET_REPO,
    response: { owner, repo }
  });
}
