import { Middleware } from 'redux';
import { RouterActionTypes } from '../actions/router.actions';
import { BrowserHistory } from 'history';

export const createRouterMiddleware = (history: BrowserHistory): Middleware => {
  return () => (next) => (action) => {
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
