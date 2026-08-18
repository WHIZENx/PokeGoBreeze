import { useSelector, useDispatch } from 'react-redux';
import { TimestampState } from '../store/models/state.model';
import {
  SetTimestampGameMaster,
  SetTimestampIcon,
  SetTimestampAssets,
  SetTimestampSounds,
  SetTimestampPVP,
} from '../store/actions/timestamp.action';
import { createProgressHelpers } from '../utils/helpers/progress-helpers';
import { useDataStore } from '../composables/useDataStore';

/**
 * Custom hook to access and update the timestamp state from Redux store
 * This replaces direct usage of useSelector((state: TimestampState) => state.timestamp)
 *
 * @returns The timestamp state and update methods
 */
export const useTimestamp = () => {
  const dispatch = useDispatch();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const { loadProcessedData } = useDataStore();

  /**
   * Update timestamp game master state in the store
   * @param newTimestamp - The new timestamp value
   */
  const setTimestampGameMaster = (newTimestamp: number) => {
    dispatch(SetTimestampGameMaster.create(newTimestamp));
  };

  /**
   * Update timestamp icon state in the store
   * @param newTimestamp - The new timestamp value
   */
  const setTimestampIcon = (newTimestamp: number) => {
    dispatch(SetTimestampIcon.create(newTimestamp));
  };

  /**
   * Update timestamp assets state in the store
   * @param newTimestamp - The new timestamp value
   */
  const setTimestampAssets = (newTimestamp: number) => {
    dispatch(SetTimestampAssets.create(newTimestamp));
  };

  /**
   * Update timestamp sounds state in the store
   * @param newTimestamp - The new timestamp value
   */
  const setTimestampSounds = (newTimestamp: number) => {
    dispatch(SetTimestampSounds.create(newTimestamp));
  };

  /**
   * Update timestamp pvp state in the store
   * @param newTimestamp - The new timestamp value
   */
  const setTimestampPVP = (newTimestamp: number) => {
    dispatch(SetTimestampPVP.create(newTimestamp));
  };

  const { errorProgress } = createProgressHelpers(dispatch);

  const loadTimestamp = async (isCurrentVersion: boolean) => {
    try {
      if (!(await loadProcessedData(isCurrentVersion))) {
        errorProgress({ isError: true, message: 'Processed data API is unavailable.' });
      }
    } catch (e) {
      errorProgress({ isError: true, message: (e as ErrorEvent).message });
    }
  };

  const timestampPVP = timestamp.pvp;
  const timestampGameMaster = timestamp.gamemaster;
  const timestampIcon = timestamp.icon;
  const timestampAssets = timestamp.assets;
  const timestampSounds = timestamp.sounds;

  return {
    timestamp,
    loadTimestamp,
    setTimestampGameMaster,
    setTimestampIcon,
    setTimestampAssets,
    setTimestampSounds,
    setTimestampPVP,
    timestampPVP,
    timestampGameMaster,
    timestampIcon,
    timestampAssets,
    timestampSounds,
  };
};

export default useTimestamp;
