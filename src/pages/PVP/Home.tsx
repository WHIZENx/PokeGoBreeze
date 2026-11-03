import React, { useEffect, useState } from 'react';
import { leaguesTeamBattle } from '../../utils/constants';
import { PVPInfo } from '../../core/models/pvp.model';
import { useTitle } from '../../utils/hooks/useTitle';
import { getTime } from '../../utils/utils';
import { isEqual } from '../../utils/extension';
import useDataStore from '../../composables/useDataStore';
import useSpinner from '../../composables/useSpinner';
import useTimestamp from '../../composables/useTimestamp';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import ButtonGroupLeague from '../../components/Commons/Buttons/ButtonGroupLeague';
import { Skeleton } from '@mui/material';
import '../../components/Info/PokemonDetailLayout.scss';

const defaultSelection = '__default__';
const allSelection = '__all__';

interface IOptionsHome {
  rank: string;
  team: string;
}

class OptionsHome implements IOptionsHome {
  rank = defaultSelection;
  team = defaultSelection;

  static create(value: IOptionsHome) {
    const obj = new OptionsHome();
    Object.assign(obj, value);
    return obj;
  }
}

const getDefaultLeagueGroup = (groups: PVPInfo[]) => groups.find((item) => isEqual(item.id, 'all')) ?? groups.at(0);

const getSelectedLeagueGroups = (groups: PVPInfo[], selection: string) => {
  if (selection === allSelection) {
    return groups;
  }
  if (selection === defaultSelection) {
    const defaultGroup = getDefaultLeagueGroup(groups);
    return defaultGroup ? [defaultGroup] : [];
  }
  const selectedGroup = groups.find((item) => isEqual(item.id, selection));
  return selectedGroup ? [selectedGroup] : [];
};

const getLeagueMenuItems = (groups: PVPInfo[]) => [
  { value: defaultSelection, label: 'Default' },
  { value: allSelection, label: 'All' },
  ...groups.filter((item) => !isEqual(item.id, 'all')).map((item) => ({ value: item.id, label: item.name })),
];

const PVPHome = () => {
  useTitle({
    title: 'PVP - Simulator',
    description:
      'Simulate Pokémon GO PVP battles with our comprehensive battle simulator. Test different teams, moves, and strategies for Great, Ultra, and Master League.',
    keywords: ['PVP simulator', 'Pokémon GO battles', 'battle simulator', 'PVP team builder', 'battle strategies'],
  });
  const { pvpData } = useDataStore();
  const { spinnerIsLoading, hideSpinner } = useSpinner();
  const { timestampPVP } = useTimestamp();

  const [options, setOptions] = useState<IOptionsHome>(new OptionsHome());

  const { rank, team } = options;
  const rankLeagueGroups = getSelectedLeagueGroups(pvpData.rankings, rank);
  const teamLeagueGroups = getSelectedLeagueGroups(pvpData.trains, team);

  useEffect(() => {
    if (spinnerIsLoading) {
      hideSpinner();
    }
  }, [spinnerIsLoading, hideSpinner]);

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
    <div className="pvp-home-page tw-container tw-mt-4 tw-pb-4">
      <header className="pokemon-detail-section tw-mb-4 tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
        <div>
          <h1 className="tw-m-0">Pokémon GO PvP</h1>
          <p className="tw-mb-0 tw-mt-2 tw-text-error">
            <b>
              {'Pokémon data source references from '}
              <a href="https://pvpoke.com/" target="_">
                PvPoke
              </a>
            </b>
          </p>
        </div>
        {timestampPVP > 0 && <span className="tw-text-caption">Updated: {getTime(timestampPVP, true)}</span>}
      </header>

      <div className="tw-grid tw-grid-cols-1 tw-gap-4 xl:tw-grid-cols-2" data-testid="pvp-home-primary-sections">
        <section className="pokemon-detail-section !tw-overflow-hidden !tw-p-0">
          <div className="tw-flex tw-flex-col tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-[var(--divider)] tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between sm:tw-p-5">
            <h2 className="tw-m-0">Top Rank Pokémon Leagues</h2>
            <SelectMui
              SelectDisplayProps={{ id: 'pvp-rank-filter' }}
              formClassName="tw-w-full sm:tw-w-56"
              value={rank}
              onChangeSelect={(value) =>
                setOptions(
                  OptionsHome.create({
                    ...options,
                    rank: value,
                  })
                )
              }
              menuItems={getLeagueMenuItems(pvpData.rankings)}
            />
          </div>
          <div className="tw-p-2 sm:tw-p-3">
            <ButtonGroupLeague
              className="!tw-m-0"
              leagues={rankLeagueGroups.at(0)?.cp}
              groups={rankLeagueGroups}
              isLoaded={rankLeagueGroups.length > 0}
              loading={renderLoading()}
              data={rankLeagueGroups.at(0)}
              path="rankings"
            />
          </div>
        </section>

        <section className="pokemon-detail-section !tw-overflow-hidden !tw-p-0">
          <div className="tw-flex tw-flex-col tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-[var(--divider)] tw-p-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between sm:tw-p-5">
            <h2 className="tw-m-0">Top Teams Pokémon Leagues</h2>
            <SelectMui
              SelectDisplayProps={{ id: 'pvp-team-filter' }}
              formClassName="tw-w-full sm:tw-w-56"
              value={team}
              onChangeSelect={(value) =>
                setOptions(
                  OptionsHome.create({
                    ...options,
                    team: value,
                  })
                )
              }
              menuItems={getLeagueMenuItems(pvpData.trains)}
            />
          </div>
          <div className="tw-p-2 sm:tw-p-3">
            <ButtonGroupLeague
              className="!tw-m-0"
              leagues={teamLeagueGroups.at(0)?.cp}
              groups={teamLeagueGroups}
              isLoaded={teamLeagueGroups.length > 0}
              loading={renderLoading()}
              data={teamLeagueGroups.at(0)}
              path="teams"
            />
          </div>
        </section>
      </div>

      <section className="pokemon-detail-section !tw-overflow-hidden !tw-p-0 tw-mt-4">
        <div className="tw-flex tw-items-end tw-gap-2 tw-border-0 tw-border-b tw-border-solid tw-border-[var(--divider)] tw-p-4 sm:tw-p-5">
          <h2 className="tw-m-0">Battle League Simulator</h2>
          <span className="tw-mb-0.5 tw-text-caption !tw-text-error">(Beta Test)</span>
        </div>
        <div className="tw-p-2 sm:tw-p-3">
          <ButtonGroupLeague
            className="!tw-m-0"
            leagues={leaguesTeamBattle
              .filter((value) => value.cp.length > 0)
              .map((value) => value.cp)
              .flat()}
            isLoaded={true}
            path="battle"
          />
        </div>
      </section>
    </div>
  );
};

export default PVPHome;
