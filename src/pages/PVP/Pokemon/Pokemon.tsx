import '../PVP.scss';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import {
  capitalize,
  getKeysObj,
  getKeyWithData,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../utils/utils';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import APIService from '../../../services/api.service';
import { computeBgType, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';

import Error from '../../Error/Error';
import { Params } from '../../../utils/constants';
import { IPokemonBattleRanking, PokemonBattleRanking } from '../models/battle.model';
import { isEqual, toNumber } from '../../../utils/extension';
import { EqualMode } from '../../../utils/enums/string.enum';
import HeaderPVP from '../components/HeaderPVP';
import BodyPVP from '../components/BodyPVP';
import MoveSet from '../components/MoveSet';
import TypeEffectivePVP from '../components/TypeEffectivePVP';
import OverAllStats from '../components/OverAllStats';
import { ScoreType } from '../../../utils/enums/constants.enum';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { getValueOrDefault } from '../../../utils/extension';
import { AxiosError } from 'axios';
import { IStyleSheetData } from '../../models/page.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import useSpinner from '../../../composables/useSpinner';
import ToggleGroupMui from '../../../components/Commons/Buttons/ToggleGroupMui';
import { IPVPInfo } from '../../../core/models/pvp.model';
import { PvpPokemonApiResponse } from '../../../core/models/API/pvp-pokemon.model';

const PokemonPVP = (props: IStyleSheetData) => {
  const navigate = useNavigate();
  const { showSpinner, hideSpinner, showSpinnerMsg } = useSpinner();

  const [searchParams] = useSearchParams();

  const params = useParams();

  const [rankingPoke, setRankingPoke] = useState<IPokemonBattleRanking>();
  const [league, setLeague] = useState<IPVPInfo>();
  const [isFound, setIsFound] = useState(true);
  const requestController = useRef<AbortController>();

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
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    showSpinner();
    try {
      const cp = toNumber(params.cp);
      const overall = getValueOrDefault(String, getKeyWithData(ScoreType, ScoreType.Overall));
      const type = getValueOrDefault(String, searchParams.get(Params.LeagueType), overall).toLowerCase();
      const response = await APIService.getFetchUrl<{ data: PvpPokemonApiResponse }>(
        APIService.getPvpPokemon({
          series: params.serie,
          cp,
          type,
          name: params.pokemon,
        }),
        { signal: controller.signal }
      );
      const result = response.data.data;
      const { id, name, form } = result;
      if (!result?.data || !name) {
        setTitleProps(setPokemonPVPTitle(true));
        return;
      }

      setIsFound(true);
      setLeague(result.league);
      setRankingPoke(new PokemonBattleRanking(result));
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
    } catch (e) {
      if (controller.signal.aborted) {
        return;
      }
      if ((e as AxiosError)?.response?.status === 404) {
        setRankingPoke(undefined);
        setLeague(undefined);
        setTitleProps(setPokemonPVPTitle(true));
      } else {
        showSpinnerMsg({
          isError: true,
          message: (e as AxiosError).message,
        });
      }
    } finally {
      if (requestController.current === controller) {
        hideSpinner();
      }
    }
  }, [params.serie, params.pokemon, params.cp, searchParams]);

  useEffect(() => {
    const fetchPokemon = async () => {
      await fetchPokemonInfo();
    };
    fetchPokemon();
    return () => {
      requestController.current?.abort();
      hideSpinner();
    };
  }, [fetchPokemonInfo]);

  const renderLeague = () => {
    const cp = toNumber(params.cp);
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
                {isEqual(league.name, 'all', EqualMode.IgnoreCaseSensitive)
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
    <Error isError={!isFound} isShowTitle={!isFound}>
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
