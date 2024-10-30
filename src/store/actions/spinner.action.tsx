/* eslint-disable no-unused-vars */
import { Action } from 'redux';
import { ErrorModel } from '../reducers/spinner.reducer';

export enum SpinnerActionTypes {
  showSpinner = '[Spinner] ShowSpinner',
  showSpinnerMsg = '[Spinner] ShowSpinnerMsg',
  hideSpinner = '[Spinner] HideSpinner',
  setBar = '[Spinner] SetBar',
  setPercent = '[Spinner] SetPercent',
}

export class ShowSpinner implements Action {
  readonly type = SpinnerActionTypes.showSpinner;

  static create() {
    const { type } = new ShowSpinner();
    return {
      type,
    };
  }
}

export class ShowSpinnerMsg implements Action {
  readonly type = SpinnerActionTypes.showSpinnerMsg;

  constructor(public payload: ErrorModel) {}

  static create(value: ErrorModel) {
    const { type, payload } = new ShowSpinnerMsg(value);
    return {
      type,
      payload,
    };
  }
}

export class HideSpinner implements Action {
  readonly type = SpinnerActionTypes.hideSpinner;

  static create() {
    const { type } = new HideSpinner();
    return {
      type,
    };
  }
}

export class SetBar implements Action {
  readonly type = SpinnerActionTypes.setBar;

  constructor(public payload: boolean) {}

  static create(value: boolean) {
    const { type, payload } = new SetBar(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPercent implements Action {
  readonly type = SpinnerActionTypes.setPercent;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetPercent(value);
    return {
      type,
      payload,
    };
  }
}

export type SpinnerActionsUnion = ShowSpinner | ShowSpinnerMsg | HideSpinner | SetBar | SetPercent;
