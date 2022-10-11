import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';

import pokemonData from '../../../data/pokemon.json';
import {
  convertName,
  convertNameRankingToForm,
  convertNameRankingToOri,
  findMoveTeam,
  getStyleSheet,
  splitAndCapitalize,
} from '../../../util/Utils';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import { calculateStatsByTag } from '../../../util/Calculate';
import { Accordion } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import Type from '../../../components/Sprites/Type/Type';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import Error from '../../Error/Error';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';

const TeamPVP = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: RootStateOrAny) => state.store.data);
  const params: any = useParams();

  const [rankingData, setRankingData]: any = useState(null);
  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: RootStateOrAny) => state.stats);
  const [sortedBy, setSortedBy] = useState('teamScore');
  const [sorted, setSorted]: any = useState(1);

  const [sortedTeamBy, setSortedTeamBy] = useState('teamScore');
  const [sortedTeam, setSortedTeam]: any = useState(1);

  const [found, setFound] = useState(true);
  const styleSheet: any = useRef(null);

  const mappingPokemonData = useCallback(
    (data: { split: (arg0: string) => [any, any] }) => {
      const [speciesId, moveSet] = data.split(' ');
      const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
      const pokemon: any = Object.values(pokemonData).find((pokemon: { slug: string }) => pokemon.slug === name);
      const id = pokemon.num;
      const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.name);

      const stats = calculateStatsByTag(pokemon.baseStats, pokemon.slug);

      if (!styleSheet.current) styleSheet.current = getStyleSheet('background-color', `.${pokemon.types[0].toLowerCase()}`);

      let combatPoke = dataStore.pokemonCombat.filter(
        (item: { id: any; baseSpecies: string }) =>
          item.id === pokemon.num &&
          item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
      );

      const result = combatPoke.find((item: { name: string }) => item.name === convertName(pokemon.name));
      if (!result) {
        if (combatPoke) combatPoke = combatPoke[0];
        else combatPoke = combatPoke.find((item: { baseSpecies: string }) => item.baseSpecies === convertName(pokemon.name));
      } else combatPoke = result;

      let fmove: any, cmovePri: { name: any }, cmoveSec: { name: any }, cmove;
      if (moveSet.includes('+')) {
        [fmove, cmove] = moveSet.split('+');
        [cmovePri, cmoveSec] = cmove.split('/');
      } else {
        [fmove, cmovePri, cmoveSec] = moveSet.split('/');
      }

      const fastMoveSet = combatPoke.quickMoves.concat(combatPoke.eliteQuickMoves);
      const chargedMoveSet = combatPoke.cinematicMoves
        .concat(combatPoke.eliteCinematicMoves)
        .concat(combatPoke.shadowMoves)
        .concat(combatPoke.purifiedMoves);
      fmove = dataStore.combat.find((item: { name: any }) => item.name === findMoveTeam(fmove, fastMoveSet));
      cmovePri = dataStore.combat.find((item: { name: any }) => item.name === findMoveTeam(cmovePri, chargedMoveSet));
      if (cmoveSec) cmoveSec = dataStore.combat.find((item: { name: any }) => item.name === findMoveTeam(cmoveSec, chargedMoveSet));

      return {
        id,
        name,
        speciesId,
        pokemonData: pokemon,
        form,
        stats,
        atk: statsRanking.attack.ranking.find((i: { attack: number }) => i.attack === stats.atk),
        def: statsRanking.defense.ranking.find((i: { defense: number }) => i.defense === stats.def),
        sta: statsRanking.stamina.ranking.find((i: { stamina: number }) => i.stamina === stats.sta),
        fmove,
        cmovePri,
        cmoveSec,
        combatPoke,
        shadow: speciesId.includes('shadow'),
        purified:
          (cmovePri && combatPoke.purifiedMoves.includes(cmovePri.name)) || (cmoveSec && combatPoke.purifiedMoves.includes(cmoveSec.name)),
      };
    },
    [dataStore]
  );

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    const fetchPokemon = async () => {
      dispatch(showSpinner());
      try {
        const cp = parseInt(params.cp);
        const file = (
          await axios.getFetchUrl(axios.getTeamFile('analysis', params.serie, cp), {
            cancelToken: source.token,
          })
        ).data;
        if (params.serie === 'all')
          document.title = `PVP Teams - ${
            cp === 500 ? 'Little Cup' : cp === 1500 ? 'Great League' : cp === 2500 ? 'Ultra League' : 'Master League'
          }`;
        else
          document.title = `PVP Teams - ${
            params.serie === 'remix'
              ? cp === 500
                ? 'Little Cup '
                : cp === 1500
                ? 'Great League '
                : cp === 2500
                ? 'Ultra League '
                : 'Master League '
              : ''
          }
                    ${splitAndCapitalize(params.serie, '-', ' ')}`;

        const performersTotalGames = file.performers.reduce((p: any, c: { games: any }) => p + c.games, 0);
        const teamsTotalGames = file.teams.reduce((p: any, c: { games: any }) => p + c.games, 0);

        file.performers = file.performers.map((item: { pokemon: any }) => {
          return {
            ...item,
            ...mappingPokemonData(item.pokemon),
            performersTotalGames,
          };
        });

        file.teams = file.teams.map((item: { team: string }) => {
          const teams = item.team.split('|');
          const teamsData: {
            id: any;
            name: string;
            speciesId: any;
            pokemonData: any;
            form: any;
            stats: { atk: number; def: number; sta: number };
            atk: { id: any; form: string; attack: any; rank: number } | undefined;
            def: { id: any; form: string; defense: any; rank: number } | undefined;
            sta: { id: any; form: string; stamina: any; rank: number } | undefined;
            fmove: any;
            cmovePri: any;
            cmoveSec: any;
            combatPoke: any;
            shadow: any;
            purified: any;
          }[] = [];
          teams.forEach((value: any) => {
            teamsData.push(mappingPokemonData(value));
          });
          return {
            ...item,
            teamsTotalGames,
            teamData: teamsData,
          };
        });
        setRankingData(file);
        dispatch(hideSpinner());
      } catch (e: any) {
        source.cancel();
        setFound(false);
        dispatch(
          showSpinner({
            error: true,
            msg: e.message,
          })
        );
      }
    };
    fetchPokemon();

    return () => {
      source.cancel();
      if (dataStore.spinner) dispatch(hideSpinner());
    };
  }, [dispatch, params.cp, params.serie, dataStore.spinner, mappingPokemonData]);

  const renderLeague = () => {
    const cp = parseInt(params.cp);
    const league = dataStore.pvp.trains.find((item: { id: any; cp: number[] }) => item.id === params.serie && item.cp.includes(cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center element-top" style={{ columnGap: 10 }}>
            <img
              alt="img-league"
              width={64}
              height={64}
              src={
                !league.logo
                  ? cp === 500
                    ? APIService.getPokeOtherLeague('GBL_littlecup')
                    : cp === 1500
                    ? APIService.getPokeLeague('great_league')
                    : cp === 2500
                    ? APIService.getPokeLeague('ultra_league')
                    : APIService.getPokeLeague('master_league')
                  : APIService.getAssetPokeGo(league.logo)
              }
            />
            <h2>
              <b>
                {league.name === 'All'
                  ? cp === 500
                    ? 'Little Cup'
                    : cp === 1500
                    ? 'Great league'
                    : cp === 2500
                    ? 'Ultra league'
                    : 'Master league'
                  : league.name}
              </b>
            </h2>
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!found ? (
        <Error />
      ) : (
        <Fragment>
          {rankingData && (
            <div className="container pvp-container element-bottom">
              {renderLeague()}
              <hr />
              <h2>Top Performer Pokémon</h2>
              <div className="input-group border-input">
                <input
                  type="text"
                  className="form-control input-search"
                  placeholder="Enter Name or ID"
                  value={search}
                  onInput={(e: any) => setSearch(e.target.value)}
                />
              </div>
              <div className="ranking-container card-container">
                <div className="ranking-group w-100 ranking-header" style={{ columnGap: '1rem' }}>
                  <div className="ranking-score text-black">Pokémon</div>
                  <div className="d-flex" style={{ marginRight: 15, columnGap: 30 }}>
                    <div
                      className="text-center"
                      style={{ width: 'max-content' }}
                      onClick={() => {
                        setSortedBy('teamScore');
                        if (sortedBy === 'teamScore') setSorted(!sorted);
                      }}
                    >
                      <span className={'ranking-sort ranking-score' + (sortedBy === 'teamScore' ? ' ranking-selected' : '')}>
                        Team Score
                        {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </span>
                    </div>
                    <div
                      className="text-center"
                      style={{ width: 'max-content' }}
                      onClick={() => {
                        setSortedBy('individualScore');
                        if (sortedBy === 'individualScore') setSorted(!sorted);
                      }}
                    >
                      <span className={'ranking-sort ranking-score' + (sortedBy === 'individualScore' ? ' ranking-selected' : '')}>
                        Individual Score
                        {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </span>
                    </div>
                    <div
                      className="text-center"
                      style={{ width: 'max-content' }}
                      onClick={() => {
                        setSortedBy('games');
                        if (sortedBy === 'games') setSorted(!sorted);
                      }}
                    >
                      <span className={'ranking-sort ranking-score' + (sortedBy === 'games' ? ' ranking-selected' : '')}>
                        Usage
                        {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </span>
                    </div>
                  </div>
                </div>
                {rankingData.performers
                  .filter((pokemon: { name: string }) =>
                    splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase())
                  )
                  .sort((a: { [x: string]: number }, b: { [x: string]: number }) =>
                    sorted ? b[sortedBy] - a[sortedBy] : a[sortedBy] - b[sortedBy]
                  )
                  .map((value: any, index: React.Key | null | undefined) => (
                    <div
                      className="d-flex align-items-center card-ranking"
                      key={index}
                      style={{
                        columnGap: '1rem',
                        backgroundImage: computeBgType(value.pokemonData.types, value.shadow, value.purified, 1, styleSheet.current),
                      }}
                    >
                      <Link to={`/pvp/${params.cp}/overall/${value.speciesId.replaceAll('_', '-')}`} target="_blank">
                        <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
                      </Link>
                      <div className="d-flex justify-content-center">
                        <span className="position-relative filter-shadow" style={{ width: 96 }}>
                          {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                          {value.purified && (
                            <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                          )}
                          <img
                            alt="img-league"
                            className="pokemon-sprite"
                            src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}
                          />
                        </span>
                      </div>
                      <div className="ranking-group w-100" style={{ columnGap: 15 }}>
                        <div>
                          <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
                            <b className="text-white text-shadow">{splitAndCapitalize(value.name, '-', ' ')}</b>
                            <Type hideText={true} block={true} shadow={true} height={20} color={'white'} arr={value.pokemonData.types} />
                          </div>
                          <div className="d-flex" style={{ columnGap: 10 }}>
                            <TypeBadge
                              grow={true}
                              find={true}
                              title="Fast Move"
                              color={'white'}
                              move={value.fmove}
                              elite={value.combatPoke.eliteQuickMoves.includes(value.fmove.name)}
                            />
                            <TypeBadge
                              grow={true}
                              find={true}
                              title="Primary Charged Move"
                              color={'white'}
                              move={value.cmovePri}
                              elite={value.combatPoke.eliteCinematicMoves.includes(value.cmovePri.name)}
                              shadow={value.combatPoke.shadowMoves.includes(value.cmovePri.name)}
                              purified={value.combatPoke.purifiedMoves.includes(value.cmovePri.name)}
                            />
                            {value.cmoveSec && (
                              <TypeBadge
                                grow={true}
                                find={true}
                                title="Secondary Charged Move"
                                color={'white'}
                                move={value.cmoveSec}
                                elite={value.combatPoke.eliteCinematicMoves.includes(value.cmoveSec.name)}
                                shadow={value.combatPoke.shadowMoves.includes(value.cmoveSec.name)}
                                purified={value.combatPoke.purifiedMoves.includes(value.cmoveSec.name)}
                              />
                            )}
                          </div>
                        </div>
                        <div className="d-flex filter-shadow align-items-center" style={{ marginRight: 35, columnGap: 30 }}>
                          <div className="text-center" style={{ width: 120 }}>
                            <span className="ranking-score score-ic">{value.teamScore}</span>
                          </div>
                          <div className="text-center" style={{ width: 160 }}>
                            <span className="ranking-score score-ic">{value.individualScore}</span>
                          </div>
                          <div style={{ width: 'fit-content' }} className="text-center ranking-score score-ic">
                            {((value.games * 100) / value.performersTotalGames).toFixed(2)}
                            <span className="caption text-black">
                              {value.games}/{value.performersTotalGames}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <hr />
              <h2>Top Team Pokémon</h2>
              <div className="d-grid ranking-container">
                <div className="ranking-group w-100 ranking-header" style={{ columnGap: '1rem' }}>
                  <div className="ranking-score">Team</div>
                  <div className="d-flex" style={{ marginRight: 20, columnGap: 60 }}>
                    <div
                      className="text-center"
                      style={{ width: 'max-content' }}
                      onClick={() => {
                        setSortedTeamBy('teamScore');
                        if (sortedTeamBy === 'teamScore') setSortedTeam(!sortedTeam);
                      }}
                    >
                      <span className={'ranking-sort ranking-score' + (sortedTeamBy === 'teamScore' ? ' ranking-selected' : '')}>
                        Team Score
                        {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </span>
                    </div>
                    <div
                      className="text-center"
                      style={{ width: 'max-content' }}
                      onClick={() => {
                        setSortedTeamBy('games');
                        if (sortedTeamBy === 'games') setSortedTeam(!sortedTeam);
                      }}
                    >
                      <span className={'ranking-sort ranking-score' + (sortedTeamBy === 'games' ? ' ranking-selected' : '')}>
                        Usage
                        {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                      </span>
                    </div>
                  </div>
                </div>
                <Accordion alwaysOpen={true}>
                  {rankingData.teams
                    .sort((a: { [x: string]: number }, b: { [x: string]: number }) =>
                      sortedTeam ? b[sortedTeamBy] - a[sortedTeamBy] : a[sortedTeamBy] - b[sortedTeamBy]
                    )
                    .map((value: any, index: string) => (
                      <Accordion.Item key={index} eventKey={index}>
                        <Accordion.Header>
                          <div className="d-flex align-items-center w-100 justify-content-between" style={{ gap: 15 }}>
                            <div className="d-flex" style={{ gap: 15 }}>
                              {value.teamData.map(
                                (
                                  value: {
                                    shadow: any;
                                    purified: any;
                                    form: string;
                                    id: any;
                                    name: string;
                                  },
                                  index: React.Key | null | undefined
                                ) => (
                                  <div className="text-center" key={index}>
                                    <div className="d-flex justify-content-center">
                                      <div className="position-relative filter-shadow" style={{ width: 96 }}>
                                        {value.shadow && (
                                          <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                                        )}
                                        {value.purified && (
                                          <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                                        )}
                                        <img
                                          alt="img-league"
                                          className="pokemon-sprite"
                                          src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}
                                        />
                                      </div>
                                    </div>
                                    <b className="text-black">{splitAndCapitalize(value.name, '-', ' ')}</b>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="d-flex align-items-center" style={{ marginRight: 15, columnGap: 30 }}>
                              <div className="text-center" style={{ width: 200 }}>
                                <span className="ranking-score score-ic">{value.teamScore}</span>
                              </div>
                              <div style={{ width: 'fit-content' }} className="text-center ranking-score score-ic">
                                {((value.games * 100) / value.teamsTotalGames).toFixed(2)}
                                <span className="caption text-black">
                                  {value.games}/{value.teamsTotalGames}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body style={{ padding: 0 }}>
                          <Fragment>
                            {value.teamData.map(
                              (
                                value: {
                                  pokemonData: { types: any[] };
                                  shadow: boolean | undefined;
                                  purified: boolean | undefined;
                                  speciesId: string;
                                  form: string;
                                  id: any;
                                  name: string;
                                  fmove: { name: any; id?: string; type?: any };
                                  combatPoke: {
                                    eliteQuickMoves: string | any[];
                                    eliteCinematicMoves: string | any[];
                                    shadowMoves: string | any[];
                                    purifiedMoves: string | any[];
                                  };
                                  cmovePri: { name: any; id?: string; type?: any };
                                  cmoveSec: { name: any; id?: string; type?: any };
                                },
                                index: React.Key | null | undefined
                              ) => (
                                <div
                                  className="d-flex align-items-center"
                                  key={index}
                                  style={{
                                    padding: 15,
                                    gap: '1rem',
                                    backgroundImage: computeBgType(value.pokemonData.types, value.shadow, value.purified),
                                  }}
                                >
                                  <Link to={`/pvp/${params.cp}/overall/${value.speciesId.replaceAll('_', '-')}`} target="_blank">
                                    <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
                                  </Link>
                                  <div className="d-flex justify-content-center">
                                    <div className="position-relative filter-shadow" style={{ width: 96 }}>
                                      {value.shadow && (
                                        <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                                      )}
                                      {value.purified && (
                                        <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                                      )}
                                      <img
                                        alt="img-league"
                                        className="pokemon-sprite"
                                        src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}
                                      />
                                    </div>
                                  </div>
                                  <div className="ranking-group">
                                    <div>
                                      <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
                                        <b className="text-white text-shadow">{splitAndCapitalize(value.name, '-', ' ')}</b>
                                        <Type
                                          hideText={true}
                                          block={true}
                                          shadow={true}
                                          height={20}
                                          color={'white'}
                                          arr={value.pokemonData.types}
                                        />
                                      </div>
                                      <div className="d-flex" style={{ gap: 10 }}>
                                        <TypeBadge
                                          grow={true}
                                          find={true}
                                          title="Fast Move"
                                          color={'white'}
                                          move={value.fmove}
                                          elite={value.combatPoke.eliteQuickMoves.includes(value.fmove.name)}
                                        />
                                        <TypeBadge
                                          grow={true}
                                          find={true}
                                          title="Primary Charged Move"
                                          color={'white'}
                                          move={value.cmovePri}
                                          elite={value.combatPoke.eliteCinematicMoves.includes(value.cmovePri.name)}
                                          shadow={value.combatPoke.shadowMoves.includes(value.cmovePri.name)}
                                          purified={value.combatPoke.purifiedMoves.includes(value.cmovePri.name)}
                                        />
                                        {value.cmoveSec && (
                                          <TypeBadge
                                            grow={true}
                                            find={true}
                                            title="Secondary Charged Move"
                                            color={'white'}
                                            move={value.cmoveSec}
                                            elite={value.combatPoke.eliteCinematicMoves.includes(value.cmoveSec.name)}
                                            shadow={value.combatPoke.shadowMoves.includes(value.cmoveSec.name)}
                                            purified={value.combatPoke.purifiedMoves.includes(value.cmoveSec.name)}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </Fragment>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                </Accordion>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default TeamPVP;
