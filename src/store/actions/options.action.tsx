/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { OptionDPSModel } from '../models/options.model';

export enum OptionsActionTypes {
  setDpsSheetOptions = 'SET_DPS_SHEET_OPTIONS',
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

export type OptionsActionsUnion = SetDpsSheetOptions;
