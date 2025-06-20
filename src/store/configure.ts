import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { combineReducers, applyMiddleware, Action } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { SearchingActions, StoreActions } from './actions';
import { createRouterMiddleware } from './middleware/router.middleware';

import { legacy_createStore as createStore } from 'redux';
import { createTransform, persistReducer, persistStore } from 'redux-persist';
import localForage from 'localforage';
import { PersistTimeout, PersistKey } from '../util/constants';
import CryptoJS from 'crypto-js';
import { LocalForageConfig } from './constants/local-forage';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;
const ENCRYPTION_SALT = process.env.REACT_APP_ENCRYPTION_SALT;

if (!ENCRYPTION_KEY || !ENCRYPTION_SALT) {
  throw new Error('Missing encryption key or salt');
}

interface IAction extends Action {
  payload: object[];
}

const middleware = applyMiddleware(thunk, createRouterMiddleware(createBrowserHistory()));
const devTools =
  process.env.NODE_ENV === 'production'
    ? middleware
    : composeWithDevTools({
        maxAge: 30,
        actionsDenylist: [
          SearchingActions.SearchingActionTypes.setPokemonMainSearch,
          SearchingActions.SearchingActionTypes.setPokemonToolSearch,
          SearchingActions.SearchingActionTypes.setMainPokemonDetails,
          SearchingActions.SearchingActionTypes.setToolPokemonDetails,
          SearchingActions.SearchingActionTypes.setMainPokemonForm,
          SearchingActions.SearchingActionTypes.setToolPokemonForm,
          SearchingActions.SearchingActionTypes.setToolObjectPokemonDetails,
          SearchingActions.SearchingActionTypes.setToolObjectPokemonForm,
        ],
        actionSanitizer: <A extends Action>(action: A) => {
          if (!action) {
            return action;
          }

          const isIAction = (act: object): act is IAction => typeof act === 'object' && 'payload' in act;
          if (!isIAction(action)) {
            return action;
          }

          switch (action.type) {
            case 'persist/REHYDRATE':
              return {
                ...action,
                payload: '<<REHYDRATED_STATE>>',
              } as unknown as A;
            case StoreActions.StoreActionTypes.setPokemon:
              return {
                ...action,
                payload: `<<POKEMON_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setCombat:
              return {
                ...action,
                payload: `<<COMBAT_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setAssets:
              return {
                ...action,
                payload: `<<ASSETS_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setEvolutionChain:
              return {
                ...action,
                payload: `<<EVOLUTION_CHAINS_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setLeagues:
              return {
                ...action,
                payload: `<<LEAGUES_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setSticker:
              return {
                ...action,
                payload: `<<STICKERS_DATA: ${action.payload.length} items>>`,
              } as unknown as A;
            case StoreActions.StoreActionTypes.setPVP:
              return {
                ...action,
                payload: '<<PVP_DATA>>',
              } as unknown as A;
            default:
              return action;
          }
        },
        stateSanitizer: (state: any) => {
          if (!state) {
            return state;
          }
          const sanitized = { ...state };

          if (sanitized.store?.data) {
            sanitized.store = {
              ...sanitized.store,
              data: {
                ...sanitized.store.data,
                pokemons: `<<POKEMON_DATA: ${sanitized.store.data.pokemons?.length || 0} items>>`,
                combats: `<<COMBAT_DATA: ${sanitized.store.data.combats?.length || 0} items>>`,
                evolutionChains: `<<EVOLUTION_CHAINS: ${sanitized.store.data.evolutionChains?.length || 0} items>>`,
                assets: `<<ASSETS: ${sanitized.store.data.assets?.length || 0} items>>`,
                stickers: `<<STICKERS: ${sanitized.store.data.stickers?.length || 0} items>>`,
                leagues: `<<LEAGUES: ${sanitized.store.data.leagues?.length || 0} items>>`,
                pvp: '<<PVP_DATA>>',
              },
            };
          }

          return sanitized;
        },
        trace: false,
        traceLimit: 10,
      })(middleware);

localForage.config({
  name: LocalForageConfig.Name,
  storeName: LocalForageConfig.StoreName,
  description: LocalForageConfig.Description,
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
        // console.error('Error encrypting state:', error);
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
          // console.warn('Decryption produced empty result');
          return {};
        }

        return JSON.parse(decryptedText);
      } catch (error) {
        // console.error('Error decrypting state:', error);
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
  whitelist: ['store', 'stats', 'timestamp'],
  timeout: PersistTimeout,
};

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
