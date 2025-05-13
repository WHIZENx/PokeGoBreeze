import React, { Fragment, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { leaguesTeamBattle } from '../../util/constants';
import { loadPVP, loadPVPMoves } from '../../store/effects/store.effects';
import { Link } from 'react-router-dom';
import { SpinnerState, StoreState, TimestampState } from '../../store/models/state.model';
import { PVPInfo } from '../../core/models/pvp.model';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../util/compute';
import { useChangeTitle } from '../../util/hooks/useChangeTitle';
import { SpinnerActions } from '../../store/actions';
import { getTime } from '../../util/utils';
import { isEqual, isInclude, isNotEmpty } from '../../util/extension';
import { EqualMode } from '../../util/enums/string.enum';
import { LeagueBattleType } from '../../core/enums/league.enum';
import { BattleLeagueIconType } from '../../util/enums/compute.enum';

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
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const combat = useSelector((state: StoreState) => state.store.data.combats);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const timestamp = useSelector((state: TimestampState) => state.timestamp);

  const [options, setOptions] = useState<IOptionsHome>(new OptionsHome());

  const { rank, team } = options;

  useEffect(() => {
    loadPVP(dispatch, timestamp);
  }, []);

  useEffect(() => {
    if (isNotEmpty(combat) && combat.every((combat) => !combat.archetype)) {
      loadPVPMoves(dispatch);
    }
    if (spinner.isLoading) {
      dispatch(SpinnerActions.HideSpinner.create());
    }
  }, [spinner, combat, dispatch]);

  useEffect(() => {
    if (!rank && !team && isNotEmpty(pvp.rankings) && isNotEmpty(pvp.trains)) {
      setOptions(
        OptionsHome.create({
          rank: pvp.rankings.at(0),
          team: pvp.trains.at(0),
        })
      );
    }
  }, [rank, team, pvp.rankings, pvp.trains]);

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

  return (
    <div className="container element-top element-bottom">
      {timestamp.pvp > 0 && (
        <h4>
          <b>Updated: {getTime(timestamp.pvp, true)}</b>
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
        <Form.Select
          style={{ height: 'fit-content' }}
          className="w-25 form-control"
          value={rank?.id}
          onChange={(e) =>
            setOptions(
              OptionsHome.create({
                ...options,
                rank: pvp.rankings.find((item) => isEqual(item.id, e.target.value)),
              })
            )
          }
        >
          {pvp.rankings.map((value, index) => (
            <option key={index} value={value.id}>
              {value.name}
            </option>
          ))}
        </Form.Select>
      </div>
      {rank ? (
        <div className="group-selected">
          {rank.cp.map((value, index) => (
            <Link key={index} to={`/pvp/rankings/${rank.id}/${value}`}>
              <Button className="btn btn-form" style={{ height: 200 }}>
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(rank.logo, value)} />
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
                team: pvp.trains.find((item) => isEqual(item.id, e.target.value)),
              })
            )
          }
        >
          {pvp.trains.map((value, index) => (
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
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(team.logo, value)} />
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
          .map((value, i) => (
            <Fragment key={i}>
              {value.cp.map((cp, index) => (
                <Link key={index} to={`/pvp/battle/${cp}`}>
                  <Button key={index} className="btn btn-form" style={{ height: 200 }}>
                    <img alt="img-league" width={128} height={128} src={value.logo ?? getPokemonBattleLeagueIcon(cp)} />
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
