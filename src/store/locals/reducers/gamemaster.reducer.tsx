import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const GameMasterReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_GM':
      return action.payload;
    case 'RESET_GM':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_GM = 'LOAD_GM';
export const RESET_GM = 'RESET_GM';
export default GameMasterReducer;
