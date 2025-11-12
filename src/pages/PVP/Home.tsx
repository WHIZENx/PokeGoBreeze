import React, { useEffect, useState } from 'react';
import { leaguesTeamBattle } from '../../utils/constants';
import { PVPInfo } from '../../core/models/pvp.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { getTime } from '../../utils/utils';
import { isEqual, isNotEmpty } from '../../utils/extension';
import useDataStore from '../../composables/useDataStore';
import usePVP from '../../composables/usePVP';
import useSpinner from '../../composables/useSpinner';
import useTimestamp from '../../composables/useTimestamp';
import useCombats from '../../composables/useCombats';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import ButtonGroupLeague from '../../components/Commons/Buttons/ButtonGroupLeague';
import { Skeleton } from '@mui/material';

interface IOptionsHome {
  rank?: PVPInfo;
  team?: PVPInfo;
}

class OptionsHome implements IOptionsHome {
  rank?: PVPInfo;
  team?: PVPInfo;

  static create(value: IOptionsHome) {
    const obj = new OptionsHome();
    Object.assign(obj, value);
    return obj;
  }
}

const PVPHome = () => {
  useTitle({
    title: 'PVP - Simulator',
    description:
      'Simulate Pokémon GO PVP battles with our comprehensive battle simulator. Test different teams, moves, and strategies for Great, Ultra, and Master League.',
    keywords: ['PVP simulator', 'Pokémon GO battles', 'battle simulator', 'PVP team builder', 'battle strategies'],
  });
  const { pvpData } = useDataStore();
  const { isCombatsNoneArchetype } = useCombats();
  const { loadPVP, loadPVPMoves } = usePVP();
  const { spinnerIsLoading, hideSpinner } = useSpinner();
  const { timestampPVP } = useTimestamp();

  const [options, setOptions] = useState<IOptionsHome>(new OptionsHome());

  const { rank, team } = options;

  useEffect(() => {
    loadPVP();
  }, []);

  useEffect(() => {
    if (isCombatsNoneArchetype()) {
      loadPVPMoves();
    }
    if (spinnerIsLoading) {
      hideSpinner();
    }
  }, [spinnerIsLoading, isCombatsNoneArchetype]);

  useEffect(() => {
    if (!rank && !team && isNotEmpty(pvpData.rankings) && isNotEmpty(pvpData.trains)) {
      setOptions(
        OptionsHome.create({
          rank: pvpData.rankings.at(0),
          team: pvpData.trains.at(0),
        })
      );
    }
  }, [rank, team, pvpData.rankings, pvpData.trains]);

  const renderLoading = () => {
    return (
      <div className="tw-overflow-x-hidden">
        <div className="slide-container !tw-p-0">
          <div className="slide-col !tw-flex !tw-flex-nowrap !tw-m-0 !tw-p-0 tw-gap-x-2">
            {[...Array(Math.ceil(window.innerWidth / 160)).keys()].map((_, index) => (
              <Skeleton key={index} variant="rectangular" animation="wave" height={200} width={154} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tw-container tw-mt-2 tw-pb-3">
      {timestampPVP > 0 && (
        <h4>
          <b>Updated: {getTime(timestampPVP, true)}</b>
        </h4>
      )}
      <p className="tw-text-red-600">
        <b>
          {'* Pokémon data source references from '}
          <a href="https://pvpoke.com/" target="_">
            Pvpoke
          </a>
        </b>
      </p>
      <div className="tw-flex tw-items-center tw-justify-between">
        <h1 className="tw-w-3/4 tw-block">Top Rank Pokémon Leagues</h1>
        <SelectMui
          formClassName="tw-w-1/4"
          value={rank?.id}
          onChangeSelect={(value) =>
            setOptions(
              OptionsHome.create({
                ...options,
                rank: pvpData.rankings.find((item) => isEqual(item.id, value)),
              })
            )
          }
          menuItems={pvpData.rankings.map((value) => ({
            value: value.id,
            label: value.name,
          }))}
        />
      </div>
      <ButtonGroupLeague
        height={200}
        leagues={rank?.cp}
        isLoaded={!!rank}
        loading={renderLoading()}
        data={rank}
        path="rankings"
      />
      <div className="tw-flex tw-items-center tw-justify-between">
        <h1 className="tw-w-3/4 tw-block">Top Teams Pokémon Leagues</h1>
        <SelectMui
          formClassName="tw-w-1/4"
          value={team?.id}
          onChangeSelect={(value) =>
            setOptions(
              OptionsHome.create({
                ...options,
                team: pvpData.trains.find((item) => isEqual(item.id, value)),
              })
            )
          }
          menuItems={pvpData.trains.map((value) => ({
            value: value.id,
            label: value.name,
          }))}
        />
      </div>
      <ButtonGroupLeague
        height={200}
        leagues={team?.cp}
        isLoaded={!!team}
        loading={renderLoading()}
        data={team}
        path="teams"
      />
      <h1 className="tw-flex tw-gap-2 tw-items-end">
        <span>Battle League Simulator</span>
        <span className="tw-mb-1 caption !tw-text-red-600">(Beta Test)</span>
      </h1>
      <ButtonGroupLeague
        height={200}
        leagues={leaguesTeamBattle
          .filter((value) => value.cp.length > 0)
          .map((value) => value.cp)
          .flat()}
        isLoaded={true}
        path="battle"
      />
    </div>
  );
};

export default PVPHome;
