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
import { computeBgType, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';

import Error from '../../Error/Error';
import { Params } from '../../../utils/constants';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
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
import useAssets from '../../../composables/useAssets';
import useRouter from '../../../composables/useRouter';
import useStats from '../../../composables/useStats';
import useSpinner from '../../../composables/useSpinner';
import useCombats from '../../../composables/useCombats';
import usePokemon from '../../../composables/usePokemon';
import ToggleGroupMui from '../../../components/Commons/Buttons/ToggleGroupMui';

const PokemonPVP = (props: IStyleSheetData) => {
  const navigate = useNavigate();
  const { pvpData } = useDataStore();
  const { isCombatsNoneArchetype, findMoveByName } = useCombats();
  const { getAssetNameById } = useAssets();
  const { loadPVP, loadPVPMoves } = usePVP();
  const { findPokemonBySlug } = usePokemon();
  const { routerAction } = useRouter();
  const { statsData } = useStats();
  const { showSpinner, hideSpinner, showSpinnerMsg } = useSpinner();

  const [searchParams] = useSearchParams();

  const params = useParams();

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const [isFound, setIsFound] = useState(true);

  useEffect(() => {
    loadPVP();
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
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      showSpinner();
      try {
        const cp = toNumber(params.cp);
        const paramName = params.pokemon?.replaceAll('-', '_').toLowerCase().replace('clodsiresb', 'clodsire');
        const overall = getValueOrDefault(String, getKeyWithData(ScoreType, ScoreType.Overall));
        const type = getValueOrDefault(String, searchParams.get(Params.LeagueType), overall);
        const { data } = await APIService.getFetchUrl<RankingsPVP[]>(APIService.getRankingFile(params.serie, cp, type));

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
        const pokemon = findPokemonBySlug(name);
        const id = pokemon?.num;
        const form = getAssetNameById(id, name, pokemon?.form);
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

        const fMove = findMoveByName(fMoveData);
        const cMovePri = findMoveByName(cMoveDataPri);
        let cMoveSec;
        if (cMoveDataSec) {
          cMoveSec = findMoveByName(cMoveDataSec);
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
            atk: statsData.attack.ranking.find((i) => i.attack === stats.atk),
            def: statsData.defense.ranking.find((i) => i.defense === stats.def),
            sta: statsData.stamina.ranking.find((i) => i.stamina === stats.sta),
            prod: statsData.statProd.ranking.find((i) => i.product === stats.atk * stats.def * stats.sta),
            fMove,
            cMovePri,
            cMoveSec,
            pokemonType,
          })
        );
        hideSpinner();
      } catch (e) {
        if ((e as AxiosError)?.status === 404) {
          setTitleProps(setPokemonPVPTitle(true));
        } else {
          showSpinnerMsg({
            isError: true,
            message: (e as AxiosError).message,
          });
        }
      }
    }
  }, [params.serie, params.pokemon, params.cp, searchParams, statsData, findMoveByName, findPokemonBySlug]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
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
  }, [fetchPokemonInfo, pvpData.rankings, pvpData.trains, routerAction]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
    const league = pvpData.rankings.find((item) => item.id === LeagueBattleType.All && isIncludeList(item.cp, cp));
    return (
      <Fragment>
        {league && (
          <div className="tw-flex tw-flex-wrap tw-items-center filter-shadow text-shadow-black tw-text-white tw-gap-x-2">
            <img
              alt="Image League"
              width={64}
              height={64}
              src={!league.logo ? getPokemonBattleLeagueIcon(cp) : APIService.getAssetPokeGo(league.logo)}
            />
            <h2 className="!tw-text-white">
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
        className="tw-py-3"
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
        <div className="pokemon-ranking-body tw-container pvp-container">
          {renderLeague()}
          <hr />
          <ToggleGroupMui
            className="tw-flex sm:tw-justify-center tw-overflow-x-auto tw-mt-2 tw-w-full"
            isNoneBorder
            color="primary"
            exclusive
            value={getValueOrDefault(
              String,
              searchParams.get(Params.LeagueType),
              getKeyWithData(ScoreType, ScoreType.Overall)
            )}
            toggles={getKeysObj(ScoreType).map((type) => ({
              label: type,
              value: type,
              variant: 'contained',
              onClick: () =>
                navigate(
                  `/pvp/${params.cp}/${params.serie}/${params.pokemon}?${Params.LeagueType}=${type.toLowerCase()}`
                ),
            }))}
          />
          <div className="tw-w-full ranking-info tw-mt-2">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-4">
              <div className="tw-relative filter-shadow tw-w-32">
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
          <div className="tw-container">
            <hr />
          </div>
          <div className="stats-container">
            <OverAllStats data={rankingPoke} cp={params.cp} type={searchParams.get(Params.LeagueType)} />
          </div>
          <div className="tw-container">
            <hr />
            <TypeEffectivePVP types={rankingPoke?.pokemon?.types} />
          </div>
          <div className="tw-container">
            <MoveSet moves={rankingPoke?.data?.moves} pokemon={rankingPoke?.pokemon} />
          </div>
        </div>
      </div>
    </Error>
  );
};

export default PokemonPVP;
