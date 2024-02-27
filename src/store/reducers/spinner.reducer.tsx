import { HIDE_SPINNER, SET_BAR, SET_PERCENT, SHOW_SPINNER, SHOW_SPINNER_MSG } from '../actions/spinner.action';

export interface SpinnerModel {
  loading: boolean;
  bar: {
    show: boolean;
    percent: number;
  };
  message: string | null;
  error: ErrorModel | null;
}

interface ErrorModel {
  error: boolean;
  msg: string;
}

const initialize: SpinnerModel = {
  loading: false,
  bar: {
    show: false,
    percent: 0,
  },
  message: null,
  error: null,
};

const SpinnerReducer = (state: SpinnerModel = initialize, action: { type: string; payload: SpinnerModel }) => {
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
    case SET_BAR:
      return {
        ...state,
        bar: {
          ...state.bar,
          show: action.payload,
        },
      };
    case SET_PERCENT:
      return {
        ...state,
        bar: {
          ...state.bar,
          percent: action.payload,
        },
      };
    default:
      return state;
  }
};

export default SpinnerReducer;
