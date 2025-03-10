import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import '../PVP.scss';

import {
  convertNameRankingToOri,
  splitAndCapitalize,
  capitalize,
  getStyleSheet,
  replaceTempMovePvpName,
  getKeyWithData,
  getKeysObj,
  getValidPokemonImgPath,
} from '../../../util/utils';
import { calculateStatsByTag } from '../../../util/calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import { computeBgType, findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';

import update from 'immutability-helper';
import { useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { FORM_SHADOW } from '../../../util/constants';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP, Toggle } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { SpinnerActions } from '../../../store/actions';
import { AnyAction } from 'redux';
import { LocalStorageConfig } from '../../../store/constants/localStorage';
import { LocalTimeStamp } from '../../../store/models/local-storage.model';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
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

const RankingPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, JSON.stringify(new LocalTimeStamp()));
  const [statePVP, setStatePVP] = useLocalStorage(LocalStorageConfig.PVP, '');
  const params = useParams();

  const [rankingData, setRankingData] = useState<IPokemonBattleRanking[]>([]);
  const [storeStats, setStoreStats] = useState<boolean[]>();
  const sortedBy = useRef(SortType.Score);
  const [sorted, setSorted] = useState(SortDirectionType.DESC);

  const styleSheet = useRef<CSSStyleSheet>();

  const [search, setSearch] = useState('');
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
    if (!isNotEmpty(pvp.rankings) && !isNotEmpty(pvp.trains)) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  const fetchPokemonRanking = useCallback(async () => {
    dispatch(SpinnerActions.ShowSpinner.create());
    try {
      const cp = toNumber(params.cp);
      const file = (await APIService.getFetchUrl<RankingsPVP[]>(APIService.getRankingFile(params.serie, cp, params.type))).data;
      if (!isNotEmpty(file)) {
        return;
      }
      if (params.serie === LeagueBattleType.All) {
        document.title = `PVP Ranking - ${getPokemonBattleLeagueName(cp)}`;
      } else {
        document.title = `PVP Ranking - ${
          params.serie === LeagueBattleType.Remix ? getPokemonBattleLeagueName(cp) : ''
        } ${splitAndCapitalize(params.serie, '-', ' ')} (${capitalize(params.type)})`;
      }
      const filePVP = file.map((item) => {
        const name = convertNameRankingToOri(item.speciesId, item.speciesName);
        const pokemon = dataStore.pokemon.find((pokemon) => isEqual(pokemon.slug, name));
        const id = pokemon?.num;
        const form = findAssetForm(dataStore.assets, pokemon?.num, pokemon?.forme);

        const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

        if (!styleSheet.current) {
          styleSheet.current = getStyleSheet(`.${pokemon?.types.at(0)?.toLowerCase()}`);
        }

        const [fMoveData] = item.moveset;
        let [, cMoveDataPri, cMoveDataSec] = item.moveset;
        cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
        cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

        const fMove = dataStore.combat.find((item) => isEqual(item.name, fMoveData));
        const cMovePri = dataStore.combat.find((item) => isEqual(item.name, cMoveDataPri));
        let cMoveSec;
        if (cMoveDataSec) {
          cMoveSec = dataStore.combat.find((item) => isEqual(item.name, cMoveDataSec));
        }

        let pokemonType = PokemonType.Normal;
        if (isInclude(item.speciesName, `(${FORM_SHADOW})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
          pokemonType = PokemonType.Shadow;
        } else if (isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) || isIncludeList(pokemon?.purifiedMoves, cMoveDataSec)) {
          pokemonType = PokemonType.Purified;
        }

        return new PokemonBattleRanking({
          data: item,
          id,
          name,
          form,
          pokemon,
          stats,
          atk: statsRanking?.attack.ranking.find((i) => i.attack === stats.atk),
          def: statsRanking?.defense.ranking.find((i) => i.defense === stats.def),
          sta: statsRanking?.stamina.ranking.find((i) => i.stamina === toNumber(stats.sta)),
          prod: statsRanking?.statProd.ranking.find((i) => i.product === stats.atk * stats.def * toNumber(stats.sta)),
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
      dispatch(
        SpinnerActions.ShowSpinnerMsg.create({
          isError: true,
          message: (e as Error).message,
        })
      );
    }
  }, [params.serie, params.type, params.cp, statsRanking, dataStore.combat, dataStore.pokemon, dataStore.assets, dispatch]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonRanking();
      router.action = null as AnyAction[''];
    };
    if (statsRanking && isNotEmpty(dataStore.combat) && isNotEmpty(dataStore.pokemon) && isNotEmpty(dataStore.assets)) {
      if (dataStore.combat.every((combat) => !combat.archetype)) {
        loadPVPMoves(dispatch);
      } else if (router.action) {
        fetchPokemon();
      }
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonRanking, rankingData, pvp, router.action, dispatch]);

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
            to={`/pvp/${params.cp}/${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}/${data.data?.speciesId?.replaceAll(
              '_',
              '-'
            )}`}
          >
            <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
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
          backgroundImage: computeBgType(data.pokemon?.types, data.pokemonType, 0.8, styleSheet.current),
        }}
      >
        {storeStats && storeStats[key] && (
          <Fragment>
            <div className="pokemon-ranking-body ranking-body">
              <div className="w-100 ranking-info element-top">
                <HeaderPVP data={data} />
                <hr />
                <BodyPVP assets={dataStore.assets} pokemonData={dataStore.pokemon} data={data.data} cp={params.cp} type={params.type} />
              </div>
              <div className="container">
                <hr />
              </div>
              <div className="stats-container">
                <OverAllStats data={data} statsRanking={statsRanking} cp={params.cp} type={params.type} />
              </div>
              <div className="container">
                <hr />
                <TypeEffectivePVP types={data.pokemon?.types} />
              </div>
              <div className="container">
                <MoveSet moves={data.data?.moves} pokemon={data.pokemon} combatData={dataStore.combat} />
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
                {isEqual(league.name, LeagueBattleType.All, EqualMode.IgnoreCaseSensitive) ? getPokemonBattleLeagueName(cp) : league.name}
              </b>
            </h2>
          </div>
        ) : (
          <div className="ph-item element-top">
            <div className="ph-picture" style={{ width: '40%', height: 64, paddingLeft: 0, paddingRight: 0, marginBottom: 0 }} />
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className="container pvp-container element-bottom">
        {renderLeague()}
        <hr />
        <div className="element-top ranking-link-group">
          {getKeysObj(ScoreType).map((type, index) => (
            <Button
              key={index}
              className={isEqual(params.type, type, EqualMode.IgnoreCaseSensitive) ? 'active' : ''}
              onClick={() => navigate(`/pvp/rankings/${params.serie}/${params.cp}/${type.toLowerCase()}`)}
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
                onClick={() => setSorted(sorted === SortDirectionType.DESC ? SortDirectionType.ASC : SortDirectionType.DESC)}
              >
                <span
                  className={combineClasses('ranking-sort ranking-score', sortedBy.current === SortType.Score ? 'ranking-selected' : '')}
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
                  (isInclude(splitAndCapitalize(pokemon.name, '-', ' '), search, IncludeMode.IncludeIgnoreCaseSensitive) ||
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
    </Fragment>
  );
};

export default RankingPVP;
