import { StatsModel } from '../../core/models/stats.model';
import { LOAD_STATS, RESET_STATS } from '../actions/stats.action';

const StoreReducer = (state: StatsModel | null = null, action: any) => {
  switch (action.type) {
    case LOAD_STATS:
      return action.payload;
    case RESET_STATS:
    default:
      return state;
  }
};

export default StoreReducer;
