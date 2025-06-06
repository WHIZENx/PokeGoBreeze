import { RouterActionsUnion, RouterActionTypes } from '../actions/router.action';
import { RouterLocation } from '../../core/models/router.model';
import { Action } from 'history';

export interface RouterModel {
  location: RouterLocation;
  action: Action | null;
}

const initialState: RouterModel = {
  location: null,
  action: null,
};

const RouterReducer = (state: RouterModel = initialState, action: RouterActionsUnion) => {
  switch (action.type) {
    case RouterActionTypes.LOCATION_CHANGE:
      return {
        ...state,
        location: action.payload.location,
        action: action.payload.action,
      };
    default:
      return state;
  }
};

export default RouterReducer;
