import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { leaguesTeamBattle } from '../../util/constants';
import { loadPVP, loadPVPMoves } from '../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { Link } from 'react-router-dom';
import { SpinnerState, StoreState } from '../../store/models/state.model';
import { PVPInfo } from '../../core/models/pvp.model';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../util/compute';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { SpinnerActions } from '../../store/actions';
import { LocalStorageConfig } from '../../store/constants/localStorage';
import { LocalTimeStamp } from '../../store/models/local-storage.model';
import { getTime } from '../../util/utils';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../../util/extension';
import { EqualMode } from '../../util/enums/string.enum';
import { LeagueType } from '../../core/enums/league.enum';

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
  useChangeTitle('PVP - Simulator');
  const dispatch = useDispatch();
  const pvp = useSelector((state: StoreState) => state.store?.data?.pvp);
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store?.data?.combat));
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.TIMESTAMP, JSON.stringify(new LocalTimeStamp()));
  const [statePVP, setStatePVP] = useLocalStorage(LocalStorageConfig.PVP, '');

  const [options, setOptions] = useState<IOptionsHome>(new OptionsHome());

  const { rank, team } = options;

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
    if (isNotEmpty(combat) && combat.every((combat) => !combat.archetype)) {
      loadPVPMoves(dispatch);
    }
    if (spinner.loading) {
      dispatch(SpinnerActions.HideSpinner.create());
    }
  }, [pvp, spinner, combat, dispatch]);

  useEffect(() => {
    if (!rank && !team && pvp) {
      setOptions(
        OptionsHome.create({
          rank: pvp.rankings.at(0),
          team: pvp.trains.at(0),
        })
      );
    }
  }, [rank, team, pvp]);

  const renderLeagueLogo = (logo: string, cp: number) => {
    if (
      !logo ||
      (logo && isInclude(logo, 'GBL_littlecup')) ||
      isInclude(logo, 'great_league') ||
      isInclude(logo, 'ultra_league') ||
      isInclude(logo, 'master_league')
    ) {
      return getPokemonBattleLeagueIcon(cp);
    }
    return APIService.getAssetPokeGo(logo);
  };

  const renderLeagueName = (name: string, cp: number) => {
    if (isEqual(name, LeagueType.All, EqualMode.IgnoreCaseSensitive)) {
      return getPokemonBattleLeagueName(cp);
    }
    return name;
  };

  return (
    <div className="container element-top element-bottom">
      {stateTimestamp && JSON.parse(stateTimestamp).pvp && (
        <h4>
          <b>Updated: {getTime(JSON.parse(stateTimestamp).pvp, true)}</b>
        </h4>
      )}
      <p className="text-danger">
        <b>
          * Pokémon data source references from{' '}
          <a href="https://pvpoke.com/" target="_">
            Pvpoke
          </a>
        </b>
      </p>
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Rank Pokémon Leagues</h1>
        <Form.Select
          style={{ height: 'fit-content' }}
          className="w-25 form-control"
          value={rank?.id}
          onChange={(e) =>
            setOptions(
              OptionsHome.create({
                ...options,
                rank: pvp?.rankings.find((item) => isEqual(item.id, e.target.value)),
              })
            )
          }
        >
          {pvp?.rankings.map((value, index) => (
            <option key={index} value={value.id}>
              {value.name}
            </option>
          ))}
        </Form.Select>
      </div>
      {rank ? (
        <div className="group-selected">
          {rank.cp.map((value, index) => (
            <Link key={index} to={`/pvp/rankings/${rank.id}/${value}/overall`}>
              <Button className="btn btn-form" style={{ height: 200 }}>
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(getValueOrDefault(String, rank.logo), value)} />
                <div>
                  <b>{renderLeagueName(rank.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'hidden' }}>
          <div className="ph-item flex-nowrap" style={{ width: 'fit-content' }}>
            {[...Array(Math.ceil(window.innerWidth / 160)).keys()].map((_, index) => (
              <div key={index} className="ph-col-3" style={{ padding: 10, margin: 0 }}>
                <div className="ph-row">
                  <div className="ph-picture ph-col-3" style={{ height: 200, width: 154 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Teams Pokémon Leagues</h1>
        <Form.Select
          style={{ height: 'fit-content' }}
          className="w-25 form-control"
          value={team?.id}
          onChange={(e) =>
            setOptions(
              OptionsHome.create({
                ...options,
                team: pvp?.trains.find((item) => isEqual(item.id, e.target.value)),
              })
            )
          }
        >
          {pvp?.trains.map((value, index) => (
            <option key={index} value={value.id}>
              {value.name}
            </option>
          ))}
        </Form.Select>
      </div>
      {team ? (
        <div className="group-selected">
          {team.cp.map((value, index) => (
            <Link key={index} to={`/pvp/teams/${team.id}/${value}`}>
              <Button key={index} className="btn btn-form" style={{ height: 200 }}>
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(getValueOrDefault(String, team.logo), value)} />
                <div>
                  <b>{renderLeagueName(team.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'hidden' }}>
          <div className="ph-item flex-nowrap" style={{ width: 'fit-content' }}>
            {[...Array(Math.ceil(window.innerWidth / 160)).keys()].map((_, index) => (
              <div key={index} className="ph-col-3" style={{ padding: 10, margin: 0 }}>
                <div className="ph-row">
                  <div className="ph-picture ph-col-3" style={{ height: 200, width: 154 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h1>
        Battle League Simulator <span className="d-inline-block caption text-danger">(Beta Test)</span>
      </h1>
      <div className="group-selected">
        {leaguesTeamBattle
          .filter((value) => value.cp.length > 0)
          .map((value, index) => (
            <Link key={index} to={`/pvp/battle/${value.cp}`}>
              <Button key={index} className="btn btn-form" style={{ height: 200 }}>
                <img alt="img-league" width={128} height={128} src={!value.logo ? getPokemonBattleLeagueIcon(value.cp[0]) : value.logo} />
                <div>
                  <b>{value.name}</b>
                </div>
                <span className="text-danger">CP below {value.cp}</span>
              </Button>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default PVPHome;
