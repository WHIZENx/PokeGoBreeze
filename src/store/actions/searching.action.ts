import { Action } from 'redux';
import { IToolSearching } from '../../core/models/searching.model';
import { ISearchingModel } from '../models/searching.model';
import { IPokemonFormModify } from '../../core/models/API/form.model';
import { IPokemonDetail } from '../../core/models/API/info.model';

export enum SearchingActionTypes {
  setPokemonMainSearch = '[Searching] SetPokemonMainSearch',
  resetPokemonMainSearch = '[Searching] ResetPokemonMainSearch',
  setPokemonToolSearch = '[Searching] SetPokemonToolSearch',
  resetPokemonToolSearch = '[Searching] ResetPokemonToolSearch',
  setMainPokemonForm = '[Searching] SetMainPokemonForm',
  setMainPokemonDetails = '[Searching] SetMainPokemonDetails',
  resetMainPokemon = '[Searching] ResetMainPokemon',
  setToolPokemonForm = '[Searching] SetToolPokemonForm',
  setToolPokemonDetails = '[Searching] SetToolPokemonDetails',
  resetToolPokemon = '[Searching] ResetToolPokemon',
  setToolObjectPokemonForm = '[Searching] SetToolObjectPokemonForm',
  setToolObjectPokemonDetails = '[Searching] SetToolObjectPokemonDetails',
  resetToolObjectPokemon = '[Searching] ResetToolObjectPokemon',
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

export class SetMainPokemonForm implements Action {
  readonly type = SearchingActionTypes.setMainPokemonForm;

  constructor(public payload: IPokemonFormModify | undefined) {}

  static create(value: IPokemonFormModify | undefined) {
    const { type, payload } = new SetMainPokemonForm(value);
    return {
      type,
      payload,
    };
  }
}

export class SetMainPokemonDetails implements Action {
  readonly type = SearchingActionTypes.setMainPokemonDetails;

  constructor(public payload: IPokemonDetail) {}

  static create(value: IPokemonDetail) {
    const { type, payload } = new SetMainPokemonDetails(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetMainPokemon implements Action {
  readonly type = SearchingActionTypes.resetMainPokemon;

  static create() {
    const { type } = new ResetMainPokemon();
    return {
      type,
    };
  }
}

export class SetToolPokemonForm implements Action {
  readonly type = SearchingActionTypes.setToolPokemonForm;

  constructor(public payload: IPokemonFormModify | undefined) {}

  static create(value: IPokemonFormModify | undefined) {
    const { type, payload } = new SetToolPokemonForm(value);
    return {
      type,
      payload,
    };
  }
}

export class SetToolPokemonDetails implements Action {
  readonly type = SearchingActionTypes.setToolPokemonDetails;

  constructor(public payload: IPokemonDetail) {}

  static create(value: IPokemonDetail) {
    const { type, payload } = new SetToolPokemonDetails(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetToolPokemon implements Action {
  readonly type = SearchingActionTypes.resetToolPokemon;

  static create() {
    const { type } = new ResetToolPokemon();
    return {
      type,
    };
  }
}

export class SetToolObjectPokemonForm implements Action {
  readonly type = SearchingActionTypes.setToolObjectPokemonForm;

  constructor(public payload: IPokemonFormModify | undefined) {}

  static create(value: IPokemonFormModify | undefined) {
    const { type, payload } = new SetToolObjectPokemonForm(value);
    return {
      type,
      payload,
    };
  }
}

export class SetToolObjectPokemonDetails implements Action {
  readonly type = SearchingActionTypes.setToolObjectPokemonDetails;

  constructor(public payload: IPokemonDetail) {}

  static create(value: IPokemonDetail) {
    const { type, payload } = new SetToolObjectPokemonDetails(value);
    return {
      type,
      payload,
    };
  }
}

export class ResetToolObjectPokemon implements Action {
  readonly type = SearchingActionTypes.resetToolObjectPokemon;

  static create() {
    const { type } = new ResetToolObjectPokemon();
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
  | SetMainPokemonForm
  | SetMainPokemonDetails
  | ResetMainPokemon
  | SetToolPokemonForm
  | SetToolPokemonDetails
  | ResetToolPokemon
  | SetToolObjectPokemonForm
  | SetToolObjectPokemonDetails
  | ResetToolObjectPokemon;
