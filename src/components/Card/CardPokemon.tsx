import React from 'react';
import APIService from '../../services/API.service';
import { splitAndCapitalize } from '../../util/utils';
import { ICardPokemonComponent } from '../models/component.model';
import { isNullOrUndefined } from '../../util/extension';
import PokemonIconType from '../Sprites/PokemonIconType/PokemonIconType';

const CardPokemon = (props: ICardPokemonComponent) => {
  return (
    <div className="d-flex align-items-center w-100">
      <div className="position-relative">
        <PokemonIconType pokemonType={props.pokemonType} size={24} className="-left-1">
          <img
            height={38}
            alt="Pokémon Logo"
            title={splitAndCapitalize(props.value.name.replaceAll('_', '-'), '-', ' ')}
            className="me-2"
            src={APIService.getPokeIconSprite(props.value.sprite, true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite();
            }}
          />
        </PokemonIconType>
      </div>
      {splitAndCapitalize(props.value.name.replaceAll('_', '-'), '-', ' ')}
      {!isNullOrUndefined(props.score) && <span className="type-icon-small ic elite-ic ms-2">{props.score}</span>}
    </div>
  );
};

export default CardPokemon;
