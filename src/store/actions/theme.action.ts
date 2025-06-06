import { Action } from 'redux';

export enum ThemeActionTypes {
  setTheme = '[Theme] SetTheme',
  resetTheme = '[Theme] ResetTheme',
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
