import { RouterAction, RouterActionTypes } from '../actions/router.actions';
import { Location } from 'react-router-dom';
import { LocationState } from '../../core/models/router.model';
import { Action } from 'history';

export interface RouterState {
  location: (Location & { state?: LocationState }) | null;
  action: string | null;
}

const initialState: RouterState = {
  location: null,
  action: null,
};

const RouterReducer = (state: RouterState = initialState, action: RouterAction) => {
  switch (action.type) {
    case RouterActionTypes.LOCATION_CHANGE:
      return {
        ...state,
        location: action.payload,
        action: Action.Push,
      };
    default:
      return state;
  }
};

export default RouterReducer;
