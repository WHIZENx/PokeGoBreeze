import { StoreModel } from '../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const StoreReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_STORE':
      return action.payload;
    case 'RESET_STORE':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
