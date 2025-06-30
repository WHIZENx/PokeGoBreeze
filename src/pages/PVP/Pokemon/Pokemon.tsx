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
} from '../../../utils/utils';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import APIService from '../../../services/api.service';
import { calculateStatsByTag } from '../../../utils/calculate';
import {
  computeBgType,
  findAssetForm,
  getPokemonBattleLeagueIcon,
  getPokemonBattleLeagueName,
} from '../../../utils/compute';

import Error from '../../Error/Error';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { Params } from '../../../utils/constants';
import { RouterState, StatsState, TimestampState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { SpinnerActions } from '../../../store/actions';
import { isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from '../../../utils/extension';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { PokemonType } from '../../../enums/type.enum';
import HeaderPVP from '../components/HeaderPVP';
import BodyPVP from '../components/BodyPVP';
import MoveSet from '../components/MoveSet';
import TypeEffectivePVP from '../components/TypeEffectivePVP';
import OverAllStats from '../components/OverAllStats';
import { ScoreType } from '../../../utils/enums/constants.enum';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import { getValueOrDefault } from '../../../utils/extension';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { formShadow } from '../../../utils/helpers/options-context.helpers';
import useDataStore from '../../../composables/useDataStore';
import usePVP from '../../../composables/usePVP';

const PokemonPVP = (props: IStyleSheetData) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pvpData, assetsData, combatsData, pokemonsData } = useDataStore();
  const { loadPVP, loadPVPMoves } = usePVP();
  const router = useSelector((state: RouterState) => state.router);

  const [searchParams] = useSearchParams();

  const params = useParams();
  const timestamp = useSelector((state: TimestampState) => state.timestamp);

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const statsRanking = useSelector((state: StatsState) => state.stats);
  const [isFound, setIsFound] = useState(true);

  useEffect(() => {
    loadPVP(timestamp);
  }, []);

  const setPokemonPVPTitle = (isNotFound = false) => {
    if (isNotFound) {
      setIsFound(false);
    }
    return {
      title: isNotFound ? 'Pokémon PVP - Information Not Found' : 'Pokémon PVP - Information',
      description: isNotFound
        ? 'The requested Pokémon PVP information could not be found. Please check your search parameters and try again.'
        : 'Detailed PVP information for individual Pokémon in Pokémon GO. Find stats, movesets, and battle performance across different leagues.',
      keywords: [
        'Pokémon GO',
        'PVP information',
        'PVP stats',
        'Pokémon battle data',
        'combat power',
        'movesets',
        'battle league',
        'PokéGO Breeze',
      ],
    };
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>(setPokemonPVPTitle());

  useTitle(titleProps);

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
          setTitleProps(setPokemonPVPTitle(true));
          return;
        }

        const pokemonData = data.find((pokemon) => isEqual(pokemon.speciesId, paramName));
        if (!pokemonData) {
          setTitleProps(setPokemonPVPTitle(true));
          return;
        }

        const name = convertNameRankingToOri(pokemonData.speciesId, pokemonData.speciesName);
        const pokemon = pokemonsData.find((pokemon) => isEqual(pokemon.slug, name));
        const id = pokemon?.num;
        const form = findAssetForm(assetsData, pokemon?.num, pokemon?.form);
        setTitleProps({
          title: `#${toNumber(id)} ${splitAndCapitalize(name, '-', ' ')} - ${getPokemonBattleLeagueName(
            cp
          )} (${capitalize(params.serie)})`,
          description: `PVP analysis and battle stats for ${splitAndCapitalize(
            name,
            '-',
            ' '
          )} in ${getPokemonBattleLeagueName(cp)} ${capitalize(
            params.serie
          )}. Find optimal movesets, counters, and performance metrics.`,
          keywords: [
            'Pokémon GO',
            `${splitAndCapitalize(name, '-', ' ')}`,
            `${getPokemonBattleLeagueName(cp)}`,
            `${capitalize(params.serie)}`,
            'PVP stats',
            'best movesets',
            'battle performance',
            'PokéGO Breeze',
          ],
          image: APIService.getPokemonModel(form, id),
        });

        const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

        const [fMoveData] = pokemonData.moveset;
        let [, cMoveDataPri, cMoveDataSec] = pokemonData.moveset;
        cMoveDataPri = replaceTempMovePvpName(cMoveDataPri);
        cMoveDataSec = replaceTempMovePvpName(cMoveDataSec);

        const fMove = combatsData.find((item) => isEqual(item.name, fMoveData));
        const cMovePri = combatsData.find((item) => isEqual(item.name, cMoveDataPri));
        let cMoveSec;
        if (cMoveDataSec) {
          cMoveSec = combatsData.find((item) => isEqual(item.name, cMoveDataSec));
        }

        let pokemonType = PokemonType.Normal;
        if (isInclude(pokemonData.speciesName, `(${formShadow()})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
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
          setTitleProps(setPokemonPVPTitle(true));
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
    combatsData,
    pokemonsData,
    assetsData,
    dispatch,
  ]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
      router.action = null;
    };
    if (
      statsRanking &&
      isNotEmpty(pvpData.rankings) &&
      isNotEmpty(pvpData.trains) &&
      isNotEmpty(combatsData) &&
      isNotEmpty(pokemonsData) &&
      isNotEmpty(assetsData)
    ) {
      if (combatsData.every((combat) => !combat.archetype)) {
        loadPVPMoves();
      } else if (router.action) {
        fetchPokemon();
      }
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonInfo, rankingPoke, pvpData.rankings, pvpData.trains, router.action, dispatch]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvpData.rankings.find((item) => item.id === LeagueBattleType.All && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center filter-shadow text-shadow-black text-white column-gap-2">
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
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4">
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
            <MoveSet moves={rankingPoke?.data?.moves} pokemon={rankingPoke?.pokemon} />
          </div>
        </div>
      </div>
    </Error>
  );
};

export default PokemonPVP;
