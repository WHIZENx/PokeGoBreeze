import CardPokemon from '../../Card/CardPokemon';

import React from 'react';

import './Select.scss';
import { addSelectMovesByType, splitAndCapitalize } from '../../../utils/utils';
import APIService from '../../../services/api.service';
import { TypeMove } from '../../../enums/type.enum';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { ISelectPokemonComponent } from '../models/component.model';
import usePokemon from '../../../composables/usePokemon';
import SelectCustomPokemon from './SelectCustomPokemon';

const SelectPokemon = (props: ISelectPokemonComponent) => {
  const { retrieveMoves, getFilteredPokemons } = usePokemon();

  const changePokemon = (value: IPokemonData) => {
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
  };

  const removePokemon = () => {
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

  return (
    <SelectCustomPokemon
      pokemonList={getFilteredPokemons()}
      value={props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : ''}
      onSetPokemon={(pokemon) => changePokemon(pokemon)}
      isFit
      onSelect={(pokemon) => splitAndCapitalize(pokemon.name.replaceAll('_', '-'), '-', ' ')}
      onFilter={(pokemon) => ({ name: pokemon.name, id: pokemon.num })}
      onIsSelectedPokemon={(pokemon) => pokemon === props.pokemon}
      label={props.labelPrepend}
      onRemove={() => removePokemon()}
      cardElement={(pokemon) => <CardPokemon value={pokemon} />}
      maxHeight={props.maxHeight}
      isShowPokemonIcon
      sprite={props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined}
      onSprite={(pokemon) => pokemon?.sprite}
      isDisable={props.isDisable}
    />
  );
};

export default SelectPokemon;
