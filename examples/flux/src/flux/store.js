// Todo store
//
// Requiring the Dispatcher, Constants, and
// event emitter dependencies
import { NEW_ITEM, SAVE_ITEM, REMOVE_ITEM } from './constants';
import AppDispatcher from './dispatchers';
import { EventEmitter } from 'events';

const CHANGE_EVENT = 'change';

// Define the store as an empty array
const _store = {
  list: [],
  editing: false
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

  getList: function () {
    return _store;
  }
});

// Register each of the actions with the dispatcher
// by changing the store's data and emitting a
// change
AppDispatcher.register(function (payload) {
  const action = payload.action;

  switch (action.actionType) {
    case NEW_ITEM:
      // Add the data defined in the TodoActions
      // which the View will pass as a payload
      _store.editing = true;
      TodoStore.emit(CHANGE_EVENT);
      break;

    case SAVE_ITEM:
      // Add the data defined in the TodoActions
      // which the View will pass as a payload
      _store.list.push(action.text);
      _store.editing = false;
      TodoStore.emit(CHANGE_EVENT);
      break;

    case REMOVE_ITEM:
      // View should pass the text's index that
      // needs to be removed from the store
      _store.list.splice(action.index, 1);
      TodoStore.emit(CHANGE_EVENT);
      break;

    default:
      return true;
  }
});

export default TodoStore;
