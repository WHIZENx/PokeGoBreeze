import { Middleware } from 'redux';
import { RouterActionsUnion, RouterActionTypes } from '../actions/router.action';
import { BrowserHistory } from 'history';

export const createRouterMiddleware = (history: BrowserHistory): Middleware => {
  return () => (next) => (action: RouterActionsUnion) => {
    const result = next(action);

    switch (action.type) {
      case RouterActionTypes.PUSH:
        history.push(action.payload.path, action.payload.state);
        break;
      case RouterActionTypes.REPLACE:
        history.replace(action.payload.path, action.payload.state);
        break;
      case RouterActionTypes.GO:
        history.go(action.payload);
        break;
      case RouterActionTypes.GO_BACK:
        history.back();
        break;
      case RouterActionTypes.GO_FORWARD:
        history.forward();
        break;
      default:
        break;
    }

    return result;
  };
};
