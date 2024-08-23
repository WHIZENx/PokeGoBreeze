import '../PVP.scss';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { capitalize, convertNameRankingToOri, isNotEmpty, replaceTempMovePvpName, splitAndCapitalize } from '../../../util/Utils';
import { useNavigate, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import { computeBgType, findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/Compute';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import Error from '../../Error/Error';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';
import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from 'react-bootstrap';
import { FORM_NORMAL, FORM_SHADOW, MAX_IV, maxLevel, scoreType } from '../../../util/Constants';
import { Action } from 'history';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { BattleBaseStats } from '../../../util/models/calculate.model';
import { Combat } from '../../../core/models/combat.model';
import { SpinnerActions } from '../../../store/actions';

const PokemonPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const params = useParams();
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
    })
  );
  const [statePVP, setStatePVP] = useLocalStorage('pvp', '');

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [found, setFound] = useState(true);

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  const fetchPokemonInfo = useCallback(async () => {
    dispatch(SpinnerActions.ShowSpinner.create());
    try {
      const cp = parseInt(params.cp ?? '');
      const paramName = params.pokemon?.replaceAll('-', '_').toLowerCase();
      const data = (
        await APIService.getFetchUrl<RankingsPVP[]>(
          APIService.getRankingFile(paramName?.includes('_mega') ? 'mega' : 'all', cp, params.type ?? '')
        )
      ).data.find((pokemon) => pokemon.speciesId === paramName);

      if (!data) {
        setFound(false);
        return;
      }

      const name = convertNameRankingToOri(data.speciesId, data.speciesName);
      const pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === name);
      const id = pokemon?.num;
      const form = findAssetForm(dataStore?.assets ?? [], pokemon?.num, pokemon?.forme ?? FORM_NORMAL);
      document.title = `#${id} ${splitAndCapitalize(name, '-', ' ')} - ${getPokemonBattleLeagueName(cp)} (${capitalize(params.type)})`;

      const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

      let fMoveData = data.moveset.at(0);
      const cMoveDataPri = replaceTempMovePvpName(data.moveset.at(1) ?? '');
      const cMoveDataSec = replaceTempMovePvpName(data.moveset.at(2) ?? '');
      if (fMoveData?.includes('HIDDEN_POWER')) {
        fMoveData = 'HIDDEN_POWER';
      }

      let fMove = dataStore?.combat?.find((item) => item.name === fMoveData);
      const cMovePri = dataStore?.combat?.find((item) => item.name === cMoveDataPri);
      let cMoveSec;
      if (cMoveDataSec) {
        cMoveSec = dataStore?.combat?.find((item) => item.name === cMoveDataSec);
      }

      if (fMove && data.moveset.at(0)?.includes('HIDDEN_POWER')) {
        fMove = Combat.create({ ...fMove, type: data.moveset.at(0)?.split('_').at(2) ?? '' });
      }

      const maxCP = parseInt(params.cp ?? '');

      let bestStats = new BattleBaseStats();
      if (maxCP < 10000) {
        let minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
        const maxPokeCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, (stats?.sta ?? 0) + MAX_IV, maxLevel);

        if (maxPokeCP < minCP) {
          if (maxPokeCP <= 500) {
            minCP = 0;
          } else if (maxPokeCP <= 1500) {
            minCP = 500;
          } else if (maxPokeCP <= 2500) {
            minCP = 1500;
          } else {
            minCP = 2500;
          }
        }
        const allStats = calStatsProd(stats.atk, stats.def, stats?.sta ?? 0, minCP, maxCP);
        bestStats = allStats[allStats.length - 1];
      }

      setRankingPoke(
        new PokemonBattleRanking({
          data,
          score: data.score,
          id,
          name,
          pokemon,
          form,
          stats,
          atk: statsRanking?.attack.ranking.find((i) => i.attack === stats.atk),
          def: statsRanking?.defense.ranking.find((i) => i.defense === stats.def),
          sta: statsRanking?.stamina.ranking.find((i) => i.stamina === (stats?.sta ?? 0)),
          prod: statsRanking?.statProd.ranking.find((i) => i.prod === stats.atk * stats.def * (stats?.sta ?? 0)),
          fMove,
          cMovePri,
          cMoveSec,
          bestStats,
          shadow: data.speciesName.toUpperCase().includes(`(${FORM_SHADOW})`) ?? false,
          purified:
            (pokemon?.purifiedMoves?.includes(cMovePri?.name ?? '') ||
              (cMoveDataSec !== null && cMoveDataSec !== undefined && pokemon?.purifiedMoves?.includes(cMoveDataSec))) ??
            false,
        })
      );
      dispatch(SpinnerActions.HideSpinner.create());
    } catch (e: any) {
      setFound(false);
      dispatch(
        SpinnerActions.ShowSpinnerMsg.create({
          error: true,
          message: e.message,
        })
      );
    }
  }, [params.type, params.pokemon, params.cp, statsRanking, dataStore?.combat, dataStore?.pokemon, dataStore?.assets]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
    };
    if (statsRanking && isNotEmpty(dataStore?.combat) && isNotEmpty(dataStore?.pokemon) && isNotEmpty(dataStore?.assets)) {
      if (dataStore?.combat.every((combat) => !combat.archetype)) {
        loadPVPMoves(dispatch);
      } else {
        if (router.action === Action.Push) {
          router.action = null as any;
          setTimeout(() => fetchPokemon(), 100);
        } else if (!rankingPoke && pvp) {
          fetchPokemon();
        }
      }
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonInfo, rankingPoke, pvp, router.action]);

  const renderLeague = () => {
    const cp = parseInt(params.cp ?? '');
    const league = pvp?.rankings.find((item) => item.id === 'all' && item.cp.includes(cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center filter-shadow text-shadow text-white" style={{ columnGap: 10 }}>
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
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!found ? (
        <Error />
      ) : (
        <div
          style={{
            backgroundImage: computeBgType(
              rankingPoke?.pokemon?.types,
              rankingPoke?.shadow,
              rankingPoke?.purified,
              0.8,
              undefined,
              rankingPoke ? null : 'rgb(100, 100, 100)'
            ),
            paddingTop: 15,
            paddingBottom: 15,
          }}
        >
          <div className="pokemon-ranking-body container pvp-container">
            {renderLeague()}
            <hr />
            <div className="ranking-link-group" style={{ paddingTop: 10 }}>
              {scoreType.map((type, index) => (
                <Button
                  key={index}
                  className={params.type?.toLowerCase() === type.toLowerCase() ? 'active' : ''}
                  onClick={() => navigate(`/pvp/${params.cp}/${type.toLowerCase()}/${params.pokemon}`)}
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="w-100 ranking-info element-top">
              <div className="d-flex flex-wrap align-items-center justify-content-center" style={{ gap: '2rem' }}>
                <div className="position-relative filter-shadow" style={{ width: 128 }}>
                  {rankingPoke?.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                  {rankingPoke?.purified && (
                    <img height={64} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                  )}
                  <img
                    alt="img-league"
                    className="pokemon-sprite-raid"
                    src={rankingPoke?.form ? APIService.getPokemonModel(rankingPoke?.form) : APIService.getPokeFullSprite(rankingPoke?.id)}
                  />
                </div>
                <div>
                  <div className="d-flex flex-wrap align-items-center" style={{ gap: 15 }}>
                    <h3 className="text-white text-shadow">
                      {rankingPoke?.id && (
                        <b>
                          #{rankingPoke.id} {splitAndCapitalize(rankingPoke?.name, '-', ' ')}
                        </b>
                      )}
                    </h3>
                    <TypeInfo shadow={true} block={true} color={'white'} arr={rankingPoke?.pokemon?.types} />
                  </div>
                  <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
                    Recommend Moveset in PVP
                  </h6>
                  <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Fast Move"
                      color={'white'}
                      move={rankingPoke?.fMove}
                      elite={rankingPoke?.pokemon?.eliteQuickMove?.includes(rankingPoke?.fMove?.name ?? '')}
                    />
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Primary Charged Move"
                      color={'white'}
                      move={rankingPoke?.cMovePri}
                      elite={rankingPoke?.pokemon?.eliteCinematicMove?.includes(rankingPoke?.cMovePri?.name ?? '')}
                      shadow={rankingPoke?.pokemon?.shadowMoves?.includes(rankingPoke?.cMovePri?.name ?? '')}
                      purified={rankingPoke?.pokemon?.purifiedMoves?.includes(rankingPoke?.cMovePri?.name ?? '')}
                      special={rankingPoke?.pokemon?.specialMoves?.includes(rankingPoke?.cMovePri?.name ?? '')}
                    />
                    {rankingPoke?.cMoveSec && (
                      <TypeBadge
                        grow={true}
                        find={true}
                        title="Secondary Charged Move"
                        color={'white'}
                        move={rankingPoke?.cMoveSec}
                        elite={rankingPoke?.pokemon?.eliteCinematicMove?.includes(rankingPoke?.cMoveSec.name)}
                        shadow={rankingPoke?.pokemon?.shadowMoves?.includes(rankingPoke?.cMoveSec.name)}
                        purified={rankingPoke?.pokemon?.purifiedMoves?.includes(rankingPoke?.cMoveSec.name)}
                        special={rankingPoke?.pokemon?.specialMoves?.includes(rankingPoke?.cMoveSec?.name)}
                      />
                    )}
                  </div>
                </div>
              </div>
              <hr />
              {Keys(dataStore?.assets ?? [], dataStore?.pokemon ?? [], rankingPoke?.data, params.cp, params.type)}
            </div>
            <div className="container">
              <hr />
            </div>
            <div className="stats-container">{OverAllStats(rankingPoke, statsRanking, params.cp ?? '')}</div>
            <div className="container">
              <hr />
              {TypeEffective(rankingPoke?.pokemon?.types ?? [])}
            </div>
            <div className="container">{MoveSet(rankingPoke?.data?.moves, rankingPoke?.pokemon, dataStore?.combat ?? [])}</div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default PokemonPVP;
