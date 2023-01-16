import { LOAD_STORE, RESET_STORE } from '../actions/store.action';
import { StoreModel } from '../models/store.model';

const initialize: StoreModel = {
  icon: null,
  data: null,
  searching: null,
  timestamp: null,
};

const StoreReducer = (state: StoreModel = initialize, action: any) => {
  switch (action.type) {
    case LOAD_STORE:
      return action.payload;
    case RESET_STORE:
      return {
        ...state,
        timestamp: new Date(),
      };
    default:
      return state;
  }
};

export default StoreReducer;
