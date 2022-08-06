const inititaialize = {
    data: null,
    timeUpdate: new Date()
}

const GameMasterReducer = (state = inititaialize, action) => {
    switch (action.type) {
      case 'LOAD_GM':
        return {
            ...state,
            data: action.payload,
            timeUpdate: new Date()
        };
      case 'RESET_GM':
        return {
            ...state,
            data: null
        };
      default:
        return state;
    }
}

export default GameMasterReducer;