import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const CandyReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_CANDY':
      return action.payload;
    case 'RESET_CANDY':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_CANDY = 'LOAD_CANDY';
export const RESET_CANDY = 'RESET_CANDY';
export default CandyReducer;
