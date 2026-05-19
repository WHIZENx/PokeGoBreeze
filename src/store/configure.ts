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
import CryptoJS from 'crypto-js';
import { LocalForageConfig } from './constants/local-forage';
import { StoreState } from './models/state.model';
import { persistKey, persistTimeout } from '../utils/helpers/options-context.helpers';
import { BooleanType } from '../enums/type.enum';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;
const ENCRYPTION_SALT = process.env.REACT_APP_ENCRYPTION_SALT;
const REDUX_VERBOSE = process.env.REACT_APP_REDUX_VERBOSE === BooleanType.True;

if (!ENCRYPTION_KEY || !ENCRYPTION_SALT) {
  throw new Error('Missing encryption key or salt');
}

interface IAction extends Action {
  payload: object[];
}

const sanitizeActionPayload = <A extends Action>(action: A): A => {
  const isIAction = (act: object): act is IAction => typeof act === 'object' && 'payload' in act;
  if (!isIAction(action)) {
    return action;
  }

  switch (action.type) {
    case 'persist/REHYDRATE':
      return { ...action, payload: '<<REHYDRATED_STATE>>' } as unknown as A;
    case StoreActions.StoreActionTypes.setPokemon:
      return { ...action, payload: `<<POKEMON_DATA: ${action.payload.length} items>>` } as unknown as A;
    case StoreActions.StoreActionTypes.setCombat:
      return { ...action, payload: `<<COMBAT_DATA: ${action.payload.length} items>>` } as unknown as A;
    case StoreActions.StoreActionTypes.setAssets:
      return { ...action, payload: `<<ASSETS_DATA: ${action.payload.length} items>>` } as unknown as A;
    case StoreActions.StoreActionTypes.setEvolutionChain:
      return { ...action, payload: `<<EVOLUTION_CHAINS_DATA: ${action.payload.length} items>>` } as unknown as A;
    case StoreActions.StoreActionTypes.setLeagues:
      return { ...action, payload: '<<LEAGUES_DATA>>' } as unknown as A;
    case StoreActions.StoreActionTypes.setSticker:
      return { ...action, payload: `<<STICKERS_DATA: ${action.payload.length} items>>` } as unknown as A;
    case StoreActions.StoreActionTypes.setPVP:
      return { ...action, payload: '<<PVP_DATA>>' } as unknown as A;
    default:
      return action;
  }
};

const sanitizeState = <S>(state: S): S => {
  const isStoreState = (s: S | StoreState): s is StoreState => s != null && typeof s === 'object' && 'store' in s;
  if (!isStoreState(state)) {
    return state;
  }

  const sanitized = { ...state } as any;
  if (state.store?.data) {
    sanitized.store = {
      ...state.store,
      data: {
        ...state.store.data,
        pokemons: `<<POKEMON_DATA: ${state.store.data.pokemons?.length ?? 0} items>>`,
        combats: `<<COMBAT_DATA: ${state.store.data.combats?.length ?? 0} items>>`,
        evolutionChains: `<<EVOLUTION_CHAINS: ${state.store.data.evolutionChains?.length ?? 0} items>>`,
        assets: `<<ASSETS: ${state.store.data.assets?.length ?? 0} items>>`,
        stickers: `<<STICKERS: ${state.store.data.stickers?.length ?? 0} items>>`,
        leagues: `<<LEAGUES: ${state.store.data.leagues.data?.length ?? 0} items>>`,
        pvp: '<<PVP_DATA>>',
      },
    };
  }
  return sanitized as S;
};

// Intercepts large payloads in the middleware chain before they reach the DevTools
// extension message bus — this is the only way to suppress the serialization warning,
// since DevTools fires it during its own connect() broadcast, before actionSanitizer runs.
const devToolsPayloadMiddleware = REDUX_VERBOSE
  ? null
  : () => (next: (arg0: Action) => Action) => (action: Action) => next(sanitizeActionPayload(action));

const UI_ACTIONS_DENYLIST = [
  SearchingActions.SearchingActionTypes.setPokemonMainSearch,
  SearchingActions.SearchingActionTypes.setPokemonToolSearch,
  SearchingActions.SearchingActionTypes.setMainPokemonDetails,
  SearchingActions.SearchingActionTypes.setToolPokemonDetails,
  SearchingActions.SearchingActionTypes.setMainPokemonForm,
  SearchingActions.SearchingActionTypes.setToolPokemonForm,
  SearchingActions.SearchingActionTypes.setToolObjectPokemonDetails,
  SearchingActions.SearchingActionTypes.setToolObjectPokemonForm,
];

const middlewareList = devToolsPayloadMiddleware
  ? [thunk, devToolsPayloadMiddleware, createRouterMiddleware(createBrowserHistory())]
  : [thunk, createRouterMiddleware(createBrowserHistory())];

const middleware = applyMiddleware(...middlewareList);

const devTools =
  process.env.NODE_ENV === 'production'
    ? middleware
    : composeWithDevTools({
        maxAge: 30,
        actionsDenylist: UI_ACTIONS_DENYLIST,
        actionSanitizer: REDUX_VERBOSE ? sanitizeActionPayload : undefined,
        stateSanitizer: REDUX_VERBOSE ? undefined : sanitizeState,
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
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error encrypting state for key:', key, error);
        }
        return null;
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
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.warn('Decryption produced empty result for key:', key);
          }
          return {};
        }

        return JSON.parse(decryptedText);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error decrypting state for key:', key, error);
        }
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
  key: persistKey(),
  storage: localForage,
  transforms: [sensitiveDataTransform, createEncryptionTransform()],
  whitelist: ['store', 'stats', 'timestamp'],
  timeout: persistTimeout(),
};

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
