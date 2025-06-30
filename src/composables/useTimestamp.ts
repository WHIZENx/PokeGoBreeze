import { useSelector, useDispatch } from 'react-redux';
import { TimestampState } from '../store/models/state.model';
import {
  SetTimestampGameMaster,
  SetTimestampIcon,
  SetTimestampAssets,
  SetTimestampSounds,
  SetTimestampPVP,
} from '../store/actions/timestamp.action';
import { toNumber } from 'lodash';
import { APIUrl } from '../services/constants';
import { APITreeRoot } from '../services/models/api.model';
import { SpinnerActions } from '../store/actions';
import { isNotEmpty } from '../utils/extension';
import APIService from '../services/api.service';
import { useDataStore } from '../composables/useDataStore';
import { Timestamp } from '../store/models/timestamp.model';

/**
 * Custom hook to access and update the timestamp state from Redux store
 * This replaces direct usage of useSelector((state: TimestampState) => state.timestamp)
 *
 * @returns The timestamp state and update methods
 */
export const useTimestamp = () => {
  const dispatch = useDispatch();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const { getAuthorizationHeaders, loadPokeGOLogo, loadGameMaster, loadAssets } = useDataStore();
  const { pokemonsData } = useDataStore();

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

  const loadTimestamp = async (isCurrentVersion: boolean) => {
    await Promise.all([
      APIService.getFetchUrl<string>(APIUrl.TIMESTAMP),
      APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_ICON_SHA, getAuthorizationHeaders),
      APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_POKEMON_SHA, getAuthorizationHeaders),
      APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_POKEGO_IMAGES_SOUND_SHA, getAuthorizationHeaders),
    ])
      .then(async ([GMtimestamp, iconRoot, imageRoot, soundsRoot]) => {
        const timestampGameMaster = toNumber(GMtimestamp.data);
        if (isNotEmpty(iconRoot.data) && isNotEmpty(imageRoot.data) && isNotEmpty(soundsRoot.data)) {
          const iconTimestamp = new Date(iconRoot.data[0].commit.committer.date).getTime();
          const imageTimestamp = new Date(imageRoot.data[0].commit.committer.date).getTime();
          const soundTimestamp = new Date(soundsRoot.data[0].commit.committer.date).getTime();

          if (timestamp.icon === 0 || timestamp.icon !== iconTimestamp) {
            const url = iconRoot.data[0].url;
            loadPokeGOLogo(url, iconTimestamp);
          }
          dispatch(SpinnerActions.SetPercent.create(15));

          const timestampLoaded: Timestamp = {
            isCurrentVersion,
            isCurrentGameMaster: timestampGameMaster > 0 && timestamp.gamemaster === timestampGameMaster,
            isCurrentImage: timestamp.assets > 0 && timestamp.assets === imageTimestamp,
            isCurrentSound: timestamp.sounds > 0 && timestamp.sounds === soundTimestamp,
            gamemasterTimestamp: timestampGameMaster,
            assetsTimestamp: imageTimestamp,
            soundsTimestamp: soundTimestamp,
          };
          dispatch(SpinnerActions.SetPercent.create(40));

          if (!timestampLoaded.isCurrentGameMaster || !timestampLoaded.isCurrentVersion) {
            await loadGameMaster(imageRoot.data, soundsRoot.data, timestampLoaded);
          } else if (!timestampLoaded.isCurrentImage || !timestampLoaded.isCurrentSound) {
            await loadAssets(imageRoot.data, soundsRoot.data, pokemonsData, timestampLoaded);
          } else {
            dispatch(SpinnerActions.SetPercent.create(100));
            setTimeout(() => dispatch(SpinnerActions.SetBar.create(false)), 500);
          }
        }
      })
      .catch((e: ErrorEvent) => {
        dispatch(SpinnerActions.SetBar.create(false));
        dispatch(
          SpinnerActions.ShowSpinnerMsg.create({
            isError: true,
            message: e.message,
          })
        );
      });
  };

  const timestampPVP = timestamp?.pvp;
  const timestampGameMaster = timestamp?.gamemaster;
  const timestampIcon = timestamp?.icon;
  const timestampAssets = timestamp?.assets;
  const timestampSounds = timestamp?.sounds;

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
