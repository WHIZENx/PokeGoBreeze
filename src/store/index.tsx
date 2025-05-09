import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import rootReducer from './reducers';

import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export const history = createBrowserHistory();
const routerMiddleware = createRouterMiddleware(history);

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    createTransform(
      // transform state to be stored
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      // transform state being rehydrated
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  blacklist: ['router', 'spinner', 'device', 'searching', 'options'],
};

const combinedReducer = combineReducers({
  router: createRouterReducer(history),
  ...rootReducer,
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

const middleware = applyMiddleware(thunk, routerMiddleware);
const devTools =
  process.env.NODE_ENV === 'production'
    ? middleware
    : composeWithDevTools({
        maxAge: 50,
        actionSanitizer: (action: any) =>
          action.type === 'SET_DATA' && action.payload ? { ...action, payload: '<<LARGE_PAYLOAD>>' } : action,
      })(middleware);

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
