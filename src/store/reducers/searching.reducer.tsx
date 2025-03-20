import { SearchingOptionsModel } from '../../core/models/searching.model';
import { SearchingActions } from '../actions';
import { SearchingActionsUnion } from '../actions/searching.action';

const initialize: SearchingOptionsModel = {
  mainSearching: null,
  toolSearching: null,
  pokemonDetails: null,
  pokemon: null,
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
    case SearchingActions.SearchingActionTypes.setPokemon:
      return {
        ...state,
        pokemon: action.payload,
      };
    case SearchingActions.SearchingActionTypes.setPokemonForm:
      return {
        ...state,
        form: action.payload,
      };
    case SearchingActions.SearchingActionTypes.setPokemonDetails:
      return {
        ...state,
        pokemonDetails: action.payload,
      };
    case SearchingActions.SearchingActionTypes.resetPokemon:
      return {
        ...state,
        pokemonDetails: null,
        pokemon: null,
        form: null,
      };
    default:
      return state;
  }
};

export default SearchingReducer;
