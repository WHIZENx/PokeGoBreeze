const StoreReducer = (state = null, action: any) => {
  switch (action.type) {
    case 'LOAD_STATS':
      return action.payload;
    case 'RESET_STATS':
    default:
      return state;
  }
};

export default StoreReducer;