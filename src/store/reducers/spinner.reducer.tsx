import { SpinnerActions } from '../actions';
import { SpinnerActionsUnion } from '../actions/spinner.action';

export interface SpinnerModel {
  isLoading: boolean;
  bar: BarModel;
  message: string | null;
  error: ErrorModel | null;
}

interface BarModel {
  isShow: boolean;
  percent: number;
}

interface ErrorModel {
  error: boolean;
  msg: string;
}

const initialize: SpinnerModel = {
  isLoading: false,
  bar: {
    isShow: false,
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
        isLoading: true,
        error: action.payload?.error,
      };
    case SpinnerActions.SpinnerActionTypes.showSpinnerMsg:
      return {
        ...state,
        isLoading: true,
        message: action.payload.message,
        error: action.payload.error,
      };
    case SpinnerActions.SpinnerActionTypes.hideSpinner:
      return {
        ...state,
        message: null,
        isLoading: false || Boolean(state.error),
      };
    case SpinnerActions.SpinnerActionTypes.setBar:
      return {
        ...state,
        bar: {
          ...state.bar,
          isShow: action.payload,
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
