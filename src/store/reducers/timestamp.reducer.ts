import { TimestampActions } from '../actions';
import { TimestampActionsUnion } from '../actions/timestamp.action';

export interface TimestampModel {
  snapshotGeneratedAt: string;
  gamemaster: number;
  icon: number;
  assets: number;
  sounds: number;
  pvp: number;
}

const initialize: TimestampModel = {
  snapshotGeneratedAt: '',
  gamemaster: 0,
  icon: 0,
  assets: 0,
  sounds: 0,
  pvp: 0,
};

const TimestampReducer = (state: TimestampModel = initialize, action: TimestampActionsUnion) => {
  switch (action.type) {
    case TimestampActions.TimestampActionTypes.setSnapshotGeneratedAt:
      return {
        ...state,
        snapshotGeneratedAt: action.payload,
      };
    case TimestampActions.TimestampActionTypes.setTimestampGameMaster:
      return {
        ...state,
        gamemaster: action.payload,
      };
    case TimestampActions.TimestampActionTypes.setTimestampIcon:
      return {
        ...state,
        icon: action.payload,
      };
    case TimestampActions.TimestampActionTypes.setTimestampAssets:
      return {
        ...state,
        assets: action.payload,
      };
    case TimestampActions.TimestampActionTypes.setTimestampSounds:
      return {
        ...state,
        sounds: action.payload,
      };
    case TimestampActions.TimestampActionTypes.setTimestampPVP:
      return {
        ...state,
        pvp: action.payload,
      };
    default:
      return state;
  }
};

export default TimestampReducer;
