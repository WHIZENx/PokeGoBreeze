import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import APIService from '../../services/api.service';
import { leaguesTeamBattle } from '../../utils/constants';
import { Link } from 'react-router-dom';
import { PVPInfo } from '../../core/models/pvp.model';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../utils/compute';
import { useTitle } from '../../utils/hooks/useTitle';
import { getTime } from '../../utils/utils';
import { isEqual, isInclude, isNotEmpty } from '../../utils/extension';
import { EqualMode } from '../../utils/enums/string.enum';
import { LeagueBattleType } from '../../core/enums/league.enum';
import { BattleLeagueIconType } from '../../utils/enums/compute.enum';
import useDataStore from '../../composables/useDataStore';
import usePVP from '../../composables/usePVP';
import useSpinner from '../../composables/useSpinner';
import useTimestamp from '../../composables/useTimestamp';
import useCombats from '../../composables/useCombats';
import SelectMui from '../../components/Commons/Select/SelectMui';

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

  const renderLeagueLogo = (logo: string | undefined, cp: number) => {
    if (
      !logo ||
      (logo && isInclude(logo, BattleLeagueIconType.Little)) ||
      isInclude(logo, BattleLeagueIconType.Great) ||
      isInclude(logo, BattleLeagueIconType.Ultra) ||
      isInclude(logo, BattleLeagueIconType.Master)
    ) {
      return getPokemonBattleLeagueIcon(cp);
    }
    return APIService.getAssetPokeGo(logo);
  };

  const renderLeagueName = (name: string, cp: number) => {
    if (isEqual(name, LeagueBattleType.All, EqualMode.IgnoreCaseSensitive)) {
      return getPokemonBattleLeagueName(cp);
    }
    return name;
  };

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
      {rank ? (
        <div className="group-selected">
          {rank.cp.map((value, index) => (
            <Link key={index} to={`/pvp/rankings/${rank.id}/${value}`}>
              <Button className="btn btn-form" style={{ height: 200 }}>
                <img
                  alt="Image League"
                  title={renderLeagueName(rank.name, value)}
                  width={128}
                  height={128}
                  src={renderLeagueLogo(rank.logo, value)}
                />
                <div>
                  <b>{renderLeagueName(rank.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        renderLoading()
      )}
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
      {team ? (
        <div className="group-selected">
          {team.cp.map((value, index) => (
            <Link key={index} to={`/pvp/teams/${team.id}/${value}`}>
              <Button key={index} className="btn btn-form" style={{ height: 200 }}>
                <img
                  alt="Image League"
                  title={renderLeagueName(team.name, value)}
                  width={128}
                  height={128}
                  src={renderLeagueLogo(team.logo, value)}
                />
                <div>
                  <b>{renderLeagueName(team.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        renderLoading()
      )}
      <h1>
        Battle League Simulator <span className="d-inline-block caption text-danger">(Beta Test)</span>
      </h1>
      <div className="group-selected">
        {leaguesTeamBattle
          .filter((value) => value.cp.length > 0)
          .map((value, i) => (
            <Fragment key={i}>
              {value.cp.map((cp, index) => (
                <Link key={index} to={`/pvp/battle/${cp}`}>
                  <Button key={index} className="btn btn-form" style={{ height: 200 }}>
                    <img
                      alt="Image League"
                      title={value.name}
                      width={128}
                      height={128}
                      src={value.logo ?? getPokemonBattleLeagueIcon(cp)}
                    />
                    <div>
                      <b>{value.name}</b>
                    </div>
                    <span className="text-danger">CP below {cp}</span>
                  </Button>
                </Link>
              ))}
            </Fragment>
          ))}
      </div>
    </div>
  );
};

export default PVPHome;
