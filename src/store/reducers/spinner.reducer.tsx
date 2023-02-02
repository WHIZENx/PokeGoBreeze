import { HIDE_SPINNER, SHOW_SPINNER, SHOW_SPINNER_MSG } from '../actions/spinner.action';

interface SpinnerModel {
  loading: boolean;
  message: string | null;
  error: ErrorModel | null;
}

interface ErrorModel {
  error: boolean;
  msg: string;
}

const initialize: SpinnerModel = {
  loading: false,
  message: null,
  error: null,
};

const SpinnerReducer = (state: SpinnerModel = initialize, action: any) => {
  switch (action.type) {
    case SHOW_SPINNER:
      return {
        ...state,
        loading: true,
        error: action.payload.error,
      };
    case SHOW_SPINNER_MSG:
      return {
        ...state,
        loading: true,
        message: action.payload.message,
        error: action.payload.error,
      };
    case HIDE_SPINNER:
      return {
        ...state,
        message: null,
        loading: false || (state.error ? true : false),
      };
    default:
      return state;
  }
};

export default SpinnerReducer;
