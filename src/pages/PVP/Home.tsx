import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { leaguesTeamBattle } from '../../util/Constants';
import { loadPVP } from '../../store/actions/store.action';
import { useLocalStorage } from 'usehooks-ts';
import { hideSpinner } from '../../store/actions/spinner.action';
import { Link } from 'react-router-dom';
import { SpinnerState, StoreState } from '../../store/models/state.model';
import { PVPInfo } from '../../core/models/pvp.model';

// tslint:disable-next-line:class-name
interface OptionsHome {
  rank: PVPInfo | undefined;
  team: PVPInfo | undefined;
}

const PVPHome = () => {
  const dispatch = useDispatch();
  const pvp = useSelector((state: StoreState) => state.store?.data?.pvp);
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
    })
  );
  const [statePVP, setStatePVP] = useLocalStorage('pvp', null);

  const [options, setOptions]: [OptionsHome, any] = useState({
    rank: undefined,
    team: undefined,
  });

  const { rank, team } = options;

  useEffect(() => {
    document.title = 'PVP - Simulator';
  }, []);

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
    if (spinner.loading) {
      dispatch(hideSpinner());
    }
  }, [pvp, spinner]);

  useEffect(() => {
    if (!rank && !team && pvp) {
      setOptions({
        rank: pvp.rankings.at(0),
        team: pvp.trains ? pvp.trains.at(0) : undefined,
      });
    }
  }, [rank, team, pvp]);

  const renderLeagueLogo = (logo: string, cp: number) => {
    if (
      !logo ||
      (logo && logo.includes('GBL_littlecup')) ||
      logo.includes('great_league') ||
      logo.includes('ultra_league') ||
      logo.includes('master_league')
    ) {
      if (cp === 500) {
        return APIService.getPokeOtherLeague('GBL_littlecup');
      } else if (cp === 1500) {
        return APIService.getPokeLeague('great_league');
      } else if (cp === 2500) {
        return APIService.getPokeLeague('ultra_league');
      } else {
        return APIService.getPokeLeague('master_league');
      }
    }
    return APIService.getAssetPokeGo(logo);
  };

  const renderLeagueName = (name: string, cp: number) => {
    if (name === 'All') {
      if (cp === 500) {
        return 'Little Cup';
      } else if (cp === 1500) {
        return 'Great League';
      } else if (cp === 2500) {
        return 'Ultra League';
      } else {
        return 'Master League';
      }
    }
    return name;
  };

  return (
    <div className="container element-top element-bottom">
      <p className="text-danger">
        <b>
          * Pokémon data source references from{' '}
          <a href="https://pvpoke.com/" target={'_'}>
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
            setOptions({
              ...options,
              rank: pvp?.rankings.find((item) => item.id === e.target.value),
            })
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
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(rank.logo ?? '', value)} />
                <div>
                  <b>{renderLeagueName(rank.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        <div className="ph-item">
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
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
            setOptions({
              ...options,
              team: pvp?.trains.find((item) => item.id === e.target.value),
            })
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
                <img alt="img-league" width={128} height={128} src={renderLeagueLogo(team.logo ?? '', value)} />
                <div>
                  <b>{renderLeagueName(team.name, value)}</b>
                </div>
                <span className="text-danger">CP below {value}</span>
              </Button>
            </Link>
          ))}
        </div>
      ) : (
        <div className="ph-item">
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
          <div className="ph-col-3" style={{ padding: 10, margin: 0 }}>
            <div className="ph-row">
              <div className="ph-picture ph-col-3" style={{ height: 200 }} />
            </div>
          </div>
        </div>
      )}
      <h1>
        Battle League Simulator <span className="d-inline-block caption text-danger">(Beta Test)</span>
      </h1>
      <div className="group-selected">
        {leaguesTeamBattle.map((value, index) => (
          <Link key={index} to={`/pvp/battle/${value.cp}`}>
            <Button key={index} className="btn btn-form" style={{ height: 200 }}>
              <img
                alt="img-league"
                width={128}
                height={128}
                src={
                  !value.logo
                    ? value.cp === 500
                      ? APIService.getPokeOtherLeague('GBL_littlecup')
                      : value.cp === 1500
                      ? APIService.getPokeLeague('great_league')
                      : value.cp === 2500
                      ? APIService.getPokeLeague('ultra_league')
                      : APIService.getPokeLeague('master_league')
                    : value.logo
                }
              />
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
