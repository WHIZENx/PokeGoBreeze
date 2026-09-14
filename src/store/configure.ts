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
import { LocalForageConfig } from './constants/local-forage';
import { StoreState } from './models/state.model';
import { persistKey } from '../utils/helpers/options-context.helpers';

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

  const sanitized: Record<string, unknown> = {};
  Object.assign(sanitized, state);
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

const middleware = applyMiddleware(thunk, createRouterMiddleware(createBrowserHistory()));

const devTools =
  process.env.NODE_ENV === 'production'
    ? middleware
    : composeWithDevTools({
        maxAge: 30,
        actionsDenylist: UI_ACTIONS_DENYLIST,
        actionSanitizer: sanitizeActionPayload,
        stateSanitizer: sanitizeState,
        trace: false,
        traceLimit: 10,
      })(middleware);

localForage.config({
  name: LocalForageConfig.Name,
  storeName: LocalForageConfig.StoreName,
  description: LocalForageConfig.Description,
});

const sensitiveDataTransform = createTransform(
  (inboundState: object) => ({ ...inboundState, sensitiveData: undefined }),
  (outboundState: object) => ({ ...outboundState })
);

const persistConfig = {
  // The prior cache encrypted public API data with a key bundled into the app.
  // Use a new cache key so old encrypted values are never rehydrated.
  key: `${persistKey()}-v2`,
  storage: localForage,
  transforms: [sensitiveDataTransform],
  whitelist: ['store', 'stats', 'timestamp'],
  timeout: 0,
};

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

export default function configureStore() {
  const store = createStore(persistedReducer, devTools);
  const persistor = persistStore(store);
  return { store, persistor };
}
