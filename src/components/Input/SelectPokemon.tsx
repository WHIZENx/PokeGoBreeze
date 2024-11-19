import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import React, { useEffect, useRef, useState } from 'react';

import './Select.scss';
import { retrieveMoves, splitAndCapitalize } from '../../util/utils';
import APIService from '../../services/API.service';
import { useSelector } from 'react-redux';
import { MoveType, TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ISelectMoveModel, SelectMoveModel } from './models/select-move.model';
import { ISelectPokemonComponent } from '../models/component.model';
import { combineClasses, isEqual, isInclude, isNotEmpty } from '../../util/extension';
import { IncludeMode } from '../../util/enums/string.enum';
import { SelectPosition } from './enums/input-type.enum';

const SelectPokemon = (props: ISelectPokemonComponent) => {
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemon);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [pokemonIcon, setPokemonIcon] = useState(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined);
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
    const iconName =
      pokemonIcon && pokemonIcon.split('/').at(9) ? splitAndCapitalize(pokemonIcon.split('/').at(9)?.replace('.png', ''), '-', ' ') : '';
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
        props.setFMovePokemon(findMove(value.num, value.forme, TypeMove.Fast));
      }
      if (props.isSelected && props.setCMovePokemon) {
        props.setCMovePokemon(findMove(value.num, value.forme, TypeMove.Charge));
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

  const findMove = (id: number, form: string | null | undefined, type: TypeMove) => {
    const result = retrieveMoves(pokemonData, id, form);
    if (result) {
      const simpleMove: ISelectMoveModel[] = [];
      if (type === TypeMove.Fast) {
        result.quickMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.None));
        });
        result.eliteQuickMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.Elite));
        });
      } else {
        result.cinematicMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.None));
        });
        result.eliteCinematicMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.Elite));
        });
        result.shadowMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.Shadow));
        });
        result.purifiedMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.Purified));
        });
        result.specialMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, MoveType.Special));
        });
      }
      return simpleMove[0];
    }
  };

  useEffect(() => {
    if (isNotEmpty(pokemonData)) {
      setPokemonIcon(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined);
      setSearch(props.pokemon ? splitAndCapitalize(props.pokemon.name.replaceAll('_', '-'), '-', ' ') : '');
    }
  }, [props.pokemon, pokemonData]);

  const setPos = (position = SelectPosition.Down) => {
    return (
      <div
        className={combineClasses('result-pokemon', position === SelectPosition.Up ? 'pos-up' : '')}
        onScroll={listenScrollEvent.bind(this)}
        style={{ display: showPokemon ? 'block' : 'none', maxHeight: props.maxHeight ?? 274 }}
      >
        <div>
          {pokemonData
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
  };

  const inputPos = () => {
    return (
      <div className="d-flex align-items-center border-box">
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
  };

  return (
    <div
      className={combineClasses('position-relative d-flex align-items-center form-control', props.isDisable ? 'card-select-disabled' : '')}
      style={{ padding: 0, borderRadius: 0 }}
    >
      <div className="card-pokemon-input">
        {!props.position || props.position === SelectPosition.Down ? (
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
