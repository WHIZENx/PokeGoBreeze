/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { IToolSearching } from '../../core/models/searching.model';
import { ISearchingModel } from '../models/searching.model';

export enum SearchingActionTypes {
  setPokemonMainSearch = '[Searching] SetPokemonMainSearch',
  resetPokemonMainSearch = '[Searching] ResetPokemonMainSearch',
  setPokemonToolSearch = '[Searching] SetPokemonToolSearch',
  resetPokemonToolSearch = '[Searching] ResetPokemonToolSearch',
}

export class SetPokemonMainSearch implements Action {
  readonly type = SearchingActionTypes.setPokemonMainSearch;

  constructor(public payload: ISearchingModel) {}

  static create(value: ISearchingModel) {
    const { type, payload } = new SetPokemonMainSearch(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetPokemonMainSearch implements Action {
  readonly type = SearchingActionTypes.resetPokemonMainSearch;

  static create() {
    const { type } = new ResetPokemonMainSearch();
    return {
      type,
    };
  }
}

export class SetPokemonToolSearch implements Action {
  readonly type = SearchingActionTypes.setPokemonToolSearch;

  constructor(public payload: IToolSearching) {}

  static create(value: IToolSearching) {
    const { type, payload } = new SetPokemonToolSearch(value);
    return {
      type,
      payload,
    };
  }
}

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
