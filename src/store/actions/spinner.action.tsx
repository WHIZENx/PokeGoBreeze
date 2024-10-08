/* eslint-disable no-unused-vars */
import { Action } from 'redux';

interface Spinner {
  message?: string;
  error?: any;
}

export enum SpinnerActionTypes {
  showSpinner = 'SHOW_SPINNER',
  showSpinnerMsg = 'SHOW_SPINNER_MSG',
  hideSpinner = 'HIDE_SPINNER',
  setBar = 'SET_BAR',
  setPercent = 'SET_PERCENT',
}

export class ShowSpinner implements Action {
  readonly type = SpinnerActionTypes.showSpinner;

  constructor(public payload?: Spinner) {}

  static create(value?: Spinner) {
    const { type, payload } = new ShowSpinner(value);
    return {
      type,
      payload,
    };
  }
}

export class ShowSpinnerMsg implements Action {
  readonly type = SpinnerActionTypes.showSpinnerMsg;

  constructor(public payload: Spinner) {}

  static create(value: Spinner) {
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
