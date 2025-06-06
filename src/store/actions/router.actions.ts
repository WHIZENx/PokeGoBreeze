import { Location } from 'react-router-dom';
import { LocationState } from '../../core/models/router.model';

export enum RouterActionTypes {
  LOCATION_CHANGE = '@@router/LOCATION_CHANGE',
  PUSH = '@@router/PUSH',
  REPLACE = '@@router/REPLACE',
  GO = '@@router/GO',
  GO_BACK = '@@router/GO_BACK',
  GO_FORWARD = '@@router/GO_FORWARD',
}

export interface LocationChangeAction {
  type: RouterActionTypes.LOCATION_CHANGE;
  payload: Location & { state?: LocationState };
}

export interface PushAction {
  type: RouterActionTypes.PUSH;
  payload: {
    path: string;
    state?: LocationState;
  };
}

export interface ReplaceAction {
  type: RouterActionTypes.REPLACE;
  payload: {
    path: string;
    state?: LocationState;
  };
}

export interface GoAction {
  type: RouterActionTypes.GO;
  payload: number;
}

export interface GoBackAction {
  type: RouterActionTypes.GO_BACK;
}

export interface GoForwardAction {
  type: RouterActionTypes.GO_FORWARD;
}

export type RouterAction =
  | LocationChangeAction
  | PushAction
  | ReplaceAction
  | GoAction
  | GoBackAction
  | GoForwardAction;
