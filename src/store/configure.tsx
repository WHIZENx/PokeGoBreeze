import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { combineReducers, applyMiddleware, createStore, Action } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { SearchingActions, StoreActions } from './actions';

interface IAction extends Action {
  payload: object[];
}

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
          if (!action) return action;

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
          if (!state) return state;
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

export const storeType = createStore(combinedReducer, devTools);
