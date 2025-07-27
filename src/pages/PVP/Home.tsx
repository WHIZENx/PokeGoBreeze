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
      <div className="overflow-x-hidden">
        <div className="ph-item flex-nowrap w-fit-content">
          {[...Array(Math.ceil(window.innerWidth / 160)).keys()].map((_, index) => (
            <div key={index} className="ph-col-3 m-0 p-2">
              <div className="ph-row">
                <div className="ph-picture ph-col-3" style={{ height: 200, width: 154 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-2 pb-3">
      {timestampPVP > 0 && (
        <h4>
          <b>Updated: {getTime(timestampPVP, true)}</b>
        </h4>
      )}
      <p className="text-danger">
        <b>
          {'* Pokémon data source references from '}
          <a href="https://pvpoke.com/" target="_">
            Pvpoke
          </a>
        </b>
      </p>
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Rank Pokémon Leagues</h1>
        <SelectMui
          formClassName="w-25"
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
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Teams Pokémon Leagues</h1>
        <SelectMui
          formClassName="w-25"
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
      <h1>
        Battle League Simulator <span className="d-inline-block caption text-danger">(Beta Test)</span>
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
