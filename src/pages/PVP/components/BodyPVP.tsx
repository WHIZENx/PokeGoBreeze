import React, { Fragment, useEffect, useState } from 'react';
import { BodyComponent } from '../models/component.model';
import { BackgroundType } from '../enums/model-type.enum';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { PokemonVersus } from '../../../core/models/pvp.model';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/api.service';
import { computeBgType } from '../../../utils/compute';
import { getValueOrDefault, isInclude, isNotEmpty } from '../../../utils/extension';
import {
  convertNameRankingToOri,
  convertNameRankingToForm,
  splitAndCapitalize,
  getValidPokemonImgPath,
  getPokemonType,
  getKeyWithData,
} from '../../../utils/utils';
import { BodyModel, IBody } from '../models/body.model';
import { Params } from '../../../utils/constants';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { formShadow } from '../../../utils/helpers/options-context.helpers';
import useAssets from '../../../composables/useAssets';
import usePokemon from '../../../composables/usePokemon';

const BodyPVP = (props: BodyComponent) => {
  const { findPokemonBySlug } = usePokemon();
  const { getAssetNameById } = useAssets();
  const [matchups, setMatchups] = useState<IBody[]>();
  const [counters, setCounters] = useState<IBody[]>();

  const setPokemonBody = (data: PokemonVersus[] | undefined) => {
    return data
      ?.sort((a, b) => a.rating - b.rating)
      .map((versus) => {
        const speciesId = versus.opponent;
        const speciesName = convertNameRankingToForm(speciesId);
        const name = convertNameRankingToOri(speciesId, speciesName);
        const pokemon = findPokemonBySlug(name);
        const id = pokemon?.num;
        const form = getAssetNameById(id, name, pokemon?.form);
        let pokemonType;
        if (isInclude(versus.opponent, `_${formShadow()}`, IncludeMode.IncludeIgnoreCaseSensitive)) {
          pokemonType = PokemonType.Shadow;
        } else {
          pokemonType = getPokemonType(versus.opponent);
        }

        return BodyModel.create({
          name,
          pokemon,
          id,
          form,
          opponent: versus.opponent,
          rating: versus.rating,
          pokemonType,
        });
      });
  };

  useEffect(() => {
    if (isNotEmpty(matchups) && isNotEmpty(props.data?.matchups)) {
      setMatchups([]);
    }
    if (isNotEmpty(counters) && isNotEmpty(props.data?.counters)) {
      setCounters([]);
    }
  }, [props.serie, props.type, props.data?.matchups, props.data?.counters]);

  useEffect(() => {
    if (!isNotEmpty(matchups) && isNotEmpty(props.data?.matchups)) {
      setMatchups(setPokemonBody(props.data?.matchups));
    }
    if (!isNotEmpty(counters) && isNotEmpty(props.data?.counters)) {
      setCounters(setPokemonBody(props.data?.counters));
    }
  }, [matchups, counters, props.data?.matchups, props.data?.counters]);

  const renderItemList = (data: IBody, bgType: BackgroundType) => (
    <LinkToTop
      to={`/pvp/${props.cp}/${props.serie}/${data.opponent.replaceAll('_', '-')}?${
        Params.LeagueType
      }=${getValueOrDefault(String, props.type, getKeyWithData(ScoreType, ScoreType.Overall)).toLowerCase()}`}
      className="list-item-ranking"
      style={{
        backgroundImage: computeBgType(
          data.pokemon?.types,
          isInclude(data.opponent, `_${formShadow()}`, IncludeMode.IncludeIgnoreCaseSensitive)
            ? PokemonType.Shadow
            : PokemonType.Normal,
          props.styleList,
          0.3
        ),
      }}
    >
      <div className="container d-flex align-items-center column-gap-2">
        <div className="d-flex justify-content-center">
          <span className="d-inline-block position-relative filter-shadow" style={{ width: 50 }}>
            <PokemonIconType pokemonType={data.pokemonType} size={28}>
              <img
                alt="Image League"
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
        <div>
          <b className="text-white text-shadow-black">
            #{data.id} {splitAndCapitalize(data.name, '-', ' ')}
          </b>
          <TypeInfo isShowShadow isHideText height={20} arr={data.pokemon?.types} />
        </div>
      </div>
      <div className="ms-3">
        <span
          className="ranking-score text-white text-shadow-black filter-shadow"
          style={{ backgroundColor: bgType === BackgroundType.Matchup ? 'lightgreen' : 'lightcoral' }}
        >
          {data.rating}
        </span>
      </div>
    </LinkToTop>
  );

  return (
    <div className="row m-0">
      <div className="col-lg-6 mt-2 p-0">
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow-black">Best Matchups</h4>
          <div className="ms-3">
            <span className="ranking-score score-ic text-black">Rating</span>
          </div>
        </div>
        {matchups?.map((matchup, index) => (
          <Fragment key={index}>{renderItemList(matchup, BackgroundType.Matchup)}</Fragment>
        ))}
      </div>
      <div className="col-lg-6 mt-2 p-0">
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow-black">Best Counters</h4>
          <div className="ms-3">
            <span className="ranking-score score-ic text-black">Rating</span>
          </div>
        </div>
        {counters?.map((counter, index) => (
          <Fragment key={index}>{renderItemList(counter, BackgroundType.Counter)}</Fragment>
        ))}
      </div>
    </div>
  );
};

export default BodyPVP;
