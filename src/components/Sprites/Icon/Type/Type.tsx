import React from 'react';
import { IIconTypeComponent } from '../../../models/component.model';
import APIService from '../../../../services/API.service';
import { EqualMode } from '../../../../util/enums/string.enum';
import { isEqual } from '../../../../util/extension';
import { capitalize, getDataWithKey } from '../../../../util/utils';
import { PokemonTypeBadge } from '../../../../core/models/type.model';

import Bug from '../../../../assets/types/POKEMON_TYPE_BUG.png';
import Dark from '../../../../assets/types/POKEMON_TYPE_DARK.png';
import Dragon from '../../../../assets/types/POKEMON_TYPE_DRAGON.png';
import Electric from '../../../../assets/types/POKEMON_TYPE_ELECTRIC.png';
import Fairy from '../../../../assets/types/POKEMON_TYPE_FAIRY.png';
import Fighting from '../../../../assets/types/POKEMON_TYPE_FIGHTING.png';
import Fire from '../../../../assets/types/POKEMON_TYPE_FIRE.png';
import Flying from '../../../../assets/types/POKEMON_TYPE_FLYING.png';
import Ghost from '../../../../assets/types/POKEMON_TYPE_GHOST.png';
import Grass from '../../../../assets/types/POKEMON_TYPE_GRASS.png';
import Ground from '../../../../assets/types/POKEMON_TYPE_GROUND.png';
import Ice from '../../../../assets/types/POKEMON_TYPE_ICE.png';
import Normal from '../../../../assets/types/POKEMON_TYPE_NORMAL.png';
import Poison from '../../../../assets/types/POKEMON_TYPE_POISON.png';
import Psychic from '../../../../assets/types/POKEMON_TYPE_PSYCHIC.png';
import Rock from '../../../../assets/types/POKEMON_TYPE_ROCK.png';
import Steel from '../../../../assets/types/POKEMON_TYPE_STEEL.png';
import Water from '../../../../assets/types/POKEMON_TYPE_WATER.png';

const IconType = (props: IIconTypeComponent) => {
  const getImageObjectByType = (type: string) => {
    const pokemonType = getDataWithKey<PokemonTypeBadge>(PokemonTypeBadge, capitalize(type));
    switch (pokemonType) {
      case PokemonTypeBadge.Bug:
        return Bug;
      case PokemonTypeBadge.Dark:
        return Dark;
      case PokemonTypeBadge.Dragon:
        return Dragon;
      case PokemonTypeBadge.Electric:
        return Electric;
      case PokemonTypeBadge.Fairy:
        return Fairy;
      case PokemonTypeBadge.Fighting:
        return Fighting;
      case PokemonTypeBadge.Fire:
        return Fire;
      case PokemonTypeBadge.Flying:
        return Flying;
      case PokemonTypeBadge.Ghost:
        return Ghost;
      case PokemonTypeBadge.Grass:
        return Grass;
      case PokemonTypeBadge.Ground:
        return Ground;
      case PokemonTypeBadge.Ice:
        return Ice;
      case PokemonTypeBadge.Normal:
        return Normal;
      case PokemonTypeBadge.Poison:
        return Poison;
      case PokemonTypeBadge.Psychic:
        return Psychic;
      case PokemonTypeBadge.Rock:
        return Rock;
      case PokemonTypeBadge.Steel:
        return Steel;
      case PokemonTypeBadge.Water:
        return Water;
      default:
        return APIService.getPokeSprite();
    }
  };

  return (
    <img
      alt={props.alt}
      title={props.title}
      className={props.className}
      style={props.style}
      width={props.width}
      height={props.height}
      src={
        !props.type || isEqual(props.type, 'unknown', EqualMode.IgnoreCaseSensitive)
          ? APIService.getPokeSprite()
          : getImageObjectByType(props.type)
      }
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = APIService.getPokeSprite();
      }}
    />
  );
};

export default IconType;
