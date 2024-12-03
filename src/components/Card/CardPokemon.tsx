import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { splitAndCapitalize } from '../../util/utils';
import { ICardPokemonComponent } from '../models/component.model';
import { PokemonType } from '../../enums/type.enum';

const CardPokemon = (props: ICardPokemonComponent) => {
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
                e.currentTarget.src = APIService.getPokeIconSprite();
              }}
            />
            {props.pokemonType === PokemonType.Shadow && (
              <img className="position-absolute" style={{ bottom: 0, right: 5 }} height={24} src={APIService.getPokeShadow()} />
            )}
            {props.pokemonType === PokemonType.Purified && (
              <img className="position-absolute" style={{ bottom: 0, right: 5 }} height={24} src={APIService.getPokePurified()} />
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
