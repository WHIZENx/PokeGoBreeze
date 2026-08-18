import { Store } from '../models/store.model';
import { StoreActions } from '../actions';
import { StoreActionsUnion } from '../actions/store.action';

const initialize = new Store();

const StoreReducer = (state = initialize, action: StoreActionsUnion) => {
  switch (action.type) {
    case StoreActions.StoreActionTypes.getStore:
      return state;
    case StoreActions.StoreActionTypes.setCPM:
      return {
        ...state,
        data: {
          ...state.data,
          cpm: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setLogoPokeGO:
      return {
        ...state,
        icon: action.payload.replace('Images/App Icons/', '').replace('.png', ''),
      };
    case StoreActions.StoreActionTypes.setOptions:
      return {
        ...state,
        data: {
          ...state.data,
          options: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setPokemon:
      return {
        ...state,
        data: {
          ...state.data,
          pokemons: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setSticker:
      return {
        ...state,
        data: {
          ...state.data,
          stickers: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setCombat:
      return {
        ...state,
        data: {
          ...state.data,
          combats: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setEvolutionChain:
      return {
        ...state,
        data: {
          ...state.data,
          evolutionChains: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setInformation:
      return {
        ...state,
        data: {
          ...state.data,
          information: {
            data: action.payload,
            isLoaded: true,
          },
        },
      };
    case StoreActions.StoreActionTypes.setAssets:
      return {
        ...state,
        data: {
          ...state.data,
          assets: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setLeagues:
      return {
        ...state,
        data: {
          ...state.data,
          leagues: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setTrainers:
      return {
        ...state,
        data: {
          ...state.data,
          trainers: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.setPVP:
      return {
        ...state,
        data: {
          ...state.data,
          pvp: action.payload,
        },
      };
    case StoreActions.StoreActionTypes.resetStore:
      return {
        ...initialize,
        timestamp: new Date().getTime(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
