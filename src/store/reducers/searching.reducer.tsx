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
    default:
      return state;
  }
};

export default SearchingReducer;
