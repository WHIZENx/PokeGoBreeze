import { legacy_createStore as createStore } from 'redux';

import { createTransform, persistReducer, persistStore } from 'redux-persist';

import { combinedReducer, devTools } from './configure';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    createTransform(
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  whitelist: ['store', 'stats', 'path', 'timestamp'],
  debounce: 1000,
};

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
