import '../PVP.scss';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { capitalize, convertNameRankingToOri, replaceTempMovePvpName, splitAndCapitalize } from '../../../util/utils';
import { useNavigate, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/calculate';
import { computeBgType, findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../util/compute';

import Error from '../../Error/Error';
import { Body, Header, MoveSet, OverAllStats, TypeEffective } from '../Model';
import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from 'react-bootstrap';
import { FORM_MEGA, FORM_SHADOW, MAX_IV, MAX_LEVEL, scoreType } from '../../../util/constants';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { BattleBaseStats } from '../../../util/models/calculate.model';
import { SpinnerActions } from '../../../store/actions';
import { AnyAction } from 'redux';
import { LocalStorageConfig } from '../../../store/constants/localStorage';
import { LocalTimeStamp } from '../../../store/models/local-storage.model';
import { isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LeagueType } from '../../../core/enums/league.enum';
import { BattleLeagueCPType } from '../../../util/enums/compute.enum';
import { PokemonType } from '../../../enums/type.enum';

const PokemonPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const params = useParams();
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.TIMESTAMP, JSON.stringify(new LocalTimeStamp()));
  const [statePVP, setStatePVP] = useLocalStorage(LocalStorageConfig.PVP, '');

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [found, setFound] = useState(true);

  useEffect(() => {
    if (!isNotEmpty(pvp.rankings) && !isNotEmpty(pvp.trains)) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  const fetchPokemonInfo = useCallback(async () => {
    dispatch(SpinnerActions.ShowSpinner.create());
    try {
      const cp = toNumber(params.cp);
      const paramName = params.pokemon?.replaceAll('-', '_').toLowerCase();
      const data = (
        await APIService.getFetchUrl<RankingsPVP[]>(
          APIService.getRankingFile(
            isInclude(paramName, `_${FORM_MEGA}`, IncludeMode.IncludeIgnoreCaseSensitive) ? LeagueType.Mega : LeagueType.All,
            cp,
            params.type
          )
        )
      ).data.find((pokemon) => isEqual(pokemon.speciesId, paramName));

      if (!data) {
        setFound(false);
        return;
      }

      const name = convertNameRankingToOri(data.speciesId, data.speciesName);
      const pokemon = dataStore.pokemon.find((pokemon) => isEqual(pokemon.slug, name));
      const id = pokemon?.num;
      const form = findAssetForm(dataStore.assets, pokemon?.num, pokemon?.forme);
      document.title = `#${id} ${splitAndCapitalize(name, '-', ' ')} - ${getPokemonBattleLeagueName(cp)} (${capitalize(params.type)})`;

      const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

      const [fMoveData] = data.moveset;
      let [, cMoveDataPri, cMoveDataSec] = data.moveset;
      cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
      cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

      const fMove = dataStore.combat.find((item) => isEqual(item.name, fMoveData));
      const cMovePri = dataStore.combat.find((item) => isEqual(item.name, cMoveDataPri));
      let cMoveSec;
      if (cMoveDataSec) {
        cMoveSec = dataStore.combat.find((item) => isEqual(item.name, cMoveDataSec));
      }

      const maxCP = toNumber(params.cp);

      let bestStats = new BattleBaseStats();
      if (maxCP < BattleLeagueCPType.InsMaster) {
        let minCP =
          maxCP === BattleLeagueCPType.Little
            ? BattleLeagueCPType.Master
            : maxCP === BattleLeagueCPType.Great
            ? BattleLeagueCPType.Little
            : maxCP === BattleLeagueCPType.Ultra
            ? BattleLeagueCPType.Great
            : BattleLeagueCPType.Ultra;
        const maxPokeCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, toNumber(stats?.sta) + MAX_IV, MAX_LEVEL);

        if (maxPokeCP < minCP) {
          if (maxPokeCP <= BattleLeagueCPType.Little) {
            minCP = 0;
          } else if (maxPokeCP <= BattleLeagueCPType.Great) {
            minCP = BattleLeagueCPType.Little;
          } else if (maxPokeCP <= BattleLeagueCPType.Ultra) {
            minCP = BattleLeagueCPType.Great;
          } else {
            minCP = BattleLeagueCPType.Ultra;
          }
        }
        const allStats = calStatsProd(stats.atk, stats.def, toNumber(stats?.sta), minCP, maxCP);
        bestStats = allStats[allStats.length - 1];
      }

      let pokemonType = PokemonType.Normal;
      if (isInclude(data.speciesName, `(${FORM_SHADOW})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
        pokemonType = PokemonType.Shadow;
      } else if (isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) || isIncludeList(pokemon?.purifiedMoves, cMoveSec?.name)) {
        pokemonType = PokemonType.Purified;
      }

      setRankingPoke(
        new PokemonBattleRanking({
          data,
          id,
          name,
          pokemon,
          form,
          stats,
          atk: statsRanking?.attack.ranking.find((i) => i.attack === stats.atk),
          def: statsRanking?.defense.ranking.find((i) => i.defense === stats.def),
          sta: statsRanking?.stamina.ranking.find((i) => i.stamina === toNumber(stats.sta)),
          prod: statsRanking?.statProd.ranking.find((i) => i.product === stats.atk * stats.def * toNumber(stats.sta)),
          fMove,
          cMovePri,
          cMoveSec,
          bestStats,
          pokemonType,
        })
      );
      dispatch(SpinnerActions.HideSpinner.create());
    } catch (e) {
      setFound(false);
      dispatch(
        SpinnerActions.ShowSpinnerMsg.create({
          isError: true,
          message: (e as Error).message,
        })
      );
    }
  }, [params.type, params.pokemon, params.cp, statsRanking, dataStore.combat, dataStore.pokemon, dataStore.assets, dispatch]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
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
  }, [fetchPokemonInfo, rankingPoke, pvp, router.action, dispatch]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvp.rankings.find((item) => item.id === LeagueType.All && isIncludeList(item.cp, cp));
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
              <b>{isEqual(league.name, LeagueType.All, EqualMode.IgnoreCaseSensitive) ? getPokemonBattleLeagueName(cp) : league.name}</b>
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
              rankingPoke?.pokemonType,
              0.8,
              undefined,
              rankingPoke ? undefined : 'rgb(100, 100, 100)'
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
                  className={isEqual(params.type, type, EqualMode.IgnoreCaseSensitive) ? 'active' : ''}
                  onClick={() => navigate(`/pvp/${params.cp}/${type.toLowerCase()}/${params.pokemon}`)}
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="w-100 ranking-info element-top">
              <div className="d-flex flex-wrap align-items-center justify-content-center" style={{ gap: '2rem' }}>
                <div className="position-relative filter-shadow" style={{ width: 128 }}>
                  {rankingPoke?.pokemonType === PokemonType.Shadow && (
                    <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
                  )}
                  {rankingPoke?.pokemonType === PokemonType.Purified && (
                    <img height={64} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />
                  )}
                  <img
                    alt="img-league"
                    className="pokemon-sprite-raid"
                    src={rankingPoke?.form ? APIService.getPokemonModel(rankingPoke.form) : APIService.getPokeFullSprite(rankingPoke?.id)}
                  />
                </div>
                <div>{Header(rankingPoke)}</div>
              </div>
              <hr />
              {Body(dataStore.assets, dataStore.pokemon, rankingPoke?.data, params.cp, params.type)}
            </div>
            <div className="container">
              <hr />
            </div>
            <div className="stats-container">{OverAllStats(rankingPoke, statsRanking, params.cp)}</div>
            <div className="container">
              <hr />
              {TypeEffective(rankingPoke?.pokemon?.types)}
            </div>
            <div className="container">{MoveSet(rankingPoke?.data?.moves, rankingPoke?.pokemon, dataStore.combat)}</div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default PokemonPVP;
