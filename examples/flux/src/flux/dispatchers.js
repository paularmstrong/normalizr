import { Dispatcher } from 'flux';
const AppDispatcher = new Dispatcher();

AppDispatcher.handleViewAction = function (action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
};

AppDispatcher.handleServerAction = function (action) {
  this.dispatch({
    source: 'SERVER_ACTION',
    action: action
  });
};

export default AppDispatcher;
