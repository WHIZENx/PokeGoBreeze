import { SpinnerActions } from '../actions';
import { SpinnerActionsUnion } from '../actions/spinner.action';

export interface SpinnerModel {
  isLoading: boolean;
  error?: ErrorModel;
  bar: BarModel;
}

interface BarModel {
  isShow: boolean;
  percent: number;
}

export interface ErrorModel {
  isError: boolean;
  message?: string;
}

const initialize: SpinnerModel = {
  isLoading: false,
  bar: {
    isShow: false,
    percent: 0,
  },
};

const SpinnerReducer = (state: SpinnerModel = initialize, action: SpinnerActionsUnion) => {
  switch (action.type) {
    case SpinnerActions.SpinnerActionTypes.showSpinner:
      return {
        ...state,
        isLoading: true,
        error: undefined,
      };
    case SpinnerActions.SpinnerActionTypes.showSpinnerMsg:
      return {
        ...state,
        isLoading: true,
        error: action.payload,
      };
    case SpinnerActions.SpinnerActionTypes.hideSpinner:
      return {
        ...state,
        error: undefined,
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
