import { Action } from 'redux';

export enum PathActionTypes {
  setPathAssets = '[Path] SetPathAssets',
  setPathSounds = '[Path] SetPathSounds',
  setPathPvp = '[Path] SetPathPvp',
}

export class SetPathAssets implements Action {
  readonly type = PathActionTypes.setPathAssets;

  constructor(public payload: string[]) {}

  static create(value: string[]) {
    const { type, payload } = new SetPathAssets(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPathSounds implements Action {
  readonly type = PathActionTypes.setPathSounds;

  constructor(public payload: string[]) {}

  static create(value: string[]) {
    const { type, payload } = new SetPathSounds(value);
    return {
      type,
      payload,
    };
  }
}

export class SetPathPvp implements Action {
  readonly type = PathActionTypes.setPathPvp;

  constructor(public payload: string[]) {}

  static create(value: string[]) {
    const { type, payload } = new SetPathPvp(value);
    return {
      type,
      payload,
    };
  }
}

export type PathActionsUnion = SetPathAssets | SetPathSounds | SetPathPvp;
