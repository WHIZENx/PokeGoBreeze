import '../PVP.scss';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import {
  capitalize,
  convertNameRankingToOri,
  getKeysObj,
  getKeyWithData,
  getValidPokemonImgPath,
  replaceTempMovePvpName,
  splitAndCapitalize,
} from '../../../util/utils';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { calculateStatsByTag } from '../../../util/calculate';
import {
  computeBgType,
  findAssetForm,
  getPokemonBattleLeagueIcon,
  getPokemonBattleLeagueName,
} from '../../../util/compute';

import Error from '../../Error/Error';
import { useDispatch, useSelector } from 'react-redux';
import { loadPVP, loadPVPMoves } from '../../../store/effects/store.effects';
import { Button } from 'react-bootstrap';
import { FORM_SHADOW, Params } from '../../../util/constants';
import { RouterState, StatsState, StoreState, TimestampState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { SpinnerActions } from '../../../store/actions';
import { AnyAction } from 'redux';
import { isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from '../../../util/extension';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { PokemonType } from '../../../enums/type.enum';
import HeaderPVP from '../components/HeaderPVP';
import BodyPVP from '../components/BodyPVP';
import MoveSet from '../components/MoveSet';
import TypeEffectivePVP from '../components/TypeEffectivePVP';
import OverAllStats from '../components/OverAllStats';
import { ScoreType } from '../../../util/enums/constants.enum';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import { getValueOrDefault } from '../../../util/extension';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';

const PokemonPVP = (props: IStyleSheetData) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data.pvp);
  const router = useSelector((state: RouterState) => state.router);

  const [searchParams] = useSearchParams();

  const params = useParams();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [isFound, setIsFound] = useState(true);

  useEffect(() => {
    loadPVP(dispatch, timestamp, pvp);
  }, []);

  const fetchPokemonInfo = useCallback(async () => {
    if (
      statsRanking?.attack?.ranking &&
      statsRanking?.defense?.ranking &&
      statsRanking?.stamina?.ranking &&
      statsRanking?.statProd?.ranking
    ) {
      dispatch(SpinnerActions.ShowSpinner.create());
      try {
        const cp = toNumber(params.cp);
        const paramName = params.pokemon?.replaceAll('-', '_').toLowerCase().replace('clodsiresb', 'clodsire');
        const overall = getValueOrDefault(String, getKeyWithData(ScoreType, ScoreType.Overall));
        const type = getValueOrDefault(String, searchParams.get(Params.LeagueType), overall);
        const data = (await APIService.getFetchUrl<RankingsPVP[]>(APIService.getRankingFile(params.serie, cp, type)))
          .data;

        if (!data) {
          setIsFound(false);
          return;
        }

        const pokemonData = data.find((pokemon) => isEqual(pokemon.speciesId, paramName));
        if (!pokemonData) {
          setIsFound(false);
          return;
        }

        const name = convertNameRankingToOri(pokemonData.speciesId, pokemonData.speciesName);
        const pokemon = dataStore.pokemons.find((pokemon) => isEqual(pokemon.slug, name));
        const id = pokemon?.num;
        const form = findAssetForm(dataStore.assets, pokemon?.num, pokemon?.form);
        document.title = `#${toNumber(id)} ${splitAndCapitalize(name, '-', ' ')} - ${getPokemonBattleLeagueName(
          cp
        )} (${capitalize(params.serie)})`;

        const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

        const [fMoveData] = pokemonData.moveset;
        let [, cMoveDataPri, cMoveDataSec] = pokemonData.moveset;
        cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
        cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

        const fMove = dataStore.combats.find((item) => isEqual(item.name, fMoveData));
        const cMovePri = dataStore.combats.find((item) => isEqual(item.name, cMoveDataPri));
        let cMoveSec;
        if (cMoveDataSec) {
          cMoveSec = dataStore.combats.find((item) => isEqual(item.name, cMoveDataSec));
        }

        let pokemonType = PokemonType.Normal;
        if (isInclude(pokemonData.speciesName, `(${FORM_SHADOW})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
          pokemonType = PokemonType.Shadow;
        } else if (
          isIncludeList(pokemon?.purifiedMoves, cMovePri?.name) ||
          isIncludeList(pokemon?.purifiedMoves, cMoveSec?.name)
        ) {
          pokemonType = PokemonType.Purified;
        }

        pokemonData.scorePVP = HexagonStats.create(pokemonData.scores);

        setRankingPoke(
          new PokemonBattleRanking({
            data: pokemonData,
            id,
            name,
            pokemon,
            form,
            stats,
            atk: statsRanking.attack.ranking.find((i) => i.attack === stats.atk),
            def: statsRanking.defense.ranking.find((i) => i.defense === stats.def),
            sta: statsRanking.stamina.ranking.find((i) => i.stamina === stats.sta),
            prod: statsRanking.statProd.ranking.find((i) => i.product === stats.atk * stats.def * stats.sta),
            fMove,
            cMovePri,
            cMoveSec,
            pokemonType,
          })
        );
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
    params.serie,
    params.pokemon,
    params.cp,
    searchParams,
    statsRanking,
    dataStore.combats,
    dataStore.pokemons,
    dataStore.assets,
    dispatch,
  ]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
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
  }, [fetchPokemonInfo, rankingPoke, pvp.rankings, pvp.trains, router.action, dispatch]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvp.rankings.find((item) => item.id === LeagueBattleType.All && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league && (
          <div
            className="d-flex flex-wrap align-items-center filter-shadow text-shadow text-white"
            style={{ columnGap: 10 }}
          >
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

  return (
    <Error isError={!isFound}>
      <div
        className="py-3"
        style={{
          backgroundImage: computeBgType(
            rankingPoke?.pokemon?.types,
            rankingPoke?.pokemonType,
            props.styleSheet,
            0.3,
            rankingPoke ? undefined : '#646464'
          ),
        }}
      >
        <div className="pokemon-ranking-body container pvp-container">
          {renderLeague()}
          <hr />
          <div className="ranking-link-group pt-2">
            {getKeysObj(ScoreType).map((type, index) => (
              <Button
                key={index}
                className={
                  isEqual(
                    getValueOrDefault(
                      String,
                      searchParams.get(Params.LeagueType),
                      getKeyWithData(ScoreType, ScoreType.Overall)
                    ).toLowerCase(),
                    type,
                    EqualMode.IgnoreCaseSensitive
                  )
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  navigate(
                    `/pvp/${params.cp}/${params.serie}/${params.pokemon}?${Params.LeagueType}=${type.toLowerCase()}`
                  )
                }
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="w-100 ranking-info mt-2">
            <div className="d-flex flex-wrap align-items-center justify-content-center" style={{ gap: '2rem' }}>
              <div className="position-relative filter-shadow" style={{ width: 128 }}>
                <PokemonIconType pokemonType={rankingPoke?.pokemonType} size={64}>
                  <img
                    alt="Image League"
                    className="pokemon-sprite-raid"
                    src={APIService.getPokemonModel(rankingPoke?.form, rankingPoke?.id)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getValidPokemonImgPath(
                        e.currentTarget.src,
                        rankingPoke?.id,
                        rankingPoke?.form
                      );
                    }}
                  />
                </PokemonIconType>
              </div>
              <div>
                <HeaderPVP data={rankingPoke} />
              </div>
            </div>
            <hr />
            <BodyPVP
              assets={dataStore.assets}
              pokemonData={dataStore.pokemons}
              data={rankingPoke?.data}
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
              data={rankingPoke}
              statsRanking={statsRanking}
              cp={params.cp}
              type={searchParams.get(Params.LeagueType)}
            />
          </div>
          <div className="container">
            <hr />
            <TypeEffectivePVP types={rankingPoke?.pokemon?.types} />
          </div>
          <div className="container">
            <MoveSet moves={rankingPoke?.data?.moves} pokemon={rankingPoke?.pokemon} combatData={dataStore.combats} />
          </div>
        </div>
      </div>
    </Error>
  );
};

export default PokemonPVP;
