import React, { useState, useEffect, Fragment, useRef } from 'react';
import '../PVP.scss';

import { convertNameRankingToOri, splitAndCapitalize, capitalize, getStyleSheet, replaceTempMovePvpName } from '../../../util/utils';
import { calculateStatsByTag } from '../../../util/calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import { computeBgType, findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';

import update from 'immutability-helper';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Body, Header, MoveSet, OverAllStats, TypeEffective } from '../Model';

import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { FORM_NORMAL, FORM_SHADOW, scoreType } from '../../../util/constants';
import { Action } from 'history';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP, Toggle } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { Combat } from '../../../core/models/combat.model';
import { SpinnerActions } from '../../../store/actions';
import { AnyAction } from 'redux';
import { LocalStorageConfig } from '../../../store/constants/localStorage';
import { LocalTimeStamp } from '../../../store/models/local-storage.model';
import { combineClasses, DynamicObj, getValueOrDefault, isNotEmpty, toNumber } from '../../../util/extension';

const RankingPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.TIMESTAMP, JSON.stringify(new LocalTimeStamp()));
  const [statePVP, setStatePVP] = useLocalStorage(LocalStorageConfig.PVP, '');
  const params = useParams();

  const [rankingData, setRankingData] = useState<IPokemonBattleRanking[]>([]);
  const [storeStats, setStoreStats] = useState<boolean[]>();
  const [onLoadData, setOnLoadData] = useState(false);
  const sortedBy = useRef('score');
  const [sorted, setSorted] = useState(1);

  const styleSheet = useRef<CSSStyleSheet>();

  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: StatsState) => state.stats);

  const LeaveToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        {props.children}
      </div>
    );
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
          await APIService.getFetchUrl<RankingsPVP[]>(
            APIService.getRankingFile(getValueOrDefault(String, params.serie), cp, getValueOrDefault(String, params.type))
          )
        ).data;
        if (!file) {
          return;
        }
        if (params.serie === 'all') {
          document.title = `PVP Ranking - ${getPokemonBattleLeagueName(cp)}`;
        } else {
          document.title = `PVP Ranking - ${params.serie === 'remix' ? getPokemonBattleLeagueName(cp) : ''} ${splitAndCapitalize(
            params.serie,
            '-',
            ' '
          )} (${capitalize(params.type)})`;
        }
        const filePVP = file.map((item) => {
          const name = convertNameRankingToOri(item.speciesId, item.speciesName);
          const pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === name);
          const id = pokemon?.num;
          const form = findAssetForm(getValueOrDefault(Array, dataStore?.assets), pokemon?.num, pokemon?.forme ?? FORM_NORMAL);

          const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

          if (!styleSheet.current) {
            styleSheet.current = getStyleSheet(`.${pokemon?.types.at(0)?.toLowerCase()}`);
          }

          let fMoveData = item.moveset.at(0);
          const cMoveDataPri = replaceTempMovePvpName(getValueOrDefault(String, item.moveset.at(1)));
          const cMoveDataSec = replaceTempMovePvpName(getValueOrDefault(String, item.moveset.at(2)));
          if (fMoveData?.includes('HIDDEN_POWER')) {
            fMoveData = 'HIDDEN_POWER';
          }

          let fMove = dataStore?.combat?.find((item) => item.name === fMoveData);
          const cMovePri = dataStore?.combat?.find((item) => item.name === cMoveDataPri);
          let cMoveSec;
          if (cMoveDataSec) {
            cMoveSec = dataStore?.combat?.find((item) => item.name === cMoveDataSec);
          }

          if (fMove && item.moveset.at(0)?.includes('HIDDEN_POWER')) {
            fMove = Combat.create({ ...fMove, type: getValueOrDefault(String, item.moveset.at(0)?.split('_').at(2)) });
          }

          return new PokemonBattleRanking({
            data: item,
            score: item.score,
            id,
            speciesId: item.speciesId,
            name,
            form,
            pokemon,
            stats,
            atk: statsRanking?.attack.ranking.find((i) => i.attack === stats.atk),
            def: statsRanking?.defense.ranking.find((i) => i.defense === stats.def),
            sta: statsRanking?.stamina.ranking.find((i) => i.stamina === getValueOrDefault(Number, stats.sta)),
            prod: statsRanking?.statProd.ranking.find((i) => i.prod === stats.atk * stats.def * getValueOrDefault(Number, stats.sta)),
            fMove,
            cMovePri,
            cMoveSec,
            shadow: item.speciesName.toUpperCase().includes(`(${FORM_SHADOW})`),
            purified:
              pokemon?.purifiedMoves?.includes(getValueOrDefault(String, cMovePri?.name)) ||
              (cMoveDataSec && pokemon?.purifiedMoves?.includes(cMoveDataSec)) === true,
          });
        });
        setRankingData(filePVP);
        setStoreStats([...Array(filePVP.length).keys()].map(() => false));
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
    if (statsRanking && isNotEmpty(dataStore?.combat) && isNotEmpty(dataStore?.pokemon) && isNotEmpty(dataStore?.assets) && !onLoadData) {
      setOnLoadData(true);
      if (router.action === Action.Push) {
        router.action = null as AnyAction[''];
        setTimeout(() => fetchPokemon(), 100);
      } else if (!isNotEmpty(rankingData) && pvp) {
        fetchPokemon();
      }
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [
    dispatch,
    params.serie,
    params.cp,
    params.type,
    rankingData,
    pvp,
    router.action,
    onLoadData,
    statsRanking,
    dataStore?.combat,
    dataStore?.pokemon,
    dataStore?.assets,
  ]);

  const renderItem = (data: IPokemonBattleRanking, key: number) => {
    return (
      <Accordion.Item eventKey={key.toString()}>
        <Accordion.Header
          onClick={() => {
            if (storeStats && !storeStats[key]) {
              setStoreStats(update(storeStats, { [key]: { $set: true } }));
            }
          }}
        >
          <div className="d-flex align-items-center w-100" style={{ gap: '1rem' }}>
            <Link to={`/pvp/${params.cp}/overall/${data.speciesId?.replaceAll('_', '-')}`}>
              <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
            </Link>
            <div className="d-flex justify-content-center">
              <span className="position-relative" style={{ width: 50 }}>
                {data.shadow && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                {data.purified && <img height={28} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />}
                <img
                  alt="img-league"
                  className="pokemon-sprite-accordion"
                  src={data.form ? APIService.getPokemonModel(data.form) : APIService.getPokeFullSprite(data.id)}
                />
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
            backgroundImage: computeBgType(data.pokemon?.types, data.shadow, data.purified, 0.8, styleSheet.current),
          }}
        >
          {storeStats && storeStats[key] && (
            <Fragment>
              <div className="pokemon-ranking-body ranking-body">
                <div className="w-100 ranking-info element-top">
                  {Header(data)}
                  <hr />
                  {Body(
                    getValueOrDefault(Array, dataStore?.assets),
                    getValueOrDefault(Array, dataStore?.pokemon),
                    data.data,
                    params.cp,
                    params.type
                  )}
                </div>
                <div className="container">
                  <hr />
                </div>
                <div className="stats-container">{OverAllStats(data, statsRanking, getValueOrDefault(String, params.cp))}</div>
                <div className="container">
                  <hr />
                  {TypeEffective(getValueOrDefault(Array, data.pokemon?.types))}
                </div>
                <div className="container">{MoveSet(data.data?.moves, data.pokemon, getValueOrDefault(Array, dataStore?.combat))}</div>
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
  };

  const setSortedPokemonBattle = (primary: IPokemonBattleRanking, secondary: IPokemonBattleRanking) => {
    const a = primary as unknown as DynamicObj<number>;
    const b = secondary as unknown as DynamicObj<number>;
    return sorted ? b[sortedBy.current] - a[sortedBy.current] : a[sortedBy.current] - b[sortedBy.current];
  };

  const renderLeague = () => {
    const cp = toNumber(getValueOrDefault(String, params.cp));
    const league = pvp?.rankings.find((item) => item.id === params.serie && item.cp.includes(cp));
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
              <b>{league.name === 'All' ? getPokemonBattleLeagueName(cp) : league.name}</b>
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
          {scoreType.map((type, index) => (
            <Button
              key={index}
              className={params.type?.toLowerCase() === type.toLowerCase() ? 'active' : ''}
              onClick={() => {
                setOnLoadData(false);
                navigate(`/pvp/rankings/${params.serie}/${params.cp}/${type.toLowerCase()}`);
              }}
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
        <div className="ranking-container">
          <div className="ranking-group w-100 ranking-header" style={{ columnGap: '1rem' }}>
            <div />
            <div className="d-flex" style={{ marginRight: 15 }}>
              <div
                className="text-center"
                style={{ width: 'max-content' }}
                onClick={() => {
                  setSorted(sorted ? 0 : 1);
                }}
              >
                <span className={combineClasses('ranking-sort ranking-score', sortedBy.current === 'score' ? 'ranking-selected' : '')}>
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
                  splitAndCapitalize(pokemon.name, '-', ' ').toLowerCase().includes(search.toLowerCase()) ||
                  pokemon.id?.toString().includes(search)
              )
              .sort((a, b) => setSortedPokemonBattle(a, b))
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
