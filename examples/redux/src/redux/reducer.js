import { combineReducers } from 'redux';
import commits from './modules/commits';
import issues from './modules/issues';
import pullRequests from './modules/pull-requests';
import users from './modules/users';

const reducer = combineReducers({
  commits,
  issues,
  pullRequests,
  users
});

export default reducer;
