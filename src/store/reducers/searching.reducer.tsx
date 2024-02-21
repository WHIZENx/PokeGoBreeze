import { SearchingOptionsModel, ToolSearching } from '../../core/models/searching.model';
import {
  SET_POKEMON_MAIN_SEARCH,
  RESET_POKEMON_MAIN_SEARCH,
  RESET_POKEMON_TOOL_SEARCH,
  SET_POKEMON_TOOL_SEARCH,
} from '../actions/searching.action';
import { SearchingModel } from '../models/searching.model';

const initialize = {
  mainSearching: null,
  toolSearching: null,
};

const SearchingReducer = (state: SearchingOptionsModel = initialize, action: { type: string; payload: SearchingModel | ToolSearching }) => {
  switch (action.type) {
    case SET_POKEMON_MAIN_SEARCH:
      return {
        ...state,
        mainSearching: action.payload,
      };
    case RESET_POKEMON_MAIN_SEARCH:
      return {
        ...state,
        mainSearching: null,
      };
    case SET_POKEMON_TOOL_SEARCH:
      return {
        ...state,
        toolSearching: action.payload,
      };
    case RESET_POKEMON_TOOL_SEARCH:
      return {
        ...state,
        toolSearching: null,
      };
    default:
      return state;
  }
};

export default SearchingReducer;
