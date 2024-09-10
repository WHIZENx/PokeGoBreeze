import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import React, { useEffect, useState } from 'react';

import './Select.scss';
import { combineClasses, isNotEmpty, retrieveMoves, splitAndCapitalize } from '../../util/utils';
import APIService from '../../services/API.service';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { ISelectMoveModel, SelectMoveModel } from './models/select-move.model';
import { ISelectPokemonComponent } from '../models/component.model';
import { getValueOrDefault } from '../../util/models/util.model';

const SelectPokemon = (props: ISelectPokemonComponent) => {
  const pokemonData = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.pokemon));

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

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
    if (iconName !== name) {
      setPokemonIcon(APIService.getPokeIconSprite(value.sprite));
      setSearch(name);
      if (props.defaultSetting) {
        value.stats = props.defaultSetting;
      }
      if (props.setCurrentPokemon) {
        props.setCurrentPokemon(value);
      }
      if (props.selected && props.setFMovePokemon) {
        props.setFMovePokemon(findMove(value.num, getValueOrDefault(String, value.forme), TypeMove.FAST));
      }
      if (props.selected && props.setCMovePokemon) {
        props.setCMovePokemon(findMove(value.num, getValueOrDefault(String, value.forme), TypeMove.CHARGE));
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

  const findMove = (id: number, form: string, type: string) => {
    const result = retrieveMoves(pokemonData, id, form);
    if (result) {
      const simpleMove: ISelectMoveModel[] = [];
      if (type === TypeMove.FAST) {
        result.quickMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, false, false, false, false));
        });
        result.eliteQuickMove?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, true, false, false, false));
        });
      } else {
        result.cinematicMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, false, false, false, false));
        });
        result.eliteCinematicMove?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, true, false, false, false));
        });
        result.shadowMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, false, true, false, false));
        });
        result.purifiedMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, false, false, true, false));
        });
        result.specialMoves?.forEach((value) => {
          simpleMove.push(new SelectMoveModel(value, false, false, false, true));
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

  return (
    <div
      className={combineClasses('position-relative d-flex align-items-center form-control', props.disable ? 'card-select-disabled' : '')}
      style={{ padding: 0, borderRadius: 0 }}
    >
      <div className="card-pokemon-input">
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
        <div
          className="result-pokemon"
          onScroll={(e) => listenScrollEvent(e)}
          style={{ display: showPokemon ? 'block' : 'none', maxHeight: props.maxHeight ?? 274 }}
        >
          <div>
            {pokemonData
              .filter(
                (item) =>
                  item.num > 0 &&
                  (splitAndCapitalize(item.name, '-', ' ').toLowerCase().includes(search.toLowerCase()) ||
                    item.num.toString().includes(search))
              )
              .slice(0, firstInit + eachCounter * startIndex)
              .map((value, index) => (
                <div className="card-pokemon-select" key={index} onMouseDown={() => changePokemon(value)}>
                  <CardPokemon value={value} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPokemon;
