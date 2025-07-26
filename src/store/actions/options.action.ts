import { Action } from 'redux';
import { OptionDPSModel } from '../models/options.model';
import { OptionFiltersCounter } from '../../components/Commons/Tables/Counter/models/counter.model';

export enum OptionsActionTypes {
  setDpsSheetOptions = '[Options] SetDPSSheetOptions',
  setCounterOptions = '[Options] SetCounterOptions',
}

export class SetDpsSheetOptions implements Action {
  readonly type = OptionsActionTypes.setDpsSheetOptions;

  constructor(public payload: OptionDPSModel) {}

  static create(value: OptionDPSModel) {
    const { type, payload } = new SetDpsSheetOptions(value);
    return {
      type,
      payload,
    };
  }
}

export class SetCounterOptions implements Action {
  readonly type = OptionsActionTypes.setCounterOptions;

  constructor(public payload: OptionFiltersCounter) {}

  static create(value: OptionFiltersCounter) {
    const { type, payload } = new SetCounterOptions(value);
    return {
      type,
      payload,
    };
  }
}

export type OptionsActionsUnion = SetDpsSheetOptions | SetCounterOptions;
