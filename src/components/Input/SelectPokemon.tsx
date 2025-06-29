import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import React, { useEffect, useRef, useState } from 'react';

import './Select.scss';
import { addSelectMovesByType, retrieveMoves, splitAndCapitalize } from '../../utils/utils';
import APIService from '../../services/api.service';
import { TypeMove } from '../../enums/type.enum';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ISelectPokemonComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isNotEmpty, isUndefined } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { SelectPosition } from './enums/input-type.enum';
import { useDataStore } from '../../composables/useDataStore';

const SelectPokemon = (props: ISelectPokemonComponent) => {
  const dataStore = useDataStore();

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [pokemonIcon, setPokemonIcon] = useState(
    props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined
  );
  const [showPokemon, setShowPokemon] = useState(false);
  const [search, setSearch] = useState(props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : '');

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 0.8 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const changePokemon = (value: IPokemonData) => {
    setShowPokemon(false);
    const name = splitAndCapitalize(value.name, '-', ' ');
    const icon = getValueOrDefault(String, pokemonIcon?.split('/').at(9));
    const iconName = splitAndCapitalize(icon.replace('.png', ''), '-', ' ');
    if (!isEqual(iconName, name)) {
      setPokemonIcon(APIService.getPokeIconSprite(value.sprite));
      setSearch(name);
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
    setSearch('');
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
    const result = retrieveMoves(dataStore.pokemons, value.num, value.form, value.pokemonType);
    if (result) {
      const simpleMove = addSelectMovesByType(result, type);
      return simpleMove[0];
    }
  };

  useEffect(() => {
    if (isNotEmpty(dataStore.pokemons)) {
      setPokemonIcon(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined);
      setSearch(props.pokemon ? splitAndCapitalize(props.pokemon.name.replaceAll('_', '-'), '-', ' ') : '');
    }
  }, [props.pokemon, dataStore.pokemons]);

  const setPos = (position = SelectPosition.Down) => (
    <div
      className={combineClasses(
        'result-pokemon',
        position === SelectPosition.Up ? 'pos-up' : '',
        showPokemon ? 'd-block' : 'd-none'
      )}
      onScroll={listenScrollEvent.bind(this)}
      style={{ maxHeight: props.maxHeight ?? 274 }}
    >
      <div>
        {dataStore.pokemons
          .filter(
            (item) =>
              item.num > 0 &&
              (isInclude(splitAndCapitalize(item.name, '-', ' '), search, IncludeMode.IncludeIgnoreCaseSensitive) ||
                isInclude(item.num, search))
          )
          .slice(0, firstInit.current + eachCounter.current * startIndex)
          .map((value, index) => (
            <div className="card-pokemon-select" key={index} onMouseDown={() => changePokemon(value)}>
              <CardPokemon value={value} />
            </div>
          ))}
      </div>
    </div>
  );

  const inputPos = () => (
    <div className="d-flex align-items-center">
      {pokemonIcon && (
        <span onClick={() => removePokemon()} className="remove-pokemon-select">
          <CloseIcon sx={{ color: 'red' }} />
        </span>
      )}
      <input
        className="input-pokemon-select form-control shadow-none"
        onClick={() => setShowPokemon(true)}
        onBlur={() => setShowPokemon(false)}
        value={search}
        type="text"
        onInput={(e) => setSearch(e.currentTarget.value)}
        placeholder="Enter Name or ID"
        style={{
          background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat` : '',
          paddingLeft: pokemonIcon ? 56 : '',
        }}
      />
    </div>
  );

  return (
    <div
      className={combineClasses(
        'position-relative d-flex align-items-center form-control p-0 rounded-0',
        props.isDisable ? 'card-select-disabled' : ''
      )}
    >
      <div className="card-pokemon-input">
        {isUndefined(props.position) || props.position === SelectPosition.Down ? (
          <>
            {inputPos()}
            {setPos(props.position)}
          </>
        ) : (
          <>
            {setPos(props.position)}
            {inputPos()}
          </>
        )}
      </div>
    </div>
  );
};

export default SelectPokemon;
