import { combineReducers } from 'redux';
import commits from './modules/commits';
import issues from './modules/issues';
import pullRequests from './modules/pull-requests';
import repos from './modules/repos';
import users from './modules/users';

const reducer = combineReducers({
  commits,
  issues,
  pullRequests,
  repos,
  users
});

export default reducer;
