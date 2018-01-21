import { NEW_ITEM, SAVE_ITEM, REMOVE_ITEM } from './constants';
import AppDispatcher from './dispatchers';

export function addItem() {
  AppDispatcher.handleViewAction({
    actionType: TodoConstants.NEW_ITEM
  });
}

export function saveItem() {
  AppDispatcher.handleViewAction({
    actionType: TodoConstants.SAVE_ITEM,
    text: text
  });
}

export function removeItem() {
  AppDispatcher.handleViewAction({
    actionType: TodoConstants.REMOVE_ITEM,
    index: index
  });
}
