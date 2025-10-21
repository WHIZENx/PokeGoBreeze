import { useSelector, useDispatch } from 'react-redux';
import { StatsState } from '../store/models/state.model';
import { SetStats } from '../store/actions/stats.action';
import { IPokemonData } from '../core/models/pokemon.model';

/**
 * Custom hook to access and update the stats state from Redux store
 * This replaces direct usage of useSelector((state: StatsState) => state.stats)
 *
 * @returns The stats state and update methods
 */
export const useStats = () => {
  const dispatch = useDispatch();
  const statsData = useSelector((state: StatsState) => state.stats);

  /**
   * Update stats state in the store
   * @param stats - The new stats state
   */
  const setStats = (stats: IPokemonData[]) => {
    dispatch(SetStats.create(stats));
  };

  return {
    statsData,
    setStats,
  };
};

export default useStats;
