import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { splitAndCapitalize } from '../../util/Utils';
import { IPokemonData } from '../../core/models/pokemon.model';

const CardPokemon = (props: { value: IPokemonData; score?: number; isShadow?: boolean }) => {
  return (
    <Fragment>
      {props.value && (
        <div className="d-flex align-items-center w-100">
          <div className="position-relative">
            <img
              height={38}
              alt="pokemon-logo"
              style={{ marginRight: 10 }}
              src={APIService.getPokeIconSprite(props.value.sprite, true)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
              }}
            />
            {props.isShadow && (
              <img className="position-absolute" style={{ bottom: 0, right: 5 }} height={24} src={APIService.getPokeShadow()} />
            )}
          </div>
          {splitAndCapitalize(props.value.name.replaceAll('_', '-'), '-', ' ')}
          {props.score && (
            <span style={{ marginLeft: 10 }} className="type-icon-small ic elite-ic">
              {props.score}
            </span>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default CardPokemon;
