const inititaialize = {
    data: null,
    timestamp: null
}

const StoreReducer = (state = inititaialize, action: any) => {
    switch (action.type) {
      case 'LOAD_STORE':
        return action.payload;
      case 'RESET_STORE':
        return {
            ...state,
            data: new Date()
        };
      default:
        return state;
    }
}

export default StoreReducer;