import '../PVP.scss';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { capitalize, convertNameRankingToOri, splitAndCapitalize } from '../../../util/Utils';
import { useNavigate, useParams } from 'react-router-dom';
import APIService from '../../../services/API.service';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { calculateCP, calculateStatsByTag, calStatsProd } from '../../../util/Calculate';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import Error from '../../Error/Error';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';
import { loadPVP, loadPVPMoves } from '../../../store/actions/store.action';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from 'react-bootstrap';
import { MAX_IV, MAX_LEVEL, scoreType } from '../../../util/Constants';
import { Action } from 'history';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { PokemonBattleRanking } from '../models/battle.model';

const PokemonPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const params: any = useParams();
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
    })
  );
  const [statePVP, setStatePVP] = useLocalStorage('pvp', '');

  const [rankingPoke, setRankingPoke]: [
    PokemonBattleRanking | undefined,
    React.Dispatch<React.SetStateAction<PokemonBattleRanking | undefined>>
  ] = useState();
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [found, setFound] = useState(true);

  useEffect(() => {
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  const fetchPokemonInfo = useCallback(async () => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    dispatch(showSpinner());
    try {
      const cp = parseInt(params.cp);
      const paramName = params.pokemon.replaceAll('-', '_').toLowerCase();
      const data = (
        (
          await APIService.getFetchUrl(APIService.getRankingFile(paramName.includes('_mega') ? 'mega' : 'all', cp, params.type), {
            cancelToken: APIService.getAxios().CancelToken.source().token,
          })
        ).data as RankingsPVP[]
      ).find((pokemon) => pokemon.speciesId === paramName);

      if (!data) {
        setFound(false);
        return;
      }

      const name = convertNameRankingToOri(data.speciesId, data.speciesName);
      const pokemon = dataStore?.pokemon?.find((pokemon) => pokemon.slug === name);
      const id = pokemon?.num;
      const form = findAssetForm(dataStore?.assets ?? [], pokemon?.num, pokemon?.name);
      document.title = `#${id} ${splitAndCapitalize(name, '-', ' ')} - ${
        cp === 500 ? 'Little Cup' : cp === 1500 ? 'Great League' : cp === 2500 ? 'Ultra League' : 'Master League'
      } (${capitalize(params.type)})`;

      const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

      let fmoveData = data.moveset.at(0),
        cMoveDataPri = data.moveset.at(1),
        cMoveDataSec = data.moveset.at(2);
      if (fmoveData?.includes('HIDDEN_POWER')) {
        fmoveData = 'HIDDEN_POWER';
      }
      if (cMoveDataPri === 'FUTURE_SIGHT') {
        cMoveDataPri = 'FUTURESIGHT';
      }
      if (cMoveDataSec === 'FUTURE_SIGHT') {
        cMoveDataSec = 'FUTURESIGHT';
      }
      if (cMoveDataPri === 'TECHNO_BLAST_DOUSE') {
        cMoveDataPri = 'TECHNO_BLAST_WATER';
      }
      if (cMoveDataSec === 'TECHNO_BLAST_DOUSE') {
        cMoveDataSec = 'TECHNO_BLAST_WATER';
      }

      let fmove = dataStore?.combat?.find((item) => item.name === fmoveData);
      const cmovePri = dataStore?.combat?.find((item) => item.name === cMoveDataPri);
      let cmoveSec;
      if (cMoveDataSec) {
        cmoveSec = dataStore?.combat?.find((item) => item.name === cMoveDataSec);
      }

      if (fmove && data.moveset.at(0)?.includes('HIDDEN_POWER')) {
        fmove = { ...fmove, type: data.moveset.at(0)?.split('_').at(2) ?? '' };
      }

      const maxCP = parseInt(params.cp);

      let bestStats: any = {};
      if (maxCP === 10000) {
        const cp = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL - 1);
        const buddyCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL);
        bestStats[MAX_LEVEL - 1] = { cp };
        bestStats[MAX_LEVEL] = { cp: buddyCP };
      } else {
        let minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
        const maxPokeCP = calculateCP(stats.atk + MAX_IV, stats.def + MAX_IV, (stats?.sta ?? 0) + MAX_IV, MAX_LEVEL);

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

      setRankingPoke({
        data,
        id: id ?? 0,
        name: name ?? '',
        pokemon,
        form: form ?? '',
        stats,
        atk: statsRanking.attack.ranking.find((i) => i.attack === stats.atk),
        def: statsRanking.defense.ranking.find((i) => i.defense === stats.def),
        sta: statsRanking.stamina.ranking.find((i) => i.stamina === (stats?.sta ?? 0)),
        prod: statsRanking.statProd.ranking.find((i) => i.prod === stats.atk * stats.def * (stats?.sta ?? 0)),
        fmove,
        cmovePri,
        cmoveSec,
        bestStats,
        shadow: data.speciesName.includes('(Shadow)') ?? false,
        purified:
          (pokemon?.purifiedMoves?.includes(cmovePri?.name ?? '') ||
            (cMoveDataSec !== null && cMoveDataSec !== undefined && pokemon?.purifiedMoves?.includes(cMoveDataSec))) ??
          false,
      });
      dispatch(hideSpinner());
    } catch (e: any) {
      source.cancel();
      setFound(false);
      dispatch(
        showSpinner({
          error: true,
          msg: e.message,
        })
      );
    }
  }, [params.type, params.pokemon, params.cp, statsRanking, dataStore?.combat, dataStore?.pokemon, dataStore?.assets]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
    };
    if (statsRanking && dataStore?.combat && dataStore?.pokemon && dataStore?.assets) {
      if (dataStore.combat.every((combat) => !combat.archetype)) {
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
  }, [fetchPokemonInfo, rankingPoke, pvp, router.action]);

  const renderLeague = () => {
    const cp = parseInt(params.cp);
    const league = pvp?.rankings.find((item) => item.id === 'all' && item.cp.includes(cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center filter-shadow text-shadow text-white" style={{ columnGap: 10 }}>
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
                  className={params.type.toLowerCase() === type.toLowerCase() ? 'active' : ''}
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
                      move={rankingPoke?.fmove}
                      elite={rankingPoke?.pokemon?.eliteQuickMove?.includes(rankingPoke?.fmove?.name ?? '')}
                    />
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Primary Charged Move"
                      color={'white'}
                      move={rankingPoke?.cmovePri}
                      elite={rankingPoke?.pokemon?.eliteCinematicMove?.includes(rankingPoke?.cmovePri?.name ?? '')}
                      shadow={rankingPoke?.pokemon?.shadowMoves?.includes(rankingPoke?.cmovePri?.name ?? '')}
                      purified={rankingPoke?.pokemon?.purifiedMoves?.includes(rankingPoke?.cmovePri?.name ?? '')}
                      special={rankingPoke?.pokemon?.specialMoves?.includes(rankingPoke?.cmovePri?.name ?? '')}
                    />
                    {rankingPoke?.cmoveSec && (
                      <TypeBadge
                        grow={true}
                        find={true}
                        title="Secondary Charged Move"
                        color={'white'}
                        move={rankingPoke?.cmoveSec}
                        elite={rankingPoke?.pokemon?.eliteCinematicMove?.includes(rankingPoke?.cmoveSec.name)}
                        shadow={rankingPoke?.pokemon?.shadowMoves?.includes(rankingPoke?.cmoveSec.name)}
                        purified={rankingPoke?.pokemon?.purifiedMoves?.includes(rankingPoke?.cmoveSec.name)}
                        special={rankingPoke?.pokemon?.specialMoves?.includes(rankingPoke?.cmoveSec?.name)}
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
            <div className="stats-container">{OverAllStats(rankingPoke, statsRanking, params.cp)}</div>
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
