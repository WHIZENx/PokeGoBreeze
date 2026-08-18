import { IStatsRank } from '../../core/models/stats.model';
import { StatsActions } from '../actions';
import { StatsActionsUnion } from '../actions/stats.action';

const StatsReducer = (state: IStatsRank | null = null, action: StatsActionsUnion) => {
  switch (action.type) {
    case StatsActions.StatsActionTypes.setStats:
      return action.payload;
    case StatsActions.StatsActionTypes.resetStats:
      return null;
    default:
      return state;
  }
};

export default StatsReducer;
