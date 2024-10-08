import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';

import {
  convertNameRankingToForm,
  convertNameRankingToOri,
  findMoveTeam,
  getAllMoves,
  getStyleSheet,
  reverseReplaceTempMovePvpName,
  splitAndCapitalize,
} from '../../../util/utils';
import { computeBgType, findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';
import { calculateStatsByTag } from '../../../util/calculate';
import { Accordion } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import TypeInfo from '../../../components/Sprites/Type/Type';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { StatsState, StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { IPerformers, ITeams, Performers, Teams, TeamsPVP } from '../../../core/models/pvp.model';
import { PokemonTeamData } from '../models/battle.model';
import { FORM_NORMAL, FORM_SHADOW } from '../../../util/constants';
import { SpinnerActions } from '../../../store/actions';
import { LocalStorageConfig } from '../../../store/constants/localStorage';
import { LocalTimeStamp } from '../../../store/models/local-storage.model';
import {
  combineClasses,
  DynamicObj,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isNullOrUndefined,
  toNumber,
} from '../../../util/extension';
import { Sorted, SortType } from '../enums/pvp-team.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LeagueType } from '../../../core/enums/league.enum';

const TeamPVP = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const allMoves = useSelector((state: StoreState) =>
    getValueOrDefault(
      Array,
      state.store.data?.combat?.map((c) => c.name)
    )
  );
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.TIMESTAMP, JSON.stringify(new LocalTimeStamp()));
  const [statePVP, setStatePVP] = useLocalStorage(LocalStorageConfig.PVP, '');
  const params = useParams();

  const [rankingData, setRankingData] = useState<TeamsPVP>();
  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [sortedBy, setSortedBy] = useState(SortType.TeamScore);
  const [sorted, setSorted] = useState(Sorted.DESC);

  const [sortedTeamBy, setSortedTeamBy] = useState(SortType.TeamScore);
  const [sortedTeam, setSortedTeam] = useState(Sorted.DESC);

  const styleSheet = useRef<CSSStyleSheet>();

  const mappingPokemonData = (data: string) => {
    const [speciesId, moveSet] = data.split(' ');
    const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
    const pokemon = dataStore?.pokemon?.find((pokemon) => isEqual(pokemon.slug, name));
    const id = pokemon?.num;
    const form = findAssetForm(getValueOrDefault(Array, dataStore?.assets), pokemon?.num, pokemon?.forme ?? FORM_NORMAL);

    const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

    if (!styleSheet.current) {
      styleSheet.current = getStyleSheet(`.${pokemon?.types.at(0)?.toLowerCase()}`);
    }

    let fMoveText: string, cMove: string, cMovePriText: string, cMoveSecText: string;
    if (isInclude(moveSet, '+')) {
      [fMoveText, cMove] = moveSet.split('+');
      [cMovePriText, cMoveSecText] = cMove.split('/');
    } else {
      [fMoveText, cMovePriText, cMoveSecText] = moveSet.split('/');
    }

    const fastMoveSet = getValueOrDefault(Array, pokemon?.quickMoves?.concat(getValueOrDefault(Array, pokemon.eliteQuickMove)));
    const chargedMoveSet = getValueOrDefault(
      Array,
      pokemon?.cinematicMoves?.concat(
        getValueOrDefault(Array, pokemon.eliteCinematicMove),
        getValueOrDefault(Array, pokemon.shadowMoves),
        getValueOrDefault(Array, pokemon.purifiedMoves),
        getValueOrDefault(Array, pokemon.specialMoves)
      )
    );

    const fCombatName = findMoveTeam(fMoveText, fastMoveSet);
    const cCombatName = findMoveTeam(cMovePriText, chargedMoveSet);
    const cSecCombatName = findMoveTeam(cMoveSecText, chargedMoveSet);

    const fMove = findMoveByTag(fCombatName, fMoveText);
    const cMovePri = findMoveByTag(cCombatName, cMovePriText);
    let cMoveSec = findMoveByTag(cSecCombatName, cMoveSecText);

    if (cMovePri?.id === cMoveSec?.id) {
      cMoveSec = undefined;
    }

    const result = new PokemonTeamData({
      id,
      name,
      speciesId,
      pokemonData: pokemon,
      form,
      stats,
      atk: statsRanking?.attack.ranking.find((i) => i.attack === stats.atk),
      def: statsRanking?.defense.ranking.find((i) => i.defense === stats.def),
      sta: statsRanking?.stamina.ranking.find((i) => i.stamina === getValueOrDefault(Number, stats.sta)),
      fMove,
      cMovePri,
      cMoveSec,
      shadow: isInclude(speciesId, FORM_SHADOW, IncludeMode.IncludeIgnoreCaseSensitive),
      purified: isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) || isIncludeList(pokemon?.purifiedMoves, cMoveSec?.name),
    });
    return result;
  };

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
    if (isNotEmpty(dataStore?.combat) && dataStore?.combat?.every((combat) => !combat.archetype)) {
      loadPVPMoves(dispatch);
    }
  }, [pvp, dataStore?.combat]);

  useEffect(() => {
    const fetchPokemon = async () => {
      dispatch(SpinnerActions.ShowSpinner.create());
      try {
        const cp = toNumber(getValueOrDefault(String, params.cp));
        const file = (
          await APIService.getFetchUrl<TeamsPVP>(APIService.getTeamFile('analysis', getValueOrDefault(String, params.serie), cp))
        ).data;
        if (params.serie === LeagueType.All) {
          document.title = `PVP Teams - ${getPokemonBattleLeagueName(cp)}`;
        } else {
          document.title = `PVP Teams - ${params.serie === LeagueType.Remix ? getPokemonBattleLeagueName(cp) : ''} ${splitAndCapitalize(
            params.serie,
            '-',
            ' '
          )}`;
        }

        const performersTotalGames = file.performers.reduce((p, c) => p + c.games, 0);
        const teamsTotalGames = file.teams.reduce((p, c) => p + c.games, 0);

        file.performers = file.performers.map((item) => {
          return new Performers({
            ...item,
            ...mappingPokemonData(item.pokemon),
            performersTotalGames,
          });
        });

        file.teams = file.teams.map((item) => {
          const teamsData = item.team.split('|').map((value) => mappingPokemonData(value));
          return new Teams({
            ...item,
            teamsTotalGames,
            teamsData,
          });
        });
        setRankingData(file);
        dispatch(SpinnerActions.HideSpinner.create());
      } catch (e) {
        dispatch(
          SpinnerActions.ShowSpinnerMsg.create({
            error: true,
            message: (e as Error).message,
          })
        );
      }
    };
    if (
      !rankingData &&
      pvp &&
      isNotEmpty(dataStore?.combat) &&
      isNotEmpty(dataStore?.pokemon) &&
      isNotEmpty(dataStore?.assets) &&
      statsRanking
    ) {
      fetchPokemon();
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [dispatch, params.cp, params.serie, rankingData, pvp, dataStore?.combat, dataStore?.pokemon, dataStore?.assets, statsRanking]);

  const renderLeague = () => {
    const cp = toNumber(getValueOrDefault(String, params.cp));
    const league = pvp?.trains?.find((item) => isEqual(item.id, params.serie) && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center element-top" style={{ columnGap: 10 }}>
            <img
              alt="img-league"
              width={64}
              height={64}
              src={!league.logo ? getPokemonBattleLeagueIcon(cp) : APIService.getAssetPokeGo(league.logo)}
            />
            <h2>
              <b>{isEqual(league.name, LeagueType.All, EqualMode.IgnoreCaseSensitive) ? getPokemonBattleLeagueName(cp) : league.name}</b>
            </h2>
          </div>
        )}
      </Fragment>
    );
  };

  const setSortedPokemonPerformers = (primary: IPerformers, secondary: IPerformers) => {
    const a = primary as unknown as DynamicObj<number>;
    const b = secondary as unknown as DynamicObj<number>;
    return sorted ? b[sortedBy] - a[sortedBy] : a[sortedBy] - b[sortedBy];
  };

  const setSortedPokemonTeam = (primary: ITeams, secondary: ITeams) => {
    const a = primary as unknown as DynamicObj<number>;
    const b = secondary as unknown as DynamicObj<number>;
    return sortedTeam ? b[sortedTeamBy] - a[sortedTeamBy] : a[sortedTeamBy] - b[sortedTeamBy];
  };

  const findMoveByTag = (nameSet: string[], tag: string) => {
    let move: ICombat | undefined;
    if (!tag) {
      return move;
    }

    for (const name of nameSet) {
      move = dataStore?.combat?.find(
        (item) =>
          (item.abbreviation && isEqual(item.abbreviation, tag)) ||
          (!item.abbreviation && isEqual(item.name, reverseReplaceTempMovePvpName(name)))
      );
      if (!isNullOrUndefined(move)) {
        return move;
      }
    }

    nameSet = findMoveTeam(tag, allMoves, true);
    move = dataStore?.combat?.find(
      (item) =>
        (item.abbreviation && isEqual(item.abbreviation, tag)) ||
        (isNotEmpty(nameSet) && !item.abbreviation && isEqual(item.name, reverseReplaceTempMovePvpName(nameSet[0])))
    );

    return move;
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
                setSortedBy(SortType.TeamScore);
                if (sortedBy === SortType.TeamScore) {
                  setSorted(sorted ? Sorted.ASC : Sorted.DESC);
                }
              }}
            >
              <span className={combineClasses('ranking-sort ranking-score', sortedBy === SortType.TeamScore ? 'ranking-selected' : '')}>
                Team Score
                {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
            <div
              className="text-center"
              style={{ width: 'max-content' }}
              onClick={() => {
                setSortedBy(SortType.IndividualScore);
                if (sortedBy === SortType.IndividualScore) {
                  setSorted(sorted ? Sorted.ASC : Sorted.DESC);
                }
              }}
            >
              <span
                className={combineClasses('ranking-sort ranking-score', sortedBy === SortType.IndividualScore ? 'ranking-selected' : '')}
              >
                Individual Score
                {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
            <div
              className="text-center"
              style={{ width: 'max-content' }}
              onClick={() => {
                setSortedBy(SortType.Games);
                if (sortedBy === SortType.Games) {
                  setSorted(sorted ? Sorted.ASC : Sorted.DESC);
                }
              }}
            >
              <span className={combineClasses('ranking-sort ranking-score', sortedBy === SortType.Games ? 'ranking-selected' : '')}>
                Usage
                {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
          </div>
        </div>
        {rankingData?.performers
          .filter(
            (pokemon) =>
              isInclude(splitAndCapitalize(pokemon.name, '-', ' '), search, IncludeMode.IncludeIgnoreCaseSensitive) ||
              isInclude(pokemon.id, search)
          )
          .sort((a, b) => setSortedPokemonPerformers(a, b))
          .map((value, index) => (
            <div
              className="d-flex align-items-center card-ranking"
              key={index}
              style={{
                columnGap: '1rem',
                backgroundImage: computeBgType(value.pokemonData?.types, value.shadow, value.purified, 1, styleSheet.current),
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
                    <TypeInfo hideText={true} block={true} shadow={true} height={20} color="white" arr={value.pokemonData?.types} />
                  </div>
                  <div className="d-flex" style={{ columnGap: 10 }}>
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Fast Move"
                      color="white"
                      move={value.fMove}
                      elite={isIncludeList(value.pokemonData?.eliteQuickMove, value.fMove?.name)}
                      unavailable={!isIncludeList(getAllMoves(value.pokemonData), value.fMove?.name)}
                    />
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Primary Charged Move"
                      color="white"
                      move={value.cMovePri}
                      elite={isIncludeList(value.pokemonData?.eliteCinematicMove, value.cMovePri?.name)}
                      shadow={isIncludeList(value.pokemonData?.shadowMoves, value.cMovePri?.name)}
                      purified={isIncludeList(value.pokemonData?.purifiedMoves, value.cMovePri?.name)}
                      special={isIncludeList(value.pokemonData?.specialMoves, value.cMovePri?.name)}
                      unavailable={value.cMovePri && !isIncludeList(getAllMoves(value.pokemonData), value.cMovePri.name)}
                    />
                    {value.cMoveSec && (
                      <TypeBadge
                        grow={true}
                        find={true}
                        title="Secondary Charged Move"
                        color="white"
                        move={value.cMoveSec}
                        elite={isIncludeList(value.pokemonData?.eliteCinematicMove, value.cMoveSec.name)}
                        shadow={isIncludeList(value.pokemonData?.shadowMoves, value.cMoveSec.name)}
                        purified={isIncludeList(value.pokemonData?.purifiedMoves, value.cMoveSec.name)}
                        special={isIncludeList(value.pokemonData?.specialMoves, value.cMoveSec.name)}
                        unavailable={value.cMoveSec && !isIncludeList(getAllMoves(value.pokemonData), value.cMoveSec.name)}
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
                setSortedTeamBy(SortType.TeamScore);
                if (sortedTeamBy === SortType.TeamScore) {
                  setSortedTeam(sortedTeam ? Sorted.ASC : Sorted.DESC);
                }
              }}
            >
              <span className={combineClasses('ranking-sort ranking-score', sortedTeamBy === SortType.TeamScore ? 'ranking-selected' : '')}>
                Team Score
                {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
            <div
              className="text-center"
              style={{ width: 'max-content' }}
              onClick={() => {
                setSortedTeamBy(SortType.Games);
                if (sortedTeamBy === SortType.Games) {
                  setSortedTeam(sortedTeam ? Sorted.ASC : Sorted.DESC);
                }
              }}
            >
              <span className={combineClasses('ranking-sort ranking-score', sortedTeamBy === SortType.Games ? 'ranking-selected' : '')}>
                Usage
                {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </span>
            </div>
          </div>
        </div>
        <Accordion alwaysOpen={true}>
          {rankingData?.teams
            .sort((a, b) => setSortedPokemonTeam(a, b))
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
                                color="white"
                                arr={value.pokemonData?.types}
                              />
                            </div>
                            <div className="d-flex" style={{ gap: 10 }}>
                              <TypeBadge
                                grow={true}
                                find={true}
                                title="Fast Move"
                                color="white"
                                move={value.fMove}
                                elite={isIncludeList(value.pokemonData?.eliteQuickMove, value.fMove?.name)}
                                unavailable={!isIncludeList(getAllMoves(value.pokemonData), value.fMove?.name)}
                              />
                              <TypeBadge
                                grow={true}
                                find={true}
                                title="Primary Charged Move"
                                color="white"
                                move={value.cMovePri}
                                elite={isIncludeList(value.pokemonData?.eliteCinematicMove, value.cMovePri?.name)}
                                shadow={isIncludeList(value.pokemonData?.shadowMoves, value.cMovePri?.name)}
                                purified={isIncludeList(value.pokemonData?.purifiedMoves, value.cMovePri?.name)}
                                special={isIncludeList(value.pokemonData?.specialMoves, value.cMovePri?.name)}
                                unavailable={!isIncludeList(getAllMoves(value.pokemonData), value.cMovePri?.name)}
                              />
                              {value.cMoveSec && (
                                <TypeBadge
                                  grow={true}
                                  find={true}
                                  title="Secondary Charged Move"
                                  color="white"
                                  move={value.cMoveSec}
                                  elite={isIncludeList(value.pokemonData?.eliteCinematicMove, value.cMoveSec.name)}
                                  shadow={isIncludeList(value.pokemonData?.shadowMoves, value.cMoveSec.name)}
                                  purified={isIncludeList(value.pokemonData?.purifiedMoves, value.cMoveSec.name)}
                                  special={isIncludeList(value.pokemonData?.specialMoves, value.cMoveSec.name)}
                                  unavailable={!isIncludeList(getAllMoves(value.pokemonData), value.cMoveSec.name)}
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
