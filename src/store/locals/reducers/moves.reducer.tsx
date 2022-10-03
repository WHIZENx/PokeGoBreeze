import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const MovesReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_MOVES':
      return action.payload;
    case 'RESET_MOVES':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_MOVES = 'LOAD_MOVES';
export const RESET_MOVES = 'RESET_MOVES';
export default MovesReducer;
