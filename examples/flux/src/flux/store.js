// Flux store
//
// Requiring the Dispatcher, Constants, and
// event emitter dependencies
import * as Constants from './constants';
import AppDispatcher from './dispatchers';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

// Define the store
const _store = {
  issues: {},
  commits: {},
  repo: {}
};

// Define the public event listeners and getters that
// the views will use to listen for changes and retrieve
// the store
const FluxStore = Object.assign({}, EventEmitter.prototype, {
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
    case Constants.SET_REPO:
      _store.repo = action.response;
      FluxStore.emit(CHANGE_EVENT);
      break;
    case Constants.GET_COMMITS_RESPONSE:
      _store.commits = action.response;
      FluxStore.emit(CHANGE_EVENT);
      break;
    case Constants.GET_ISSUES_RESPONSE:
      _store.issues = action.response;
      FluxStore.emit(CHANGE_EVENT);
      break;
    default:
      return true;
  }
});

export default FluxStore;
