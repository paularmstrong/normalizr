// Todo store
//
// Requiring the Dispatcher, Constants, and
// event emitter dependencies
import { GET_COMMITS_RESPONSE, SET_REPO } from './constants';
import AppDispatcher from './dispatchers';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

// Define the store as an empty array
const _store = {
  commits: {},
  repo: {}
};

// Define the public event listeners and getters that
// the views will use to listen for changes and retrieve
// the store
const TodoStore = Object.assign({}, EventEmitter.prototype, {
  addChangeListener: function (cb) {
    this.on(CHANGE_EVENT, cb);
  },

  removeChangeListener: function (cb) {
    this.removeListener(CHANGE_EVENT, cb);
  },

  getState: function () {
    return _store;
  }
});

// Register each of the actions with the dispatcher
// by changing the store's data and emitting a
// change
AppDispatcher.register(function (payload) {
  const action = payload.action;

  switch (action.actionType) {
    case SET_REPO:
      _store.repo = action.response;
      TodoStore.emit(CHANGE_EVENT);
      break;
    case GET_COMMITS_RESPONSE:
      _store.commits = action.response;
      TodoStore.emit(CHANGE_EVENT);
      break;

    default:
      return true;
  }
});

export default TodoStore;
