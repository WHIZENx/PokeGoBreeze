import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';

import { convertNameRankingToForm, convertNameRankingToOri, findMoveTeam, getStyleSheet, splitAndCapitalize } from '../../../util/Utils';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import { calculateStatsByTag } from '../../../util/Calculate';
import { Accordion } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import TypeInfo from '../../../components/Sprites/Type/Type';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';
import { loadPVP } from '../../../store/actions/store.action';
import { useLocalStorage } from 'usehooks-ts';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { Combat } from '../../../core/models/combat.model';
import { TeamsPVP } from '../../../core/models/pvp.model';
import { PokemonTeamData } from '../models/battle.model';
import { FORM_NORMAL, FORM_SHADOW } from '../../../util/Constants';

const TeamPVP = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
    })
  );
  const [statePVP, setStatePVP] = useLocalStorage('pvp', '');
  const params: any = useParams();

  const [rankingData, setRankingData]: [TeamsPVP | undefined, React.Dispatch<React.SetStateAction<TeamsPVP | undefined>>] = useState();
  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [sortedBy, setSortedBy] = useState('teamScore');
  const [sorted, setSorted] = useState(1);

  const [sortedTeamBy, setSortedTeamBy] = useState('teamScore');
  const [sortedTeam, setSortedTeam] = useState(1);

  const styleSheet: React.MutableRefObject<CSSStyleSheet | null> = useRef(null);

  const mappingPokemonData = (data: string) => {
    const [speciesId, moveSet] = data.split(' ');
    const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
    const pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === name);
    const id = pokemon?.num;
    const form = findAssetForm(dataStore?.assets ?? [], pokemon?.num, pokemon?.forme ?? FORM_NORMAL);

    const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

    if (!styleSheet.current) {
      styleSheet.current = getStyleSheet(`.${pokemon?.types.at(0)?.toLowerCase()}`);
    }

    let fmove: Combat | undefined, cmovePri: Combat | undefined, cmoveSec: Combat | undefined;
    let fMoveText: string, cMove: string, cMovePriText: string, cMoveSecText: string;
    if (moveSet.includes('+')) {
      [fMoveText, cMove] = moveSet.split('+');
      [cMovePriText, cMoveSecText] = cMove.split('/');
    } else {
      [fMoveText, cMovePriText, cMoveSecText] = moveSet.split('/');
    }

    const fastMoveSet = pokemon?.quickMoves?.concat(pokemon?.eliteQuickMove ?? []);
    const chargedMoveSet = pokemon?.cinematicMoves?.concat(
      pokemon?.eliteCinematicMove ?? [],
      pokemon?.shadowMoves ?? [],
      pokemon?.purifiedMoves ?? [],
      pokemon?.specialMoves ?? []
    );
    fmove = dataStore?.combat?.find((item) => item.name === findMoveTeam(fMoveText, fastMoveSet ?? []));
    cmovePri = dataStore?.combat?.find((item) => item.name === findMoveTeam(cMovePriText, chargedMoveSet ?? []));
    if (!cmovePri) {
      cmovePri = dataStore?.combat?.find((item) => item.name === findMoveTeam(cMoveSecText, dataStore?.combat?.map((c) => c.name) ?? []));
    }
    if (cMoveSecText) {
      cmoveSec = dataStore?.combat?.find((item) => item.name === findMoveTeam(cMoveSecText, chargedMoveSet ?? []));
      if (!cmoveSec) {
        cmoveSec = dataStore?.combat?.find((item) => item.name === findMoveTeam(cMoveSecText, dataStore?.combat?.map((c) => c.name) ?? []));
      }
    }

    return {
      id,
      name,
      speciesId,
      pokemonData: pokemon,
      form,
      stats,
      atk: statsRanking.attack.ranking.find((i) => i.attack === stats.atk),
      def: statsRanking.defense.ranking.find((i) => i.defense === stats.def),
      sta: statsRanking.stamina.ranking.find((i) => i.stamina === (stats?.sta ?? 0)),
      fmove,
      cmovePri,
      cmoveSec,
      shadow: speciesId.toUpperCase().includes(FORM_SHADOW),
      purified:
        (cmovePri && pokemon?.purifiedMoves?.includes(cmovePri.name)) || (cmoveSec && pokemon?.purifiedMoves?.includes(cmoveSec.name)),
    };
  };

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  useEffect(() => {
    const fetchPokemon = async () => {
      dispatch(showSpinner());
      try {
        const cp = parseInt(params.cp);
        const file = (await APIService.getFetchUrl<TeamsPVP>(APIService.getTeamFile('analysis', params.serie, cp))).data;
        if (params.serie === 'all') {
          document.title = `PVP Teams - ${
            cp === 500 ? 'Little Cup' : cp === 1500 ? 'Great League' : cp === 2500 ? 'Ultra League' : 'Master League'
          }`;
        } else {
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
        }

        const performersTotalGames = file.performers.reduce((p, c) => p + c.games, 0);
        const teamsTotalGames = file.teams.reduce((p, c) => p + c.games, 0);

        file.performers = file.performers.map((item) => {
          return {
            ...item,
            ...mappingPokemonData(item.pokemon),
            performersTotalGames,
          };
        });

        file.teams = file.teams.map((item) => {
          const teams = item.team.split('|');
          const teamsData: PokemonTeamData[] = [];
          teams.forEach((value) => teamsData.push(mappingPokemonData(value)));
          return {
            ...item,
            teamsTotalGames,
            teamsData,
          };
        });
        setRankingData(file);
        dispatch(hideSpinner());
      } catch (e: any) {
        dispatch(
          showSpinner({
            error: true,
            msg: e.message,
          })
        );
      }
    };
    if (!rankingData && pvp && dataStore?.combat && dataStore?.pokemon?.length > 0 && dataStore?.assets && statsRanking) {
      fetchPokemon();
    }
  }, [dispatch, params.cp, params.serie, rankingData, pvp, dataStore?.combat, dataStore?.pokemon, dataStore?.assets, statsRanking]);

  const renderLeague = () => {
    const cp = parseInt(params.cp);
    const league = pvp?.trains?.find((item) => item.id === params.serie && item.cp.includes(cp));
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
    <div className="container pvp-container element-bottom">
      {renderLeague()}
      <hr />
      <h2>Top Performer Pokémon</h2>
      <div className="input-group border-input">
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter Name or ID"
          defaultValue={search}
          onKeyUp={(e) => setSearch(e.currentTarget.value)}
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
                if (sortedBy === 'teamScore') {
                  setSorted(sorted ? 0 : 1);
                }
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
                if (sortedBy === 'individualScore') {
                  setSorted(sorted ? 0 : 1);
                }
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
                if (sortedBy === 'games') {
                  setSorted(sorted ? 0 : 1);
                }
              }}
            >
              <span className={'ranking-sort ranking-score' + (sortedBy === 'games' ? ' ranking-selected' : '')}>
                Usage
                {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
          </div>
        </div>
        {rankingData?.performers
          .filter(
            (pokemon) =>
              splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()) ||
              pokemon.id?.toString().includes(search)
          )
          .sort((a: any, b: any) => (sorted ? b[sortedBy] - a[sortedBy] : a[sortedBy] - b[sortedBy]))
          .map((value, index) => (
            <div
              className="d-flex align-items-center card-ranking"
              key={index}
              style={{
                columnGap: '1rem',
                backgroundImage: computeBgType(value?.pokemonData?.types, value?.shadow, value?.purified, 1, styleSheet.current),
              }}
            >
              <Link to={`/pvp/${params.cp}/overall/${value.speciesId.toString().replaceAll('_', '-')}`}>
                <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
              </Link>
              <div className="d-flex justify-content-center">
                <span className="position-relative filter-shadow" style={{ width: 96 }}>
                  {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                  {value.purified && <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />}
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
                    <b className="text-white text-shadow">{`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}</b>
                    <TypeInfo hideText={true} block={true} shadow={true} height={20} color={'white'} arr={value.pokemonData?.types} />
                  </div>
                  <div className="d-flex" style={{ columnGap: 10 }}>
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Fast Move"
                      color={'white'}
                      move={value.fmove}
                      elite={value.combatPoke?.eliteQuickMove?.includes(value.fmove?.name ?? '')}
                    />
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Primary Charged Move"
                      color={'white'}
                      move={value.cmovePri}
                      elite={value.combatPoke?.eliteCinematicMove?.includes(value.cmovePri?.name ?? '')}
                      shadow={value.combatPoke?.shadowMoves?.includes(value.cmovePri?.name ?? '')}
                      purified={value.combatPoke?.purifiedMoves?.includes(value.cmovePri?.name ?? '')}
                      special={value.combatPoke?.specialMoves?.includes(value.cmovePri?.name ?? '')}
                    />
                    {value.cmoveSec && (
                      <TypeBadge
                        grow={true}
                        find={true}
                        title="Secondary Charged Move"
                        color={'white'}
                        move={value.cmoveSec}
                        elite={value.combatPoke?.eliteCinematicMove?.includes(value.cmoveSec?.name)}
                        shadow={value.combatPoke?.shadowMoves?.includes(value.cmoveSec?.name)}
                        purified={value.combatPoke?.purifiedMoves?.includes(value.cmoveSec?.name)}
                        special={value.combatPoke?.specialMoves?.includes(value.cmoveSec?.name)}
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
                if (sortedTeamBy === 'teamScore') {
                  setSortedTeam(sortedTeam ? 0 : 1);
                }
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
                if (sortedTeamBy === 'games') {
                  setSortedTeam(sortedTeam ? 0 : 1);
                }
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
          {rankingData?.teams
            .sort((a: any, b: any) => (sortedTeam ? b[sortedTeamBy] - a[sortedTeamBy] : a[sortedTeamBy] - b[sortedTeamBy]))
            .map((value, index) => (
              <Accordion.Item key={index} eventKey={index.toString()}>
                <Accordion.Header>
                  <div className="d-flex align-items-center w-100 justify-content-between" style={{ gap: 15 }}>
                    <div className="d-flex" style={{ gap: 15 }}>
                      {value.teamsData.map((value, index) => (
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
                          <b className="text-black">{`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}</b>
                        </div>
                      ))}
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
                    {value.teamsData.map((value, index) => (
                      <div
                        className="d-flex align-items-center"
                        key={index}
                        style={{
                          padding: 15,
                          gap: '1rem',
                          backgroundImage: computeBgType(value.pokemonData?.types, value.shadow, value.purified),
                        }}
                      >
                        <Link to={`/pvp/${params.cp}/overall/${value.speciesId.toString().replaceAll('_', '-')}`}>
                          <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
                        </Link>
                        <div className="d-flex justify-content-center">
                          <div className="position-relative filter-shadow" style={{ width: 96 }}>
                            {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
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
                              <b className="text-white text-shadow">{`#${value.id} ${splitAndCapitalize(value.name, '-', ' ')}`}</b>
                              <TypeInfo
                                hideText={true}
                                block={true}
                                shadow={true}
                                height={20}
                                color={'white'}
                                arr={value.pokemonData?.types}
                              />
                            </div>
                            <div className="d-flex" style={{ gap: 10 }}>
                              <TypeBadge
                                grow={true}
                                find={true}
                                title="Fast Move"
                                color={'white'}
                                move={value.fmove}
                                elite={value.pokemonData?.eliteQuickMove?.includes(value.fmove?.name ?? '')}
                              />
                              <TypeBadge
                                grow={true}
                                find={true}
                                title="Primary Charged Move"
                                color={'white'}
                                move={value.cmovePri}
                                elite={value.pokemonData?.eliteCinematicMove?.includes(value.cmovePri?.name ?? '')}
                                shadow={value.pokemonData?.shadowMoves?.includes(value.cmovePri?.name ?? '')}
                                purified={value.pokemonData?.purifiedMoves?.includes(value.cmovePri?.name ?? '')}
                                special={value.pokemonData?.specialMoves?.includes(value.cmovePri?.name ?? '')}
                              />
                              {value.cmoveSec && (
                                <TypeBadge
                                  grow={true}
                                  find={true}
                                  title="Secondary Charged Move"
                                  color={'white'}
                                  move={value.cmoveSec}
                                  elite={value.pokemonData?.eliteCinematicMove?.includes(value.cmoveSec?.name)}
                                  shadow={value.pokemonData?.shadowMoves?.includes(value.cmoveSec?.name)}
                                  purified={value.pokemonData?.purifiedMoves?.includes(value.cmoveSec?.name)}
                                  special={value.pokemonData?.specialMoves?.includes(value.cmoveSec?.name)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Fragment>
                </Accordion.Body>
              </Accordion.Item>
            ))}
        </Accordion>
      </div>
    </div>
  );
};

export default TeamPVP;
