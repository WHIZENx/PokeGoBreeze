import React, { Fragment, useEffect, useState } from 'react';
import { BodyComponent } from '../models/component.model';
import { BackgroundType } from '../enums/model-type.enum';
import { Link } from 'react-router-dom';
import TypeInfo from '../../../components/Sprites/Type/Type';
import { PokemonVersus } from '../../../core/models/pvp.model';
import { PokemonType } from '../../../enums/type.enum';
import APIService from '../../../services/API.service';
import { findAssetForm, computeBgType } from '../../../util/compute';
import { isEqual, isInclude, isNotEmpty } from '../../../util/extension';
import { convertNameRankingToOri, convertNameRankingToForm, splitAndCapitalize, getValidPokemonImgPath } from '../../../util/utils';
import { BodyModel, IBody } from '../models/body.model';
import { FORM_SHADOW } from '../../../util/constants';
import { IncludeMode } from '../../../util/enums/string.enum';

const BodyPVP = (props: BodyComponent) => {
  const [matchups, setMatchups] = useState<IBody[]>();
  const [counters, setCounters] = useState<IBody[]>();

  const setPokemonBody = (data: PokemonVersus[] | undefined) => {
    return data
      ?.sort((a, b) => a.rating - b.rating)
      .map((versus) => {
        const name = convertNameRankingToOri(versus.opponent, convertNameRankingToForm(versus.opponent));
        const pokemon = props.pokemonData.find((pokemon) => isEqual(pokemon.slug, name));
        const id = pokemon?.num;
        const form = findAssetForm(props.assets, pokemon?.num, pokemon?.forme);

        return BodyModel.create({
          name,
          pokemon,
          id,
          form,
          opponent: versus.opponent,
          rating: versus.rating,
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
  }, [props.type, props.data?.matchups, props.data?.counters]);

  useEffect(() => {
    if (!isNotEmpty(matchups) && isNotEmpty(props.data?.matchups)) {
      setMatchups(setPokemonBody(props.data?.matchups));
    }
    if (!isNotEmpty(counters) && isNotEmpty(props.data?.counters)) {
      setCounters(setPokemonBody(props.data?.counters));
    }
  }, [matchups, counters, props.data?.matchups, props.data?.counters]);

  const renderItemList = (data: IBody, bgType: BackgroundType) => (
    <Link
      to={`/pvp/${props.cp}/${props.type}/${data.opponent.replaceAll('_', '-')}`}
      className="list-item-ranking"
      style={{
        backgroundImage: computeBgType(
          data.pokemon?.types,
          isInclude(data.opponent, `_${FORM_SHADOW}`, IncludeMode.IncludeIgnoreCaseSensitive) ? PokemonType.Shadow : PokemonType.Normal
        ),
      }}
    >
      <div className="container d-flex align-items-center" style={{ columnGap: 10 }}>
        <div className="d-flex justify-content-center">
          <span className="d-inline-block position-relative filter-shadow" style={{ width: 50 }}>
            {isInclude(data.opponent, `_${FORM_SHADOW}`, IncludeMode.IncludeIgnoreCaseSensitive) && (
              <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
            )}
            <img
              alt="img-league"
              className="pokemon-sprite-accordion"
              src={data.form ? APIService.getPokemonModel(data.form) : APIService.getPokeFullSprite(data.id)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getValidPokemonImgPath(e.currentTarget.src, data.id, data.form);
              }}
            />
          </span>
        </div>
        <div>
          <b className="text-white text-shadow">
            #{data.id} {splitAndCapitalize(data.name, '-', ' ')}
          </b>
          <TypeInfo isShadow={true} isHideText={true} height={20} arr={data.pokemon?.types} />
        </div>
      </div>
      <div style={{ marginRight: 15 }}>
        <span
          className="ranking-score score-ic text-white text-shadow filter-shadow"
          style={{ backgroundColor: bgType === BackgroundType.Matchup ? 'lightgreen' : 'lightcoral' }}
        >
          {data.rating}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="row" style={{ margin: 0 }}>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Matchups</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
          </div>
        </div>
        {matchups?.map((matchup, index) => (
          <Fragment key={index}>{renderItemList(matchup, BackgroundType.Matchup)}</Fragment>
        ))}
      </div>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Counters</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
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
