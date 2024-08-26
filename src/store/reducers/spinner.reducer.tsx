import { SpinnerActions } from '../actions';
import { SpinnerActionsUnion } from '../actions/spinner.action';

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

const SpinnerReducer = (state: SpinnerModel = initialize, action: SpinnerActionsUnion) => {
  switch (action.type) {
    case SpinnerActions.SpinnerActionTypes.showSpinner:
      return {
        ...state,
        loading: true,
        error: action.payload?.error,
      };
    case SpinnerActions.SpinnerActionTypes.showSpinnerMsg:
      return {
        ...state,
        loading: true,
        message: action.payload.message,
        error: action.payload.error,
      };
    case SpinnerActions.SpinnerActionTypes.hideSpinner:
      return {
        ...state,
        message: null,
        loading: false || (state.error ? true : false),
      };
    case SpinnerActions.SpinnerActionTypes.setBar:
      return {
        ...state,
        bar: {
          ...state.bar,
          show: action.payload,
        },
      };
    case SpinnerActions.SpinnerActionTypes.setPercent:
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
