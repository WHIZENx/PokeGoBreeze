import React from 'react';
import { formatPokemonDisplayName } from '../../utils/pokemon-display-name';
import { ICardPokemonComponent } from '../models/component.model';
import { isNullOrUndefined } from '../../utils/extension';
import PokemonIconType from '../Sprites/PokemonIconType/PokemonIconType';
import PokemonTableIcon from '../Sprites/PokemonTableIcon/PokemonTableIcon';

const CardPokemon = (props: ICardPokemonComponent) => {
  return (
    <div className="tw-flex tw-items-center tw-w-full">
      <div className="tw-relative">
        <PokemonIconType pokemonType={props.pokemonType} size={24}>
          <PokemonTableIcon {...props.value} num={props.value?.num ?? 0} className="tw-mr-2" size={38} />
        </PokemonIconType>
      </div>
      <span className="tw-truncate">{formatPokemonDisplayName(props.value?.name)}</span>
      {!isNullOrUndefined(props.score) && <span className="type-icon-small ic elite-ic tw-ml-2">{props.score}</span>}
    </div>
  );
};

export default CardPokemon;
