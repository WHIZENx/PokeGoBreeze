import React, { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import APIService from '../../../services/api.service';

import {
  convertNameRankingToForm,
  convertNameRankingToOri,
  findMoveTeam,
  getAllMoves,
  getKeyWithData,
  getMoveType,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../utils/utils';
import { computeBgType, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { calculateStatsByTag } from '../../../utils/calculate';
import { Accordion } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import TypeInfo from '../../../components/Sprites/Type/Type';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { IPerformers, ITeams, Performers, Teams, TeamsPVP } from '../../../core/models/pvp.model';
import { PokemonTeamData } from '../models/battle.model';
import { Params } from '../../../utils/constants';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toFloatWithPadding,
  toNumber,
} from '../../../utils/extension';
import { SortType } from '../enums/pvp-team.enum';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { PokemonType, TypeMove } from '../../../enums/type.enum';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { LinkToTop } from '../../../utils/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { formShadow } from '../../../utils/helpers/options-context.helpers';
import useDataStore from '../../../composables/useDataStore';
import usePVP from '../../../composables/usePVP';
import useAssets from '../../../composables/useAssets';
import useStats from '../../../composables/useStats';
import useSpinner from '../../../composables/useSpinner';
import useCombats from '../../../composables/useCombats';

const TeamPVP = (props: IStyleSheetData) => {
  const { pokemonsData, pvpData } = useDataStore();
  const { findMoveByName, findMoveByTag, isCombatsNoneArchetype } = useCombats();
  const { showSpinner, hideSpinner, showSpinnerMsg } = useSpinner();
  const { findAssetForm } = useAssets();
  const { loadPVP, loadPVPMoves } = usePVP();
  const { statsData } = useStats();
  const params = useParams();

  const [rankingData, setRankingData] = useState<TeamsPVP>();
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState(SortType.TeamScore);
  const [sorted, setSorted] = useState(SortDirectionType.DESC);

  const [isFound, setIsFound] = useState(true);

  const [sortedTeamBy, setSortedTeamBy] = useState(SortType.TeamScore);
  const [sortedTeam, setSortedTeam] = useState(SortDirectionType.DESC);

  const mappingPokemonData = (data: string) => {
    const [speciesId, moveSet] = data.split(' ');
    const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
    const pokemon = pokemonsData.find((pokemon) => isEqual(pokemon.slug, name));
    const id = pokemon?.num;
    const form = findAssetForm(pokemon?.num, pokemon?.form);

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
    if (isInclude(speciesId, `_${formShadow()}`, IncludeMode.IncludeIgnoreCaseSensitive)) {
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
      atk: statsData?.attack?.ranking?.find((i) => i.attack === stats.atk),
      def: statsData?.defense?.ranking?.find((i) => i.defense === stats.def),
      sta: statsData?.stamina?.ranking?.find((i) => i.stamina === stats.sta),
      fMove,
      cMovePri,
      cMoveSec,
      pokemonType,
    });
    return result;
  };

  useEffect(() => {
    loadPVP();
  }, []);

  useEffect(() => {
    if (isCombatsNoneArchetype()) {
      loadPVPMoves();
    }
  }, [findMoveByName]);

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PVP Teams',
    description:
      'Explore top-performing Pokémon GO PVP teams across different leagues and formats. Find meta team compositions and counters.',
    keywords: ['Pokémon GO', 'PVP teams', 'meta teams', 'team compositions', 'battle teams', 'PokéGO Breeze'],
  });

  useTitle(titleProps);

  useEffect(() => {
    const fetchPokemon = async () => {
      showSpinner();
      try {
        const cp = toNumber(params.cp);
        const { data: file } = await APIService.getFetchUrl<TeamsPVP>(
          APIService.getTeamFile('analysis', params.serie, cp)
        );
        if (!file) {
          setIsFound(false);
          return;
        }
        if (params.serie === LeagueBattleType.All) {
          setTitleProps({
            title: `PVP Teams - ${getPokemonBattleLeagueName(cp)}`,
            description: `Explore top-performing ${getPokemonBattleLeagueName(
              cp
            )} teams in Pokémon GO PVP. Find optimal team compositions and counter strategies.`,
            keywords: [
              'Pokémon GO',
              `${getPokemonBattleLeagueName(cp)}`,
              'PVP teams',
              'meta teams',
              'team compositions',
              'PokéGO Breeze',
            ],
            image: getPokemonBattleLeagueIcon(cp),
          });
        } else {
          setTitleProps({
            title: `PVP Teams - ${
              params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
            } ${splitAndCapitalize(params.serie, '-', ' ')}`,
            description: `Explore top-performing ${
              params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
            } ${splitAndCapitalize(
              params.serie,
              '-',
              ' '
            )} teams in Pokémon GO PVP. Find optimal team compositions and counter strategies.`,
            keywords: [
              'Pokémon GO',
              `${splitAndCapitalize(params.serie, '-', ' ')}`,
              `${params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''}`,
              'PVP teams',
              'meta teams',
              'team compositions',
              'PokéGO Breeze',
            ],
            image: getPokemonBattleLeagueIcon(cp),
          });
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
        hideSpinner();
      } catch (e) {
        if ((e as AxiosError)?.status === 404) {
          setIsFound(false);
        } else {
          showSpinnerMsg({
            isError: true,
            message: (e as AxiosError).message,
          });
        }
      }
    };
    if (
      !rankingData &&
      isNotEmpty(pvpData.rankings) &&
      isNotEmpty(pvpData.trains) &&
      isNotEmpty(pokemonsData) &&
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      fetchPokemon();
    }
    return () => {
      hideSpinner();
    };
  }, [
    params.cp,
    params.serie,
    rankingData,
    pvpData.rankings,
    pvpData.trains,
    pokemonsData,
    statsData?.attack?.ranking,
    statsData?.defense?.ranking,
    statsData?.stamina?.ranking,
    statsData?.statProd?.ranking,
  ]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvpData.trains.find((item) => isEqual(item.id, params.serie) && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center mt-2 column-gap-2">
            <img
              alt="Image League"
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

  return (
    <Error isError={!isFound}>
      <div className="container pvp-container pb-3">
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
          <div className="ranking-group w-100 ranking-header column-gap-3">
            <div className="ranking-score">Pokémon</div>
            <div className="d-flex me-3" style={{ columnGap: 30 }}>
              <div
                className="text-center w-max-content"
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
                className="text-center w-max-content"
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
                className="text-center w-max-content"
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
                className="d-flex align-items-center card-ranking column-gap-3"
                key={index}
                style={{
                  backgroundImage: computeBgType(value.pokemonData?.types, value.pokemonType, props.styleSheet, 0.3),
                }}
              >
                <LinkToTop
                  to={`/pvp/${params.cp}/${LeagueBattleType.All}/${value.speciesId.replaceAll('_', '-')}?${
                    Params.LeagueType
                  }=${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}`}
                >
                  <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="large" />
                </LinkToTop>
                <div className="d-flex justify-content-center">
                  <span className="position-relative filter-shadow" style={{ width: 96 }}>
                    <PokemonIconType pokemonType={value.pokemonType} size={48}>
                      <img
                        alt="Image League"
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
                <div className="ranking-group w-100 column-gap-3">
                  <div>
                    <div className="d-flex align-items-center column-gap-2">
                      <b className="text-white text-shadow-black">{`#${value.id} ${splitAndCapitalize(
                        value.name,
                        '-',
                        ' '
                      )}`}</b>
                      <TypeInfo isHideText isBlock isShowShadow height={20} arr={value.pokemonData?.types} />
                    </div>
                    <div className="d-flex column-gap-2">
                      <TypeBadge
                        isGrow
                        isFind
                        title="Fast Move"
                        move={value.fMove}
                        moveType={getMoveType(value.pokemonData, value.fMove?.name)}
                      />
                      <TypeBadge
                        isGrow
                        isFind
                        title="Primary Charged Move"
                        move={value.cMovePri}
                        moveType={getMoveType(value.pokemonData, value.cMovePri?.name)}
                      />
                      {value.cMoveSec && (
                        <TypeBadge
                          isGrow
                          isFind
                          title="Secondary Charged Move"
                          move={value.cMoveSec}
                          moveType={getMoveType(value.pokemonData, value.cMoveSec.name)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="d-flex filter-shadow align-items-center me-3" style={{ columnGap: 30 }}>
                    <div className="text-center" style={{ width: 120 }}>
                      <span className="ranking-score score-ic text-black">{value.teamScore}</span>
                    </div>
                    <div className="text-center" style={{ width: 160 }}>
                      <span className="ranking-score score-ic text-black">{value.individualScore}</span>
                    </div>
                    <div className="text-center ranking-score score-ic text-black w-fit-content">
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
          <div className="ranking-group w-100 ranking-header column-gap-3">
            <div className="ranking-score">Team</div>
            <div className="d-flex" style={{ marginRight: 20, columnGap: 60 }}>
              <div
                className="text-center w-max-content"
                onClick={() => {
                  setSortedTeamBy(SortType.TeamScore);
                  if (sortedTeamBy === SortType.TeamScore) {
                    setSortedTeam(
                      sortedTeam === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC
                    );
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
                className="text-center w-max-content"
                onClick={() => {
                  setSortedTeamBy(SortType.Games);
                  if (sortedTeamBy === SortType.Games) {
                    setSortedTeam(
                      sortedTeam === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC
                    );
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
          <Accordion alwaysOpen>
            {rankingData?.teams
              .sort((a, b) => setSortedPokemonTeam(a, b))
              .map((value, index) => (
                <Accordion.Item key={index} eventKey={index.toString()}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center w-100 justify-content-between gap-3">
                      <div className="d-flex gap-3">
                        {value.teamsData.map((value, index) => (
                          <div className="text-center" key={index}>
                            <div className="d-flex justify-content-center">
                              <div className="position-relative filter-shadow" style={{ width: 96 }}>
                                <PokemonIconType pokemonType={value.pokemonType} size={48}>
                                  <img
                                    alt="Image League"
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
                            <b className="theme-text-primary">{`#${value.id} ${splitAndCapitalize(
                              value.name,
                              '-',
                              ' '
                            )}`}</b>
                          </div>
                        ))}
                      </div>
                      <div className="d-flex align-items-center me-3" style={{ columnGap: 30 }}>
                        <div className="text-center" style={{ width: 200 }}>
                          <span className="ranking-score score-ic text-black">{value.teamScore}</span>
                        </div>
                        <div className="text-center ranking-score score-ic text-black w-fit-content">
                          {toFloatWithPadding((value.games * 100) / value.teamsTotalGames, 2)}
                          <span className="caption text-black">
                            {value.games}/{value.teamsTotalGames}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <Fragment>
                      {value.teamsData.map((value, index) => (
                        <div
                          className="d-flex align-items-center p-3 gap-3"
                          key={index}
                          style={{
                            backgroundImage: computeBgType(
                              value.pokemonData?.types,
                              value.pokemonType,
                              props.styleSheet,
                              0.3
                            ),
                          }}
                        >
                          <LinkToTop
                            to={`/pvp/${params.cp}/${LeagueBattleType.All}/${value.speciesId.replaceAll('_', '-')}?${
                              Params.LeagueType
                            }=${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}`}
                          >
                            <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="large" />
                          </LinkToTop>
                          <div className="d-flex justify-content-center">
                            <div className="position-relative filter-shadow" style={{ width: 96 }}>
                              <PokemonIconType pokemonType={value.pokemonType} size={48}>
                                <img
                                  alt="Image League"
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
                              <div className="d-flex align-items-center column-gap-2">
                                <b className="text-white text-shadow-black">{`#${value.id} ${splitAndCapitalize(
                                  value.name,
                                  '-',
                                  ' '
                                )}`}</b>
                                <TypeInfo
                                  isHideText
                                  isBlock
                                  isShowShadow
                                  height={20}
                                  color="white"
                                  arr={value.pokemonData?.types}
                                />
                              </div>
                              <div className="d-flex gap-2">
                                <TypeBadge
                                  isGrow
                                  isFind
                                  title="Fast Move"
                                  move={value.fMove}
                                  moveType={getMoveType(value.pokemonData, value.fMove?.name)}
                                />
                                <TypeBadge
                                  isGrow
                                  isFind
                                  title="Primary Charged Move"
                                  move={value.cMovePri}
                                  moveType={getMoveType(value.pokemonData, value.cMovePri?.name)}
                                />
                                {value.cMoveSec && (
                                  <TypeBadge
                                    isGrow
                                    isFind
                                    title="Secondary Charged Move"
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
    </Error>
  );
};

export default TeamPVP;
