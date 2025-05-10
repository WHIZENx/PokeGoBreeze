import { createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export const timestampPersistConfig = {
  key: 'pokego_timestamp',
  storage,
  transforms: [
    createTransform(
      // transform state to be stored
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      // transform state being rehydrated
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  whitelist: ['timestamp'],
};

export const storePersistConfig = {
  key: 'pokego_store',
  storage,
  transforms: [
    createTransform(
      // transform state to be stored
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      // transform state being rehydrated
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  whitelist: ['store'],
  debounce: 1000,
};

export const statsPersistConfig = {
  key: 'pokego_stats',
  storage,
  transforms: [
    createTransform(
      // transform state to be stored
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      // transform state being rehydrated
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  whitelist: ['stats'],
  debounce: 1000,
};

export const pathPersistConfig = {
  key: 'pokego_path',
  storage,
  transforms: [
    createTransform(
      // transform state to be stored
      (inboundState: any) => ({ ...inboundState, sensitiveData: undefined }),
      // transform state being rehydrated
      (outboundState: any) => ({ ...outboundState })
    ),
  ],
  whitelist: ['path'],
  debounce: 1000,
};
