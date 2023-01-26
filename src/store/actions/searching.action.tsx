import { SearchingModel } from '../models/searching.model';

export const SET_POKEMON_MAIN_SEARCH = 'SET_POKEMON_MAIN_SEARCH';
export const RESET_POKEMON_MAIN_SEARCH = 'RESET_POKEMON_MAIN_SEARCH';

export const SET_POKEMON_TOOL_SEARCH = 'SET_POKEMON_TOOL_SEARCH';
export const RESET_POKEMON_TOOL_SEARCH = 'RESET_POKEMON_TOOL_SEARCH';

export const setSearchMainPage = (payload: SearchingModel) => ({
  type: SET_POKEMON_MAIN_SEARCH,
  payload,
});

export const resetSearchMainPage = () => ({
  type: RESET_POKEMON_MAIN_SEARCH,
});

export const setSearchToolPage = (payload: SearchingModel) => ({
  type: SET_POKEMON_TOOL_SEARCH,
  payload,
});

export const resetSearchToolPage = () => ({
  type: RESET_POKEMON_TOOL_SEARCH,
});
