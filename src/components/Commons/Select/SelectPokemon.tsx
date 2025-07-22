import CardPokemon from '../../Card/CardPokemon';

import React, { useEffect, useState } from 'react';

import './Select.scss';
import { addSelectMovesByType, splitAndCapitalize } from '../../../utils/utils';
import APIService from '../../../services/api.service';
import { TypeMove } from '../../../enums/type.enum';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectPokemonComponent } from '../models/component.model';
import { getValueOrDefault, isEqual } from '../../../utils/extension';
import usePokemon from '../../../composables/usePokemon';
import SelectCustomPokemon from './SelectCustomPokemon';

const SelectPokemon = (props: ISelectPokemonComponent) => {
  const { retrieveMoves, getFilteredPokemons } = usePokemon();

  const [pokemonIcon, setPokemonIcon] = useState(
    props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined
  );

  const changePokemon = (value: IPokemonData) => {
    const name = splitAndCapitalize(value.name, '-', ' ');
    const icon = getValueOrDefault(String, pokemonIcon?.split('/').at(9));
    const iconName = splitAndCapitalize(icon.replace('.png', ''), '-', ' ');
    if (!isEqual(iconName, name)) {
      setPokemonIcon(APIService.getPokeIconSprite(value.sprite));
      if (props.defaultSetting) {
        value.stats = props.defaultSetting;
      }
      if (props.setCurrentPokemon) {
        props.setCurrentPokemon(value);
      }
      if (props.isSelected && props.setFMovePokemon) {
        props.setFMovePokemon(findMove(value, TypeMove.Fast));
      }
      if (props.isSelected && props.setCMovePokemon) {
        props.setCMovePokemon(findMove(value, TypeMove.Charge));
      }
      if (props.clearData) {
        props.clearData();
      }
    }
  };

  const removePokemon = () => {
    setPokemonIcon(undefined);
    if (props.setCurrentPokemon) {
      props.setCurrentPokemon(undefined);
    }
    if (props.setFMovePokemon) {
      props.setFMovePokemon(undefined);
    }
    if (props.setCMovePokemon) {
      props.setCMovePokemon(undefined);
    }
    if (props.clearData) {
      props.clearData();
    }
  };

  const findMove = (value: IPokemonData, type: TypeMove) => {
    const result = retrieveMoves(value.num, value.form, value.pokemonType);
    if (result) {
      const simpleMove = addSelectMovesByType(result, type);
      return simpleMove[0];
    }
  };

  useEffect(() => {
    if (props.pokemon) {
      setPokemonIcon(APIService.getPokeIconSprite(props.pokemon.sprite));
    }
  }, [props.pokemon]);

  return (
    <SelectCustomPokemon
      pokemonList={getFilteredPokemons()}
      value={props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : ''}
      onSetPokemon={(pokemon) => changePokemon(pokemon)}
      isFit
      onSelect={(pokemon) => splitAndCapitalize(pokemon.name.replaceAll('_', '-'), '-', ' ')}
      onFilter={(pokemon) => ({ name: pokemon.name, id: pokemon.num })}
      label={props.labelPrepend}
      onRemove={() => removePokemon()}
      isShowRemove={!!pokemonIcon}
      cardElement={(pokemon) => <CardPokemon value={pokemon} />}
      maxHeight={props.maxHeight}
      customPrepend={
        pokemonIcon && (
          <img
            className="me-2"
            width={40}
            height={40}
            alt="Pokémon Image"
            src={pokemonIcon}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = APIService.getPokeIconSprite();
            }}
          />
        )
      }
    />
  );
};

export default SelectPokemon;
