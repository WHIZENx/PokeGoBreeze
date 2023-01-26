import { HIDE_SPINNER, SHOW_SPINNER } from '../actions/spinner.action';

interface SpinnerModel {
  loading: boolean;
  error: ErrorModel | null;
}

interface ErrorModel {
  error: boolean;
  msg: string;
}

const initialize: SpinnerModel = {
  loading: false,
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
    case HIDE_SPINNER:
      return {
        ...state,
        loading: false || (state.error ? true : false),
      };
    default:
      return state;
  }
};

export default SpinnerReducer;
