import { legacy_createStore as createStore } from 'redux';
import { createTransform, persistReducer, persistStore } from 'redux-persist';
import { combinedReducer, devTools } from './configure';
import localForage from 'localforage';
import { PersistKey } from '../util/constants';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;
const ENCRYPTION_SALT = process.env.REACT_APP_ENCRYPTION_SALT;

if (!ENCRYPTION_KEY || !ENCRYPTION_SALT) {
  throw new Error('Missing encryption key or salt');
}

localForage.config({
  name: 'PokeGoBreeze',
  storeName: 'PokeGoBreezeStore',
  description: 'Encrypted storage for PokeGoBreeze application',
});

const createEncryptionTransform = () => {
  return createTransform(
    (inboundState, key) => {
      if (!inboundState) {
        return inboundState;
      }

      try {
        const keyWithSalt = `${ENCRYPTION_KEY}${ENCRYPTION_SALT}${String(key)}`;
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(inboundState), keyWithSalt, {
          keySize: 256 / 32,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();

        return encryptedData;
      } catch (error) {
        console.error('Error encrypting state:', error);
        return JSON.stringify(inboundState);
      }
    },
    (outboundState, key) => {
      if (!outboundState) {
        return outboundState;
      }

      if (typeof outboundState !== 'string' || !outboundState.startsWith('U2F')) {
        return outboundState;
      }

      try {
        const keyWithSalt = `${ENCRYPTION_KEY}${ENCRYPTION_SALT}${String(key)}`;
        const decryptedBytes = CryptoJS.AES.decrypt(outboundState, keyWithSalt);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
          console.warn('Decryption produced empty result');
          return {};
        }

        return JSON.parse(decryptedText);
      } catch (error) {
        console.error('Error decrypting state:', error);
        return {};
      }
    }
  );
};

const sensitiveDataTransform = createTransform(
  (inboundState: object) => ({ ...inboundState, sensitiveData: undefined }),
  (outboundState: object) => ({ ...outboundState })
);

const persistConfig = {
  key: PersistKey,
  storage: localForage,
  transforms: [sensitiveDataTransform, createEncryptionTransform()],
  whitelist: ['store', 'stats', 'path', 'timestamp'],
  debounce: 1000,
};

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
