import * as schema from '../api/schema';
import api from '../api';
import reducer from './reducer';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore } from 'redux';

export default createStore(reducer, applyMiddleware(thunk.withExtraArgument({ api, schema })));
