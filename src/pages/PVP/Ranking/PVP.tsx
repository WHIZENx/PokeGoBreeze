import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import '../PVP.scss';

import {
  convertNameRankingToOri,
  splitAndCapitalize,
  capitalize,
  replaceTempMovePvpName,
  getKeysObj,
  getValidPokemonImgPath,
  getKeyWithData,
} from '../../../utils/utils';
import { calculateStatsByTag } from '../../../utils/calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/api.service';
import { computeBgType, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';

import update from 'immutability-helper';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { Params } from '../../../utils/constants';
import { RankingsPVP, Toggle } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../../utils/extension';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { SortType } from '../enums/pvp-ranking.enum';
import { PokemonType } from '../../../enums/type.enum';
import HeaderPVP from '../components/HeaderPVP';
import BodyPVP from '../components/BodyPVP';
import MoveSet from '../components/MoveSet';
import TypeEffectivePVP from '../components/TypeEffectivePVP';
import OverAllStats from '../components/OverAllStats';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { formShadow } from '../../../utils/helpers/options-context.helpers';
import useDataStore from '../../../composables/useDataStore';
import usePVP from '../../../composables/usePVP';
import useAssets from '../../../composables/useAssets';
import useRouter from '../../../composables/useRouter';
import useStats from '../../../composables/useStats';
import useSpinner from '../../../composables/useSpinner';
import useCombats from '../../../composables/useCombats';
import usePokemon from '../../../composables/usePokemon';
import InputSearch from '../../../components/Input/InputSearch';

const RankingPVP = (props: IStyleSheetData) => {
  const navigate = useNavigate();
  const { pvpData } = useDataStore();
  const { findPokemonBySlug } = usePokemon();
  const { findMoveByName, isCombatsNoneArchetype } = useCombats();
  const { getAssetNameById } = useAssets();
  const { loadPVP, loadPVPMoves } = usePVP();
  const { routerAction } = useRouter();
  const { statsData } = useStats();
  const { showSpinner, hideSpinner, showSpinnerMsg } = useSpinner();

  const [searchParams] = useSearchParams();
  const params = useParams();

  const [rankingData, setRankingData] = useState<IPokemonBattleRanking[]>([]);
  const [storeStats, setStoreStats] = useState<boolean[]>();
  const sortedBy = useRef(SortType.Score);
  const [sorted, setSorted] = useState(SortDirectionType.DESC);

  const [search, setSearch] = useState('');
  const [isFound, setIsFound] = useState(true);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const LeaveToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        {props.children}
      </div>
    );
  };

  useEffect(() => {
    loadPVP();
  }, []);

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PVP Ranking',
    description:
      'View detailed rankings of the best Pokémon for PVP battles in Pokémon GO. Compare stats, movesets, and performance across all leagues.',
    keywords: ['Pokémon GO', 'PVP ranking', 'best PVP Pokémon', 'meta rankings', 'battle league', 'PokéGO Breeze'],
  });

  useTitle(titleProps);

  const fetchPokemonRanking = useCallback(async () => {
    if (
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      showSpinner();
      try {
        const cp = toNumber(params.cp);
        const pvpType = getValueOrDefault(
          String,
          searchParams.get(Params.LeagueType),
          getKeyWithData(ScoreType, ScoreType.Overall)
        ).toLowerCase();
        const file = (await APIService.getFetchUrl<RankingsPVP[]>(APIService.getRankingFile(params.serie, cp, pvpType)))
          .data;
        if (!isNotEmpty(file)) {
          setIsFound(false);
          return;
        }
        if (params.serie === LeagueBattleType.All) {
          setTitleProps({
            title: `PVP Ranking - ${getPokemonBattleLeagueName(cp)}`,
            description: `Top ranked Pokémon for ${getPokemonBattleLeagueName(
              cp
            )} PVP battles in Pokémon GO. Find the best Pokémon with optimal stats and movesets.`,
            keywords: [
              'Pokémon GO',
              `${getPokemonBattleLeagueName(cp)}`,
              'PVP ranking',
              'best PVP Pokémon',
              'meta rankings',
              'PokéGO Breeze',
            ],
            image: getPokemonBattleLeagueIcon(cp),
          });
        } else {
          setTitleProps({
            title: `PVP Ranking - ${
              params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
            } ${splitAndCapitalize(params.serie, '-', ' ')} (${capitalize(pvpType)})`,
            description: `Top ranked Pokémon for ${
              params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
            } ${splitAndCapitalize(params.serie, '-', ' ')} (${capitalize(
              pvpType
            )}) battles in Pokémon GO. Find the best Pokémon with optimal stats and movesets.`,
            keywords: [
              'Pokémon GO',
              `${splitAndCapitalize(params.serie, '-', ' ')}`,
              `${params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''}`,
              'PVP ranking',
              `${capitalize(pvpType)} ranking`,
              'best PVP Pokémon',
              'meta rankings',
              'PokéGO Breeze',
            ],
            image: getPokemonBattleLeagueIcon(cp),
          });
        }
        const filePVP = file.map((data) => {
          const name = convertNameRankingToOri(data.speciesId, data.speciesName);
          const pokemon = findPokemonBySlug(name);
          const id = pokemon?.num;
          const form = getAssetNameById(id, name, pokemon?.form);

          const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

          const [fMoveData] = data.moveset;
          let [, cMoveDataPri, cMoveDataSec] = data.moveset;
          cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
          cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

          const fMove = findMoveByName(fMoveData);
          const cMovePri = findMoveByName(cMoveDataPri);
          let cMoveSec;
          if (cMoveDataSec) {
            cMoveSec = findMoveByName(cMoveDataSec);
          }

          data.scorePVP = HexagonStats.create(data.scores);
          let pokemonType = PokemonType.Normal;
          if (isInclude(data.speciesName, `(${formShadow()})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
            pokemonType = PokemonType.Shadow;
          } else if (
            isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) ||
            isIncludeList(pokemon?.purifiedMoves, cMoveDataSec)
          ) {
            pokemonType = PokemonType.Purified;
          }

          return new PokemonBattleRanking({
            data,
            id,
            name,
            form,
            pokemon,
            stats,
            atk: statsData?.attack?.ranking?.find((i) => i.attack === stats.atk),
            def: statsData?.defense?.ranking?.find((i) => i.defense === stats.def),
            sta: statsData?.stamina?.ranking?.find((i) => i.stamina === stats.sta),
            prod: statsData?.statProd?.ranking?.find((i) => i.product === stats.prod),
            fMove,
            cMovePri,
            cMoveSec,
            pokemonType,
          });
        });
        setRankingData(filePVP);
        setStoreStats([...Array(filePVP.length).keys()].map(() => false));
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
    }
  }, [
    searchParams,
    params.serie,
    params.cp,
    statsData?.attack?.ranking,
    statsData?.defense?.ranking,
    statsData?.stamina?.ranking,
    statsData?.statProd?.ranking,
    findMoveByName,
    findPokemonBySlug,
  ]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonRanking();
    };
    if (statsData && isNotEmpty(pvpData.rankings) && isNotEmpty(pvpData.trains)) {
      if (isCombatsNoneArchetype()) {
        loadPVPMoves();
      } else if (routerAction) {
        fetchPokemon();
      }
    }
    return () => {
      hideSpinner();
    };
  }, [fetchPokemonRanking, pvpData.rankings, pvpData.trains, routerAction]);

  const renderItem = (data: IPokemonBattleRanking, key: number) => (
    <Accordion.Item eventKey={key.toString()}>
      <Accordion.Header
        onClick={() => {
          if (storeStats && !storeStats[key]) {
            setStoreStats(update(storeStats, { [key]: { $set: true } }));
          }
        }}
      >
        <div className="d-flex align-items-center w-100 gap-3">
          <LinkToTop
            to={`/pvp/${params.cp}/${params.serie?.toLowerCase()}/${data.data?.speciesId?.replaceAll('_', '-')}?${
              Params.LeagueType
            }=${getValueOrDefault(
              String,
              searchParams.get(Params.LeagueType),
              getKeyWithData(ScoreType, ScoreType.Overall)
            ).toLowerCase()}`}
          >
            <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="large" />
          </LinkToTop>
          <div className="d-flex justify-content-center">
            <span className="position-relative" style={{ width: 50 }}>
              <PokemonIconType pokemonType={data.pokemonType} size={28}>
                <img
                  alt="Image League"
                  className="pokemon-sprite-accordion"
                  src={APIService.getPokemonModel(data.form, data.id)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, data.id, data.form);
                  }}
                />
              </PokemonIconType>
            </span>
          </div>
          <div className="ranking-group w-100">
            <b>{`#${data.id} ${splitAndCapitalize(data.name, '-', ' ')}`}</b>
            <div className="ms-3">
              <span className="ranking-score score-ic text-black">{data.data?.score}</span>
            </div>
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body
        className="p-0"
        style={{
          backgroundImage: computeBgType(data.pokemon?.types, data.pokemonType, props.styleSheet, 0.3),
        }}
      >
        {storeStats && storeStats[key] && (
          <Fragment>
            <div className="pokemon-ranking-body ranking-body">
              <div className="w-100 ranking-info mt-2">
                <HeaderPVP data={data} />
                <hr />
                <BodyPVP
                  data={data.data}
                  cp={params.cp}
                  serie={params.serie}
                  type={searchParams.get(Params.LeagueType)}
                  styleList={props.styleSheet}
                />
              </div>
              <div className="container">
                <hr />
              </div>
              <div className="stats-container">
                <OverAllStats data={data} cp={params.cp} type={searchParams.get(Params.LeagueType)} />
              </div>
              <div className="container">
                <hr />
                <TypeEffectivePVP types={data.pokemon?.types} />
              </div>
              <div className="container">
                <MoveSet moves={data.data?.moves} pokemon={data.pokemon} />
              </div>
            </div>
            <LeaveToggle eventKey={key.toString()}>
              <span className="text-danger">
                Close <CloseIcon sx={{ color: 'red' }} />
              </span>
            </LeaveToggle>
          </Fragment>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );

  const setSortedPokemonBattle = (primary: IPokemonBattleRanking, secondary: IPokemonBattleRanking) => {
    const sortedColumn = getPropertyName(primary.data || secondary.data, (o) => o.score);
    const a = primary.data as unknown as DynamicObj<number>;
    const b = secondary.data as unknown as DynamicObj<number>;
    return sorted === SortDirectionType.DESC ? b[sortedColumn] - a[sortedColumn] : a[sortedColumn] - b[sortedColumn];
  };

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvpData.rankings.find((item) => isEqual(item.id, params.serie) && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league ? (
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
        ) : (
          <div className="ph-item mt-2">
            <div className="ph-picture mb-0 px-0 h-9 w-pct-40" />
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Error isError={!isFound}>
      <div className="container pvp-container pb-3">
        {renderLeague()}
        <hr />
        <div className="mt-2 ranking-link-group">
          {getKeysObj(ScoreType).map((type, index) => (
            <Button
              key={index}
              className={
                isEqual(
                  getValueOrDefault(
                    String,
                    searchParams.get(Params.LeagueType),
                    getKeyWithData(ScoreType, ScoreType.Overall)
                  ),
                  type,
                  EqualMode.IgnoreCaseSensitive
                )
                  ? 'active'
                  : ''
              }
              onClick={() =>
                navigate(`/pvp/rankings/${params.serie}/${params.cp}?${Params.LeagueType}=${type.toLowerCase()}`)
              }
            >
              {type}
            </Button>
          ))}
        </div>
        <InputSearch value={search} placeholder="Enter Name or ID" onChange={(value) => setSearch(value)} />
        <div className="ranking-container" onScroll={listenScrollEvent.bind(this)}>
          <div className="ranking-group w-100 ranking-header column-gap-3">
            <div />
            <div className="d-flex me-3">
              <div
                className="text-center w-max-content"
                onClick={() =>
                  setSorted(sorted === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC)
                }
              >
                <span
                  className={combineClasses(
                    'ranking-sort ranking-score',
                    sortedBy.current === SortType.Score ? 'ranking-selected' : ''
                  )}
                >
                  Score
                  {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                </span>
              </div>
            </div>
          </div>
          <Accordion alwaysOpen>
            {rankingData
              .filter(
                (pokemon) =>
                  pokemon.id &&
                  (isInclude(
                    splitAndCapitalize(pokemon.name, '-', ' '),
                    search,
                    IncludeMode.IncludeIgnoreCaseSensitive
                  ) ||
                    isInclude(pokemon.id, search))
              )
              .sort((a, b) => setSortedPokemonBattle(a, b))
              .slice(0, firstInit.current + eachCounter.current * startIndex)
              .map((value, index) => (
                <Fragment key={index}>{renderItem(value, index)}</Fragment>
              ))}
          </Accordion>
        </div>
      </div>
    </Error>
  );
};

export default RankingPVP;
