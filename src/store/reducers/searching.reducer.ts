import { SearchingOptionsModel } from '../../core/models/searching.model';
import { SearchingActions } from '../actions';
import { SearchingActionsUnion } from '../actions/searching.action';

const initialize: SearchingOptionsModel = {
  mainSearching: null,
  toolSearching: null,
};

const SearchingReducer = (state: SearchingOptionsModel = initialize, action: SearchingActionsUnion) => {
  switch (action.type) {
    case SearchingActions.SearchingActionTypes.setPokemonMainSearch:
      return {
        ...state,
        mainSearching: action.payload,
      };
    case SearchingActions.SearchingActionTypes.resetPokemonMainSearch:
      return {
        ...state,
        mainSearching: null,
      };
    case SearchingActions.SearchingActionTypes.setPokemonToolSearch:
      return {
        ...state,
        toolSearching: action.payload,
      };
    case SearchingActions.SearchingActionTypes.resetPokemonToolSearch:
      return {
        ...state,
        toolSearching: null,
      };
    case SearchingActions.SearchingActionTypes.setMainPokemonForm:
      return {
        ...state,
        mainSearching: {
          ...state.mainSearching,
          form: action.payload,
        },
      };
    case SearchingActions.SearchingActionTypes.setMainPokemonDetails:
      return {
        ...state,
        mainSearching: {
          ...state.mainSearching,
          pokemon: action.payload,
        },
      };
    case SearchingActions.SearchingActionTypes.resetMainPokemon:
      return {
        ...state,
        mainSearching: null,
      };
    case SearchingActions.SearchingActionTypes.setToolPokemonForm:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          current: {
            ...state.toolSearching?.current,
            form: action.payload,
          },
        },
      };
    case SearchingActions.SearchingActionTypes.setToolPokemonDetails:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          current: {
            ...state.toolSearching?.current,
            pokemon: action.payload,
          },
        },
      };
    case SearchingActions.SearchingActionTypes.resetToolPokemon:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          current: null,
        },
      };
    case SearchingActions.SearchingActionTypes.setToolObjectPokemonForm:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          object: {
            ...state.toolSearching?.object,
            form: action.payload,
          },
        },
      };
    case SearchingActions.SearchingActionTypes.setToolObjectPokemonDetails:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          object: {
            ...state.toolSearching?.object,
            pokemon: action.payload,
          },
        },
      };
    case SearchingActions.SearchingActionTypes.resetToolObjectPokemon:
      return {
        ...state,
        toolSearching: {
          ...state.toolSearching,
          object: null,
        },
      };
    default:
      return state;
  }
};

export default SearchingReducer;
