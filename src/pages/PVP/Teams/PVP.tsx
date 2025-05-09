import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';

import {
  convertNameRankingToForm,
  convertNameRankingToOri,
  findMoveTeam,
  getAllMoves,
  getKeyWithData,
  getMoveType,
  getStyleList,
  getValidPokemonImgPath,
  reverseReplaceTempMovePvpName,
  splitAndCapitalize,
} from '../../../util/utils';
import {
  computeBgType,
  findAssetForm,
  getPokemonBattleLeagueIcon,
  getPokemonBattleLeagueName,
} from '../../../util/compute';
import { calculateStatsByTag } from '../../../util/calculate';
import { Accordion } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import TypeInfo from '../../../components/Sprites/Type/Type';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { PathState, StatsState, StoreState, TimestampState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { IPerformers, ITeams, Performers, Teams, TeamsPVP } from '../../../core/models/pvp.model';
import { PokemonTeamData } from '../models/battle.model';
import { FORM_SHADOW } from '../../../util/constants';
import { SpinnerActions } from '../../../store/actions';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isNullOrUndefined,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { SortType } from '../enums/pvp-team.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { PokemonType, TypeMove } from '../../../enums/type.enum';
import { ScoreType } from '../../../util/enums/constants.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { IStyleData } from '../../../util/models/util.model';

const TeamPVP = () => {
  const dispatch = useDispatch();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const allMoves = useSelector((state: StoreState) => state.store.data.combats.map((c) => c.name));
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const pvpData = useSelector((state: PathState) => state.path.pvp);
  const params = useParams();

  const [rankingData, setRankingData] = useState<TeamsPVP>();
  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [sortedBy, setSortedBy] = useState(SortType.TeamScore);
  const [sorted, setSorted] = useState(SortDirectionType.DESC);

  const [sortedTeamBy, setSortedTeamBy] = useState(SortType.TeamScore);
  const [sortedTeam, setSortedTeam] = useState(SortDirectionType.DESC);

  const styleSheet = useRef<IStyleData[]>(getStyleList());

  const mappingPokemonData = (data: string) => {
    const [speciesId, moveSet] = data.split(' ');
    const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
    const pokemon = dataStore.pokemons.find((pokemon) => isEqual(pokemon.slug, name));
    const id = pokemon?.num;
    const form = findAssetForm(dataStore.assets, pokemon?.num, pokemon?.form);

    const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

    let fMoveText: string, cMove: string, cMovePriText: string, cMoveSecText: string;
    if (isInclude(moveSet, '+')) {
      [fMoveText, cMove] = moveSet.split('+');
      [cMovePriText, cMoveSecText] = cMove.split('/');
    } else {
      [fMoveText, cMovePriText, cMoveSecText] = moveSet.split('/');
    }

    const fastMoveSet = getAllMoves(pokemon, TypeMove.Fast);
    const chargedMoveSet = getAllMoves(pokemon, TypeMove.Charge);

    const fCombatName = findMoveTeam(fMoveText, fastMoveSet);
    const cCombatName = findMoveTeam(cMovePriText, chargedMoveSet);
    const cSecCombatName = findMoveTeam(cMoveSecText, chargedMoveSet);

    const fMove = findMoveByTag(fCombatName, fMoveText);
    const cMovePri = findMoveByTag(cCombatName, cMovePriText);
    let cMoveSec = findMoveByTag(cSecCombatName, cMoveSecText);

    if (cMovePri?.id === cMoveSec?.id) {
      cMoveSec = undefined;
    }

    let pokemonType = PokemonType.Normal;
    if (isInclude(speciesId, `_${FORM_SHADOW}`, IncludeMode.IncludeIgnoreCaseSensitive)) {
      pokemonType = PokemonType.Shadow;
    } else if (
      isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) ||
      isIncludeList(pokemon?.purifiedMoves, cMoveSec?.name)
    ) {
      pokemonType = PokemonType.Purified;
    }

    const result = new PokemonTeamData({
      id,
      name,
      speciesId,
      pokemonData: pokemon,
      form,
      stats,
      atk: statsRanking?.attack?.ranking?.find((i) => i.attack === stats.atk),
      def: statsRanking?.defense?.ranking?.find((i) => i.defense === stats.def),
      sta: statsRanking?.stamina?.ranking?.find((i) => i.stamina === stats.sta),
      fMove,
      cMovePri,
      cMoveSec,
      pokemonType,
    });
    return result;
  };

  useEffect(() => {
    loadPVP(dispatch, timestamp, pvpData);
    if (isNotEmpty(dataStore.combats) && dataStore.combats.every((combat) => !combat.archetype)) {
      loadPVPMoves(dispatch);
    }
  }, [dispatch, dataStore.combats]);

  useEffect(() => {
    const fetchPokemon = async () => {
      dispatch(SpinnerActions.ShowSpinner.create());
      try {
        const cp = toNumber(params.cp);
        const file = (await APIService.getFetchUrl<TeamsPVP>(APIService.getTeamFile('analysis', params.serie, cp)))
          .data;
        if (!file) {
          return;
        }
        if (params.serie === LeagueBattleType.All) {
          document.title = `PVP Teams - ${getPokemonBattleLeagueName(cp)}`;
        } else {
          document.title = `PVP Teams - ${
            params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
          } ${splitAndCapitalize(params.serie, '-', ' ')}`;
        }

        const performersTotalGames = file.performers.reduce((p, c) => p + c.games, 0);
        const teamsTotalGames = file.teams.reduce((p, c) => p + c.games, 0);

        file.performers = file.performers.map(
          (item) =>
            new Performers({
              ...item,
              ...mappingPokemonData(item.pokemon),
              performersTotalGames,
            })
        );

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
            isError: true,
            message: (e as Error).message,
          })
        );
      }
    };
    if (
      !rankingData &&
      isNotEmpty(pvp.rankings) &&
      isNotEmpty(pvp.trains) &&
      isNotEmpty(dataStore.combats) &&
      isNotEmpty(dataStore.pokemons) &&
      isNotEmpty(dataStore.assets) &&
      statsRanking?.attack?.ranking &&
      statsRanking?.defense?.ranking &&
      statsRanking?.stamina?.ranking &&
      statsRanking?.statProd?.ranking
    ) {
      fetchPokemon();
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [
    dispatch,
    params.cp,
    params.serie,
    rankingData,
    pvp,
    dataStore.combats,
    dataStore.pokemons,
    dataStore.assets,
    statsRanking,
  ]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvp.trains.find((item) => isEqual(item.id, params.serie) && isIncludeList(item.cp, cp));
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
              <b>
                {isEqual(league.name, LeagueBattleType.All, EqualMode.IgnoreCaseSensitive)
                  ? getPokemonBattleLeagueName(cp)
                  : league.name}
              </b>
            </h2>
          </div>
        )}
      </Fragment>
    );
  };

  const setSortedPokemonPerformers = (primary: IPerformers, secondary: IPerformers) => {
    const sortedColumn = getPropertyName(primary || secondary, (o) =>
      sortedBy === SortType.IndividualScore ? o.individualScore : sortedBy === SortType.Games ? o.games : o.teamScore
    );
    const a = primary as unknown as DynamicObj<number>;
    const b = secondary as unknown as DynamicObj<number>;
    return sorted === SortDirectionType.DESC ? b[sortedColumn] - a[sortedColumn] : a[sortedColumn] - b[sortedColumn];
  };

  const setSortedPokemonTeam = (primary: ITeams, secondary: ITeams) => {
    const sortedColumn = getPropertyName(primary || secondary, (o) =>
      sortedBy === SortType.Games ? o.games : o.teamScore
    );
    const a = primary as unknown as DynamicObj<number>;
    const b = secondary as unknown as DynamicObj<number>;
    return sortedTeam === SortDirectionType.DESC
      ? b[sortedColumn] - a[sortedColumn]
      : a[sortedColumn] - b[sortedColumn];
  };

  const findMoveByTag = (nameSet: string[], tag: string) => {
    let move: ICombat | undefined;
    if (!tag) {
      return move;
    }

    for (const name of nameSet) {
      move = dataStore.combats.find(
        (item) =>
          (item.abbreviation && isEqual(item.abbreviation, tag)) ||
          (!item.abbreviation && isEqual(item.name, reverseReplaceTempMovePvpName(name)))
      );
      if (!isNullOrUndefined(move)) {
        return move;
      }
    }

    nameSet = findMoveTeam(tag, allMoves, true);
    move = dataStore.combats.find(
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
                  setSorted(sorted === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC);
                }
              }}
            >
              <span
                className={combineClasses(
                  'ranking-sort ranking-score',
                  sortedBy === SortType.TeamScore ? 'ranking-selected' : ''
                )}
              >
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
                  setSorted(sorted === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC);
                }
              }}
            >
              <span
                className={combineClasses(
                  'ranking-sort ranking-score',
                  sortedBy === SortType.IndividualScore ? 'ranking-selected' : ''
                )}
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
                  setSorted(sorted === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC);
                }
              }}
            >
              <span
                className={combineClasses(
                  'ranking-sort ranking-score',
                  sortedBy === SortType.Games ? 'ranking-selected' : ''
                )}
              >
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
                backgroundImage: computeBgType(value.pokemonData?.types, value.pokemonType, styleSheet.current),
              }}
            >
              <LinkToTop
                to={`/pvp/${params.cp}/${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}/${value.speciesId
                  .toString()
                  .replaceAll('_', '-')}`}
              >
                <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
              </LinkToTop>
              <div className="d-flex justify-content-center">
                <span className="position-relative filter-shadow" style={{ width: 96 }}>
                  <PokemonIconType pokemonType={value.pokemonType} size={48}>
                    <img
                      alt="img-league"
                      className="pokemon-sprite"
                      src={APIService.getPokemonModel(value.form, value.id)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, value.id, value.form);
                      }}
                    />
                  </PokemonIconType>
                </span>
              </div>
              <div className="ranking-group w-100" style={{ columnGap: 15 }}>
                <div>
                  <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
                    <b className="text-white text-shadow">{`#${value.id} ${splitAndCapitalize(
                      value.name,
                      '-',
                      ' '
                    )}`}</b>
                    <TypeInfo
                      isHideText={true}
                      isBlock={true}
                      isShowShadow={true}
                      height={20}
                      color="white"
                      arr={value.pokemonData?.types}
                    />
                  </div>
                  <div className="d-flex" style={{ columnGap: 10 }}>
                    <TypeBadge
                      isGrow={true}
                      isFind={true}
                      title="Fast Move"
                      color="white"
                      move={value.fMove}
                      moveType={getMoveType(value.pokemonData, value.fMove?.name)}
                    />
                    <TypeBadge
                      isGrow={true}
                      isFind={true}
                      title="Primary Charged Move"
                      color="white"
                      move={value.cMovePri}
                      moveType={getMoveType(value.pokemonData, value.cMovePri?.name)}
                    />
                    {value.cMoveSec && (
                      <TypeBadge
                        isGrow={true}
                        isFind={true}
                        title="Secondary Charged Move"
                        color="white"
                        move={value.cMoveSec}
                        moveType={getMoveType(value.pokemonData, value.cMoveSec.name)}
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
                    {toFloatWithPadding((value.games * 100) / value.performersTotalGames, 2)}
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
                  setSortedTeam(sortedTeam === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC);
                }
              }}
            >
              <span
                className={combineClasses(
                  'ranking-sort ranking-score',
                  sortedTeamBy === SortType.TeamScore ? 'ranking-selected' : ''
                )}
              >
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
                  setSortedTeam(sortedTeam === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC);
                }
              }}
            >
              <span
                className={combineClasses(
                  'ranking-sort ranking-score',
                  sortedTeamBy === SortType.Games ? 'ranking-selected' : ''
                )}
              >
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
                              <PokemonIconType pokemonType={value.pokemonType} size={48}>
                                <img
                                  alt="img-league"
                                  className="pokemon-sprite"
                                  src={APIService.getPokemonModel(value.form, value.id)}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = getValidPokemonImgPath(
                                      e.currentTarget.src,
                                      value.id,
                                      value.form
                                    );
                                  }}
                                />
                              </PokemonIconType>
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
                        {toFloatWithPadding((value.games * 100) / value.teamsTotalGames, 2)}
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
                          backgroundImage: computeBgType(
                            value.pokemonData?.types,
                            value.pokemonType,
                            styleSheet.current
                          ),
                        }}
                      >
                        <LinkToTop
                          to={`/pvp/${params.cp}/${getKeyWithData(
                            ScoreType,
                            ScoreType.Overall
                          )?.toLowerCase()}/${value.speciesId.toString().replaceAll('_', '-')}`}
                        >
                          <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
                        </LinkToTop>
                        <div className="d-flex justify-content-center">
                          <div className="position-relative filter-shadow" style={{ width: 96 }}>
                            <PokemonIconType pokemonType={value.pokemonType} size={48}>
                              <img
                                alt="img-league"
                                className="pokemon-sprite"
                                src={APIService.getPokemonModel(value.form, value.id)}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getValidPokemonImgPath(
                                    e.currentTarget.src,
                                    value.id,
                                    value.form
                                  );
                                }}
                              />
                            </PokemonIconType>
                          </div>
                        </div>
                        <div className="ranking-group">
                          <div>
                            <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
                              <b className="text-white text-shadow">{`#${value.id} ${splitAndCapitalize(
                                value.name,
                                '-',
                                ' '
                              )}`}</b>
                              <TypeInfo
                                isHideText={true}
                                isBlock={true}
                                isShowShadow={true}
                                height={20}
                                color="white"
                                arr={value.pokemonData?.types}
                              />
                            </div>
                            <div className="d-flex" style={{ gap: 10 }}>
                              <TypeBadge
                                isGrow={true}
                                isFind={true}
                                title="Fast Move"
                                color="white"
                                move={value.fMove}
                                moveType={getMoveType(value.pokemonData, value.fMove?.name)}
                              />
                              <TypeBadge
                                isGrow={true}
                                isFind={true}
                                title="Primary Charged Move"
                                color="white"
                                move={value.cMovePri}
                                moveType={getMoveType(value.pokemonData, value.cMovePri?.name)}
                              />
                              {value.cMoveSec && (
                                <TypeBadge
                                  isGrow={true}
                                  isFind={true}
                                  title="Secondary Charged Move"
                                  color="white"
                                  move={value.cMoveSec}
                                  moveType={getMoveType(value.pokemonData, value.cMoveSec.name)}
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
