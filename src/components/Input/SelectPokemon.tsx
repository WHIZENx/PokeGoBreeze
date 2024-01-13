import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import React, { useCallback, useEffect, useState } from 'react';

import './Select.scss';
import { splitAndCapitalize } from '../../util/Utils';
import APIService from '../../services/API.service';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/move.enum';
import { StoreState } from '../../store/models/state.model';
import { PokemonDataModel, PokemonDataStats } from '../../core/models/pokemon.model';
import { SelectMoveModel } from './models/select-move.model';

const SelectPokemon = (props: {
  pokemon?: PokemonDataModel;
  setCurrentPokemon: React.Dispatch<React.SetStateAction<PokemonDataModel | undefined>>;
  selected: boolean;
  setFMovePokemon: React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>;
  setCMovePokemon: React.Dispatch<React.SetStateAction<SelectMoveModel | undefined>>;
  clearData?: () => void;
  disable?: boolean;
  defaultSetting?: PokemonDataStats;
}) => {
  const combat = useSelector((state: StoreState) => state.store.data?.pokemonCombat ?? []);
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemonData ?? []);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [pokemonIcon, setPokemonIcon] = useState(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined);
  const [showPokemon, setShowPokemon] = useState(false);
  const [search, setSearch] = useState(props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : '');
  const [currentPokemon, setCurrentPokemon] = useState(props.pokemon);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 0.8 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const changePokemon = (value: PokemonDataModel) => {
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
        props.setFMovePokemon(currentPokemon ? findMove(value.num, value.forme ?? '', TypeMove.FAST) : undefined);
      }
      if (props.selected && props.setCMovePokemon) {
        props.setCMovePokemon(currentPokemon ? findMove(value.num, value.forme ?? '', TypeMove.CHARGE) : undefined);
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

  const findMove = useCallback(
    (id: number, form: string, type: string) => {
      if (combat.length > 0) {
        const resultFirst = combat.filter((item) => item.id === id);
        form = form ? form.toLowerCase().replaceAll('-', '_').replaceAll('_standard', '').toUpperCase() : '';
        const result = resultFirst.find((item) => item.name.replace(item.baseSpecies + '_', '') === form);
        const simpleMove: SelectMoveModel[] = [];
        if (resultFirst.length === 1 || result == null) {
          if (type === TypeMove.FAST) {
            resultFirst.at(0)?.quickMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.eliteQuickMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
            });
          } else {
            resultFirst.at(0)?.cinematicMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.eliteCinematicMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.shadowMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
            });
            resultFirst.at(0)?.purifiedMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
            });
            resultFirst.at(0)?.specialMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
            });
          }
          return simpleMove.at(0);
        }
        if (type === TypeMove.FAST) {
          result.quickMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
          });
          result.eliteQuickMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
          });
        } else {
          result.cinematicMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
          });
          result.eliteCinematicMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
          });
          result.shadowMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
          });
          result.purifiedMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
          });
          result.specialMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
          });
        }
        return simpleMove.at(0);
      }
      return;
    },
    [combat]
  );

  useEffect(() => {
    setPokemonIcon(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : undefined);
    setSearch(props.pokemon ? splitAndCapitalize(props.pokemon.name.replaceAll('_', '-'), '-', ' ') : '');
    if (props.pokemon) {
      setCurrentPokemon(props.pokemon);
    }
  }, [props.pokemon]);

  return (
    <div
      className={'position-relative d-flex align-items-center form-control' + (props.disable ? ' card-select-disabled' : '')}
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
        <div className="result-pokemon" onScroll={(e) => listenScrollEvent(e)} style={{ display: showPokemon ? 'block' : 'none' }}>
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
