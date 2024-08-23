/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { ToolSearching } from '../../core/models/searching.model';
import { SearchingModel } from '../models/searching.model';

export enum SearchingActionTypes {
  setPokemonMainSearch = 'SET_POKEMON_MAIN_SEARCH',
  resetPokemonMainSearch = 'RESET_POKEMON_MAIN_SEARCH',
  setPokemonToolSearch = 'SET_POKEMON_TOOL_SEARCH',
  resetPokemonToolSearch = 'RESET_POKEMON_TOOL_SEARCH',
}

export class SetPokemonMainSearch implements Action {
  readonly type = SearchingActionTypes.setPokemonMainSearch;

  constructor(public payload: SearchingModel) {}

  static create(value: SearchingModel) {
    const { type, payload } = new SetPokemonMainSearch(value);
    return {
      type,
      payload,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ResetPokemonMainSearch implements Action {
  readonly type = SearchingActionTypes.resetPokemonMainSearch;

  static create() {
    const { type } = new ResetPokemonMainSearch();
    return {
      type,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class SetPokemonToolSearch implements Action {
  readonly type = SearchingActionTypes.setPokemonToolSearch;

  constructor(public payload: ToolSearching) {}

  static create(value: ToolSearching) {
    const { type, payload } = new SetPokemonToolSearch(value);
    return {
      type,
      payload,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ResetPokemonToolSearch implements Action {
  readonly type = SearchingActionTypes.resetPokemonToolSearch;

  static create() {
    const { type } = new ResetPokemonToolSearch();
    return {
      type,
    };
  }
}

export type SearchingActionsUnion = SetPokemonMainSearch | ResetPokemonMainSearch | SetPokemonToolSearch | ResetPokemonToolSearch;
