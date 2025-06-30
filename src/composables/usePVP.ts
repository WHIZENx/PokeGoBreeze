import { useDispatch } from 'react-redux';
import { isEqual } from 'lodash';
import { PokemonPVPMove } from '../core/models/pvp.model';
import { pvpConvertPath } from '../core/pvp';
import { APIUrl } from '../services/constants';
import { APITreeRoot, APITree } from '../services/models/api.model';
import { TimestampActions, StoreActions } from '../store/actions';
import { isNotEmpty, getValueOrDefault } from '../utils/extension';
import APIService from '../services/api.service';
import useDataStore from './useDataStore';
import useTimestamp from './useTimestamp';

/**
 * Custom hook to access and update the pvp state from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data.pvp)
 *
 * @returns The pvp state and update methods
 */
export const usePVP = () => {
  const dispatch = useDispatch();
  const { getAuthorizationHeaders, pvpData } = useDataStore();
  const { timestampPVP } = useTimestamp();

  const loadPVP = () => {
    APIService.getFetchUrl<APITreeRoot[]>(APIUrl.FETCH_PVP_DATA, getAuthorizationHeaders).then((res) => {
      if (isNotEmpty(res.data)) {
        const pvpTimestamp = new Date(getValueOrDefault(String, res.data[0].commit.committer.date)).getTime();
        if (pvpTimestamp !== timestampPVP || !pvpData || !isNotEmpty(pvpData.rankings) || !isNotEmpty(pvpData.trains)) {
          const pvpUrl = res.data[0].commit.tree.url;
          if (pvpUrl) {
            APIService.getFetchUrl<APITree>(pvpUrl, getAuthorizationHeaders)
              .then((pvpRoot) => {
                const pvpRootPath = pvpRoot.data.tree.find((item) => isEqual(item.path, 'src'));
                if (pvpRootPath) {
                  return APIService.getFetchUrl<APITree>(`${pvpRootPath.url}`, getAuthorizationHeaders);
                }
              })
              .then((pvpFolder) => {
                if (!pvpFolder) {
                  return;
                }
                const pvpFolderPath = pvpFolder.data.tree.find((item) => isEqual(item.path, 'data'));
                if (pvpFolderPath) {
                  return APIService.getFetchUrl<APITree>(`${pvpFolderPath.url}?recursive=1`, getAuthorizationHeaders);
                }
              })
              .then((pvp) => {
                if (!pvp) {
                  return;
                }
                const pvpRank = pvpConvertPath(pvp.data, 'rankings/');
                const pvpTrain = pvpConvertPath(pvp.data, 'training/analysis/');

                dispatch(TimestampActions.SetTimestampPVP.create(pvpTimestamp));
                dispatch(
                  StoreActions.SetPVP.create({
                    rankings: pvpRank,
                    trains: pvpTrain,
                  })
                );
              });
          }
        }
      }
    });
  };

  const loadPVPMoves = () => {
    APIService.getFetchUrl<PokemonPVPMove[]>(APIUrl.FETCH_PVP_MOVES).then((moves) => {
      dispatch(StoreActions.SetPVPMoves.create(moves.data));
    });
  };

  return {
    pvpData,
    loadPVP,
    loadPVPMoves,
  };
};

export default usePVP;
