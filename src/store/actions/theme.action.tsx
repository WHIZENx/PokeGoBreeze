/* eslint-disable no-unused-vars */
import { Action } from 'redux';

export enum ThemeActionTypes {
  setTheme = 'SET_THEME',
  resetTheme = 'RESET_THEME',
}

export class SetTheme implements Action {
  readonly type = ThemeActionTypes.setTheme;

  constructor(public payload: string) {}

  static create(value: string) {
    const { type, payload } = new SetTheme(value);
    return {
      type,
      payload,
    };
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ResetTheme implements Action {
  readonly type = ThemeActionTypes.resetTheme;

  static create() {
    const { type } = new ResetTheme();
    return {
      type,
    };
  }
}

export type ThemeActionsUnion = SetTheme | ResetTheme;
