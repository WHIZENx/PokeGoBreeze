import { createRouterMiddleware, createRouterReducer } from '@lagunovsky/redux-react-router';
import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import { combineReducers, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { SearchingActions, StoreActions } from './actions';

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
        actionSanitizer: (action: any) => {
          if (!action) return action;

          if (action.type === 'persist/REHYDRATE' && action.payload) {
            return {
              ...action,
              payload: '<<REHYDRATED_STATE>>',
            };
          }

          if (action.type === StoreActions.StoreActionTypes.setPokemon && action.payload) {
            return { ...action, payload: `<<POKEMON_DATA: ${action.payload.length} items>>` };
          }

          if (action.type === StoreActions.StoreActionTypes.setCombat && action.payload) {
            return { ...action, payload: `<<COMBAT_DATA: ${action.payload.length} items>>` };
          }

          if (action.type === StoreActions.StoreActionTypes.setPVP && action.payload) {
            return { ...action, payload: '<<PVP_DATA>>' };
          }

          return action;
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
                pvp: '<<PVP_DATA>>',
              },
            };
          }

          if (sanitized.searching) {
            if (sanitized.searching.mainSearching?.pokemon) {
              sanitized.searching = {
                ...sanitized.searching,
                mainSearching: {
                  ...sanitized.searching.mainSearching,
                  pokemon: '<<POKEMON_DETAILS>>',
                },
              };
            }

            if (sanitized.searching.toolSearching?.current?.pokemon) {
              sanitized.searching = {
                ...sanitized.searching,
                toolSearching: {
                  ...sanitized.searching.toolSearching,
                  current: {
                    ...sanitized.searching.toolSearching.current,
                    pokemon: '<<POKEMON_DETAILS>>',
                  },
                },
              };
            }
          }

          return sanitized;
        },
        trace: false,
        traceLimit: 10,
      })(middleware);

export const storeType = createStore(combinedReducer, devTools);
