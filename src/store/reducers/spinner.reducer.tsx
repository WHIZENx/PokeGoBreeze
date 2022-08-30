const SpinnerReducer = (state = false, action: any) => {
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