import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { RootStateOrAny, useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { leaguesTeamBattle } from '../../util/Constants';

const PVPHome = () => {
  const pvp = useSelector((state: RootStateOrAny) => state.store.data.pvp);

  const [options, setOptions] = useState({
    rank: pvp.rankings[0],
    team: pvp.trains[0],
  });

  const { rank, team } = options;

  useEffect(() => {
    document.title = 'PVP - Simulator';
  }, []);

  const renderLeagueLogo = (logo: string | string[], cp: number) => {
    if (
      !logo ||
      (logo && logo.includes('GBL_littlecup')) ||
      logo.includes('great_league') ||
      logo.includes('ultra_league') ||
      logo.includes('master_league')
    ) {
      if (cp === 500) return APIService.getPokeOtherLeague('GBL_littlecup');
      else if (cp === 1500) return APIService.getPokeLeague('great_league');
      else if (cp === 2500) return APIService.getPokeLeague('ultra_league');
      else return APIService.getPokeLeague('master_league');
    }
    return APIService.getAssetPokeGo(logo);
  };

  const renderLeagueName = (name: string, cp: number) => {
    if (name === 'All') {
      if (cp === 500) return 'Little Cup';
      else if (cp === 1500) return 'Great League';
      else if (cp === 2500) return 'Ultra League';
      else return 'Master League';
    }
    return name;
  };

  return (
    <div className="container element-top element-bottom">
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Rank Pokémon Leagues</h1>
        <Form.Select
          style={{ height: 'fit-content' }}
          className="w-25 form-control"
          value={rank.id}
          onChange={(e) =>
            setOptions({
              ...options,
              rank: pvp.rankings.find((item: { id: string }) => item.id === e.target.value),
            })
          }
        >
          {pvp.rankings.map(
            (
              value: {
                id: any;
                name: any;
              },
              index: React.Key
            ) => (
              <option key={index} value={value.id}>
                {value.name}
              </option>
            )
          )}
        </Form.Select>
      </div>
      <div className="group-selected">
        {rank.cp.map((value: number, index: React.Key) => (
          <Button
            key={index}
            className="btn btn-form"
            style={{ height: 200 }}
            target="_blank"
            href={`/pvp/rankings/${rank.id}/${value}/overall`}
          >
            <img alt="img-league" width={128} height={128} src={renderLeagueLogo(rank.logo, value)} />
            <div>
              <b>{renderLeagueName(rank.name, value)}</b>
            </div>
            <span className="text-danger">CP below {value}</span>
          </Button>
        ))}
      </div>
      <div className="d-flex align-items-center justify-content-between">
        <h1 className="w-75 d-block">Top Teams Pokémon Leagues</h1>
        <Form.Select
          style={{ height: 'fit-content' }}
          className="w-25 form-control"
          value={team.id}
          onChange={(e) =>
            setOptions({
              ...options,
              team: pvp.trains.find((item: { id: string }) => item.id === e.target.value),
            })
          }
        >
          {pvp.trains.map(
            (
              value: {
                id: any;
                name: any;
              },
              index: React.Key
            ) => (
              <option key={index} value={value.id}>
                {value.name}
              </option>
            )
          )}
        </Form.Select>
      </div>
      <div className="group-selected">
        {team.cp.map((value: number, index: React.Key) => (
          <Button key={index} className="btn btn-form" style={{ height: 200 }} target="_blank" href={`/pvp/teams/${team.id}/${value}`}>
            <img alt="img-league" width={128} height={128} src={renderLeagueLogo(team.logo, value)} />
            <div>
              <b>{renderLeagueName(team.name, value)}</b>
            </div>
            <span className="text-danger">CP below {value}</span>
          </Button>
        ))}
      </div>
      <h1>
        Battle League Simulator <span className="d-inline-block caption text-danger">(Beta Test)</span>
      </h1>
      <div className="group-selected">
        {leaguesTeamBattle.map((value, index) => (
          <Button key={index} className="btn btn-form" style={{ height: 200 }} target="_blank" href={`/pvp/battle/${value.cp}`}>
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
        ))}
      </div>
    </div>
  );
};

export default PVPHome;
