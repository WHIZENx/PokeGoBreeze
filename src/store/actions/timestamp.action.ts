import { Action } from 'redux';

export enum TimestampActionTypes {
  setSnapshotGeneratedAt = '[Timestamp] SetSnapshotGeneratedAt',
  setTimestampGameMaster = '[Timestamp] SetTimestampGameMaster',
  setTimestampIcon = '[Timestamp] SetTimestampIcon',
  setTimestampAssets = '[Timestamp] SetTimestampAssets',
  setTimestampSounds = '[Timestamp] SetTimestampSounds',
  setTimestampPVP = '[Timestamp] SetTimestampPVP',
}

export class SetSnapshotGeneratedAt implements Action {
  readonly type = TimestampActionTypes.setSnapshotGeneratedAt;

  constructor(public payload: string) {}

  static create(value: string) {
    const { type, payload } = new SetSnapshotGeneratedAt(value);
    return {
      type,
      payload,
    };
  }
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

export class SetTimestampIcon implements Action {
  readonly type = TimestampActionTypes.setTimestampIcon;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new SetTimestampIcon(value);
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

export type TimestampActionsUnion =
  | SetSnapshotGeneratedAt
  | SetTimestampGameMaster
  | SetTimestampIcon
  | SetTimestampAssets
  | SetTimestampSounds
  | SetTimestampPVP;
