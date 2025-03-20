/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { IToolSearching } from '../../core/models/searching.model';
import { ISearchingModel } from '../models/searching.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IPokemonFormModify } from '../../core/models/API/form.model';
import { IPokemonDetail } from '../../core/models/API/info.model';

export enum SearchingActionTypes {
  setPokemonMainSearch = '[Searching] SetPokemonMainSearch',
  resetPokemonMainSearch = '[Searching] ResetPokemonMainSearch',
  setPokemonToolSearch = '[Searching] SetPokemonToolSearch',
  resetPokemonToolSearch = '[Searching] ResetPokemonToolSearch',
  setPokemon = '[Searching] SetPokemon',
  setPokemonForm = '[Searching] SetPokemonForm',
  setPokemonDetails = '[Searching] SetPokemonDetails',
  resetPokemon = '[Searching] ResetPokemon',
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

export class SetPokemon implements Action {
  readonly type = SearchingActionTypes.setPokemon;

  constructor(public payload: IPokemonData) {}

  static create(value: IPokemonData) {
    const { type, payload } = new SetPokemon(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPokemonForm implements Action {
  readonly type = SearchingActionTypes.setPokemonForm;

  constructor(public payload: IPokemonFormModify | undefined) {}

  static create(value: IPokemonFormModify | undefined) {
    const { type, payload } = new SetPokemonForm(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPokemonDetails implements Action {
  readonly type = SearchingActionTypes.setPokemonDetails;

  constructor(public payload: IPokemonDetail) {}

  static create(value: IPokemonDetail) {
    const { type, payload } = new SetPokemonDetails(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetPokemon implements Action {
  readonly type = SearchingActionTypes.resetPokemon;

  static create() {
    const { type } = new ResetPokemon();
    return {
      type,
    };
  }
}

export type SearchingActionsUnion =
  | SetPokemonMainSearch
  | ResetPokemonMainSearch
  | SetPokemonToolSearch
  | ResetPokemonToolSearch
  | SetPokemon
  | SetPokemonForm
  | SetPokemonDetails
  | ResetPokemon;
