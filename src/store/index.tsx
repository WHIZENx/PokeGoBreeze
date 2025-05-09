import { legacy_createStore as createStore } from 'redux';

import { createTransform, persistReducer, persistStore } from 'redux-persist';

import { combinedReducer, devTools } from './configure';
import storage from 'redux-persist/lib/storage';

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

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
