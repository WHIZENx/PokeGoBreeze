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
} from '../../../util/utils';
import { calculateStatsByTag } from '../../../util/calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import {
  computeBgType,
  findAssetForm,
  getPokemonBattleLeagueIcon,
  getPokemonBattleLeagueName,
} from '../../../util/compute';

import update from 'immutability-helper';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { FORM_SHADOW, Params } from '../../../util/constants';
import { RouterState, StatsState, StoreState, TimestampState } from '../../../store/models/state.model';
import { RankingsPVP, Toggle } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { SpinnerActions } from '../../../store/actions';
import { AnyAction } from 'redux';
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
} from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { SortType } from '../enums/pvp-ranking-enum';
import { PokemonType } from '../../../enums/type.enum';
import HeaderPVP from '../components/HeaderPVP';
import BodyPVP from '../components/BodyPVP';
import MoveSet from '../components/MoveSet';
import TypeEffectivePVP from '../components/TypeEffectivePVP';
import OverAllStats from '../components/OverAllStats';
import { ScoreType } from '../../../util/enums/constants.enum';
import { SortDirectionType } from '../../Sheets/DpsTdo/enums/column-select-type.enum';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';

const RankingPVP = (props: IStyleSheetData) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const timestamp = useSelector((state: TimestampState) => state.timestamp);

  const [searchParams] = useSearchParams();
  const params = useParams();

  const [rankingData, setRankingData] = useState<IPokemonBattleRanking[]>([]);
  const [storeStats, setStoreStats] = useState<boolean[]>();
  const sortedBy = useRef(SortType.Score);
  const [sorted, setSorted] = useState(SortDirectionType.DESC);

  const [search, setSearch] = useState('');
  const [isFound, setIsFound] = useState(true);

  const statsRanking = useSelector((state: StatsState) => state.stats);

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
    loadPVP(dispatch, timestamp);
  }, []);

  const fetchPokemonRanking = useCallback(async () => {
    if (
      statsRanking?.attack?.ranking &&
      statsRanking?.defense?.ranking &&
      statsRanking?.stamina?.ranking &&
      statsRanking?.statProd?.ranking
    ) {
      dispatch(SpinnerActions.ShowSpinner.create());
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
          document.title = `PVP Ranking - ${getPokemonBattleLeagueName(cp)}`;
        } else {
          document.title = `PVP Ranking - ${
            params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
          } ${splitAndCapitalize(params.serie, '-', ' ')} (${capitalize(pvpType)})`;
        }
        const filePVP = file.map((data) => {
          const name = convertNameRankingToOri(data.speciesId, data.speciesName);
          const pokemon = dataStore.pokemons.find((pokemon) => isEqual(pokemon.slug, name));
          const id = pokemon?.num;
          const form = findAssetForm(dataStore.assets, pokemon?.num, pokemon?.form);

          const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

          const [fMoveData] = data.moveset;
          let [, cMoveDataPri, cMoveDataSec] = data.moveset;
          cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
          cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

          const fMove = dataStore.combats.find((item) => isEqual(item.name, fMoveData));
          const cMovePri = dataStore.combats.find((item) => isEqual(item.name, cMoveDataPri));
          let cMoveSec;
          if (cMoveDataSec) {
            cMoveSec = dataStore.combats.find((item) => isEqual(item.name, cMoveDataSec));
          }

          data.scorePVP = HexagonStats.create(data.scores);
          let pokemonType = PokemonType.Normal;
          if (isInclude(data.speciesName, `(${FORM_SHADOW})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
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
            atk: statsRanking.attack?.ranking?.find((i) => i.attack === stats.atk),
            def: statsRanking.defense?.ranking?.find((i) => i.defense === stats.def),
            sta: statsRanking.stamina?.ranking?.find((i) => i.stamina === stats.sta),
            prod: statsRanking.statProd?.ranking?.find((i) => i.product === stats.prod),
            fMove,
            cMovePri,
            cMoveSec,
            pokemonType,
          });
        });
        setRankingData(filePVP);
        setStoreStats([...Array(filePVP.length).keys()].map(() => false));
        dispatch(SpinnerActions.HideSpinner.create());
      } catch (e) {
        if ((e as AxiosError)?.status === 404) {
          setIsFound(false);
        } else {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({
              isError: true,
              message: (e as AxiosError).message,
            })
          );
        }
      }
    }
  }, [
    searchParams,
    params.serie,
    params.cp,
    statsRanking?.attack?.ranking,
    statsRanking?.defense?.ranking,
    statsRanking?.stamina?.ranking,
    statsRanking?.statProd?.ranking,
    dataStore.combats,
    dataStore.pokemons,
    dataStore.assets,
    dispatch,
  ]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonRanking();
      router.action = null as AnyAction[''];
    };
    if (
      statsRanking &&
      isNotEmpty(pvp.rankings) &&
      isNotEmpty(pvp.trains) &&
      isNotEmpty(dataStore.combats) &&
      isNotEmpty(dataStore.pokemons) &&
      isNotEmpty(dataStore.assets)
    ) {
      if (dataStore.combats.every((combat) => !combat.archetype)) {
        loadPVPMoves(dispatch);
      } else if (router.action) {
        fetchPokemon();
      }
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonRanking, rankingData, pvp.rankings, pvp.trains, router.action, dispatch]);

  const renderItem = (data: IPokemonBattleRanking, key: number) => (
    <Accordion.Item eventKey={key.toString()}>
      <Accordion.Header
        onClick={() => {
          if (storeStats && !storeStats[key]) {
            setStoreStats(update(storeStats, { [key]: { $set: true } }));
          }
        }}
      >
        <div className="d-flex align-items-center w-100" style={{ gap: '1rem' }}>
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
                  alt="img-league"
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
            <div style={{ marginRight: 15 }}>
              <span className="ranking-score score-ic">{data.data?.score}</span>
            </div>
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body
        style={{
          padding: 0,
          backgroundImage: computeBgType(data.pokemon?.types, data.pokemonType, props.styleSheet, 0.3),
        }}
      >
        {storeStats && storeStats[key] && (
          <Fragment>
            <div className="pokemon-ranking-body ranking-body">
              <div className="w-100 ranking-info element-top">
                <HeaderPVP data={data} />
                <hr />
                <BodyPVP
                  assets={dataStore.assets}
                  pokemonData={dataStore.pokemons}
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
                <OverAllStats
                  data={data}
                  statsRanking={statsRanking}
                  cp={params.cp}
                  type={searchParams.get(Params.LeagueType)}
                />
              </div>
              <div className="container">
                <hr />
                <TypeEffectivePVP types={data.pokemon?.types} />
              </div>
              <div className="container">
                <MoveSet moves={data.data?.moves} pokemon={data.pokemon} combatData={dataStore.combats} />
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
    const league = pvp.rankings.find((item) => isEqual(item.id, params.serie) && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league ? (
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
        ) : (
          <div className="ph-item element-top">
            <div
              className="ph-picture"
              style={{ width: '40%', height: 64, paddingLeft: 0, paddingRight: 0, marginBottom: 0 }}
            />
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Error isError={!isFound}>
      <div className="container pvp-container element-bottom">
        {renderLeague()}
        <hr />
        <div className="element-top ranking-link-group">
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
        <div className="input-group border-input">
          <input
            type="text"
            className="form-control input-search"
            placeholder="Enter Name or ID"
            defaultValue={search}
            onKeyUp={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <div className="ranking-container" onScroll={listenScrollEvent.bind(this)}>
          <div className="ranking-group w-100 ranking-header" style={{ columnGap: '1rem' }}>
            <div />
            <div className="d-flex" style={{ marginRight: 15 }}>
              <div
                className="text-center"
                style={{ width: 'max-content' }}
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
          <Accordion alwaysOpen={true}>
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
