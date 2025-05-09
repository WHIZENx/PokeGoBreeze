import { Action } from 'redux';

export enum TimestampActionTypes {
  setTimestampGameMaster = '[Timestamp] SetTimestampGameMaster',
  setTimestampAssets = '[Timestamp] SetTimestampAssets',
  setTimestampSounds = '[Timestamp] SetTimestampSounds',
  setTimestampPVP = '[Timestamp] SetTimestampPVP',
}

export class SetTimestampGameMaster implements Action {
  readonly type = TimestampActionTypes.setTimestampGameMaster;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestampGameMaster(value);
    return {
      type,
      payload,
    };
  }
}

export class SetTimestampAssets implements Action {
  readonly type = TimestampActionTypes.setTimestampAssets;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestampAssets(value);
    return {
      type,
      payload,
    };
  }
}

export class SetTimestampSounds implements Action {
  readonly type = TimestampActionTypes.setTimestampSounds;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestampSounds(value);
    return {
      type,
      payload,
    };
  }
}

export class SetTimestampPVP implements Action {
  readonly type = TimestampActionTypes.setTimestampPVP;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestampPVP(value);
    return {
      type,
      payload,
    };
  }
}

export type TimestampActionsUnion = SetTimestampGameMaster | SetTimestampAssets | SetTimestampSounds | SetTimestampPVP;
