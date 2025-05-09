import { PathActions } from '../actions';
import { PathActionsUnion } from '../actions/path.action';

export interface PathModel {
  assets: string[];
  sounds: string[];
  pvp: string[];
}

const initialize: PathModel = {
  assets: [],
  sounds: [],
  pvp: [],
};

const PathReducer = (state: PathModel = initialize, action: PathActionsUnion) => {
  switch (action.type) {
    case PathActions.PathActionTypes.setPathAssets:
      return {
        ...state,
        assets: action.payload,
      };
    case PathActions.PathActionTypes.setPathSounds:
      return {
        ...state,
        sounds: action.payload,
      };
    case PathActions.PathActionTypes.setPathPvp:
      return {
        ...state,
        pvp: action.payload,
      };
    default:
      return state;
  }
};

export default PathReducer;
