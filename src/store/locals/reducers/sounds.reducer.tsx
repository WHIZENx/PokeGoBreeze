import { StoreModel } from '../../models/store.model';

const inititaialize: StoreModel = {
  data: null,
  timestamp: null,
};

const SoundsReducer = (state: StoreModel = inititaialize, action: any) => {
  switch (action.type) {
    case 'LOAD_SOUNDS':
      return action.payload;
    case 'RESET_SOUNDS':
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export const LOAD_SOUNDS = 'LOAD_SOUNDS';
export const RESET_SOUNDS = 'RESET_SOUNDS';
export default SoundsReducer;
