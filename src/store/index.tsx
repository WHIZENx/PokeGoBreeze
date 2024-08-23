import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';

import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import rootReducer from './reducers';

export const history = createBrowserHistory();
const routerMiddleware = createRouterMiddleware(history);

const devTools =
  process.env.NODE_ENV === 'production'
    ? applyMiddleware(thunk, routerMiddleware)
    : composeWithDevTools(applyMiddleware(thunk, routerMiddleware));

export default function configureStore() {
  return createStore(
    combineReducers({
      router: createRouterReducer(history),
      ...rootReducer,
    }),
    devTools
  );
}
