interface SpinnerModel {
  loading: boolean;
  error: ErrorModel | null;
}

interface ErrorModel {
  error: boolean;
  msg: string;
}

const inititaialize: SpinnerModel = {
  loading: false,
  error: null,
};

const SpinnerReducer = (state: SpinnerModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'SHOW_SPINNER':
      return {
        ...state,
        loading: true,
        error: action.payload.error,
      };
    case 'HIDE_SPINNER':
      return {
        ...state,
        loading: false || state.error,
      };
    default:
      return state;
  }
};

export default SpinnerReducer;
