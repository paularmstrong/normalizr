import { combineReducers } from 'redux';
import commits, { STATE_KEY as COMMITS_STATE_KEY } from './modules/commits';
import issues, { STATE_KEY as ISSUES_STATE_KEY } from './modules/issues';
import labels, { STATE_KEY as LABELS_STATE_KEY } from './modules/labels';
import milestones, { STATE_KEY as MILESTONES_STATE_KEY } from './modules/milestones';
import pullRequests, { STATE_KEY as PULLREQUESTS_STATE_KEY } from './modules/pull-requests';
import repos, { STATE_KEY as REPO_STATE_KEY } from './modules/repos';
import users, { STATE_KEY as USERS_STATE_KEY } from './modules/users';

const reducer = combineReducers({
  [COMMITS_STATE_KEY]: commits,
  [ISSUES_STATE_KEY]: issues,
  [LABELS_STATE_KEY]: labels,
  [MILESTONES_STATE_KEY]: milestones,
  [PULLREQUESTS_STATE_KEY]: pullRequests,
  [REPO_STATE_KEY]: repos,
  [USERS_STATE_KEY]: users
});

export default reducer;
