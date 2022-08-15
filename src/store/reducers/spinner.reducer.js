const SpinnerReducer = (state = false, action) => {
    switch (action.type) {
      case 'SHOW_SPINNER':
        return true;
      case 'HIDE_SPINNER':
        return false;
      default:
        return state;
    }
}

export default SpinnerReducer;