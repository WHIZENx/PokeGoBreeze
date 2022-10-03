import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const PVPReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_PVP':
      return action.payload;
    case 'RESET_PVP':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_PVP = 'LOAD_PVP';
export const RESET_PVP = 'RESET_PVP';
export default PVPReducer;
