const inititaialize = {
    data: null,
    timestamp: new Date()
}

const StoreReducer = (state = inititaialize, action) => {
    switch (action.type) {
      case 'LOAD_STORE':
        return {
            ...state,
            data: action.payload,
            timestamp: new Date()
        };
      case 'RESET_STORE':
        return {
            ...state,
            data: null
        };
      default:
        return state;
    }
}

export default StoreReducer;