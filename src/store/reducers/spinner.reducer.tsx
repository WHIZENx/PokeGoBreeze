interface spinnerModel {
  loading: boolean;
  error: boolean;
}

const inititaialize: spinnerModel = {
  loading: false,
  error: false
}

const SpinnerReducer = (state: spinnerModel = inititaialize, action: any) => {
    switch (action.type) {
      case 'SHOW_SPINNER':
        return {
          ...state,
          loading: true,
          error: action.payload.error
        };
      case 'HIDE_SPINNER':
        return {
          ...state,
          loading: false || state.error
        };
      default:
        return state;
    }
}

export default SpinnerReducer;