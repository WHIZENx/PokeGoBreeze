const SpinnerReducer = (state, action) => {
    switch (action.type) {
      case 'SHOW_SPINNER':
        return true;
      case 'HIDE_SPINNER':
        return false;
      default:
        return false;
    }
}

export default SpinnerReducer;