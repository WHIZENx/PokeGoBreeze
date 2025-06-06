import { RouterChange, RouterModify } from '../../core/models/router.model';

export enum RouterActionTypes {
  LOCATION_CHANGE = '@@router/LOCATION_CHANGE',
  PUSH = '@@router/PUSH',
  REPLACE = '@@router/REPLACE',
  GO = '@@router/GO',
  GO_BACK = '@@router/GO_BACK',
  GO_FORWARD = '@@router/GO_FORWARD',
}

export class LocationChangeAction {
  readonly type = RouterActionTypes.LOCATION_CHANGE;

  constructor(public payload: RouterChange) {}

  static create(value: RouterChange) {
    const { type, payload } = new LocationChangeAction(value);
    return {
      type,
      payload,
    };
  }
}

export class PushAction {
  readonly type = RouterActionTypes.PUSH;

  constructor(public payload: RouterModify) {}

  static create(value: RouterModify) {
    const { type, payload } = new PushAction(value);
    return {
      type,
      payload,
    };
  }
}

export class ReplaceAction {
  readonly type = RouterActionTypes.REPLACE;

  constructor(public payload: RouterModify) {}

  static create(value: RouterModify) {
    const { type, payload } = new ReplaceAction(value);
    return {
      type,
      payload,
    };
  }
}

export class GoAction {
  readonly type = RouterActionTypes.GO;

  constructor(public payload: number) {}

  static create(value: number) {
    const { type, payload } = new GoAction(value);
    return {
      type,
      payload,
    };
  }
}

export class GoBackAction {
  readonly type = RouterActionTypes.GO_BACK;

  static create() {
    const { type } = new GoBackAction();
    return {
      type,
    };
  }
}

export class GoForwardAction {
  readonly type = RouterActionTypes.GO_FORWARD;

  static create() {
    const { type } = new GoForwardAction();
    return {
      type,
    };
  }
}

export type RouterActionsUnion =
  | LocationChangeAction
  | PushAction
  | ReplaceAction
  | GoAction
  | GoBackAction
  | GoForwardAction;
