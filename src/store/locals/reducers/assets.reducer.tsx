import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const AssetsReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_ASSETS':
      return action.payload;
    case 'RESET_ASSETS':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_ASSETS = 'LOAD_ASSETS';
export const RESET_ASSETS = 'RESET_ASSETS';
export default AssetsReducer;
