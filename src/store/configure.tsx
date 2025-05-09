import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

export const history = createBrowserHistory();
const routerMiddleware = createRouterMiddleware(history);

export const combinedReducer = combineReducers({
  router: createRouterReducer(history),
  ...rootReducer,
});

const middleware = applyMiddleware(thunk, routerMiddleware);
export const devTools =
  process.env.NODE_ENV === 'production'
    ? middleware
    : composeWithDevTools({
        maxAge: 50,
        actionSanitizer: (action: any) =>
          action.type === 'SET_DATA' && action.payload ? { ...action, payload: '<<LARGE_PAYLOAD>>' } : action,
      })(middleware);

export const storeType = createStore(combinedReducer, devTools);
