import React from 'react';
import APIService from '../../services/api.service';
import { formatPokemonDisplayName } from '../../utils/pokemon-display-name';
import { ICardPokemonComponent } from '../models/component.model';
import { isNullOrUndefined } from '../../utils/extension';
import PokemonIconType from '../Sprites/PokemonIconType/PokemonIconType';

const CardPokemon = (props: ICardPokemonComponent) => {
  return (
    <div className="tw-flex tw-items-center tw-w-full">
      <div className="tw-relative">
        <PokemonIconType pokemonType={props.pokemonType} size={24} className="-tw-left-1">
          <img
            height={38}
            alt="Pokémon Logo"
            title={formatPokemonDisplayName(props.value?.name)}
            className="tw-mr-2"
            src={APIService.getPokeIconSprite(props.value?.sprite, true)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite();
            }}
          />
        </PokemonIconType>
      </div>
      <span className="tw-truncate">{formatPokemonDisplayName(props.value?.name)}</span>
      {!isNullOrUndefined(props.score) && <span className="type-icon-small ic elite-ic tw-ml-2">{props.score}</span>}
    </div>
  );
};

export default CardPokemon;
