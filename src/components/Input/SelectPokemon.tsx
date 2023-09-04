import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import React, { useEffect, useState } from 'react';

import './Select.scss';
import { splitAndCapitalize } from '../../util/Utils';
import APIService from '../../services/API.service';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/move.enum';
import { StoreState } from '../../store/models/state.model';
import { PokemonDataModel, PokemonDataStats } from '../../core/models/pokemon.model';

const SelectPokemon = (props: {
  pokemon?: PokemonDataModel;
  // eslint-disable-next-line no-unused-vars
  setCurrentPokemon: (arg0: any) => void;
  selected: boolean;
  // eslint-disable-next-line no-unused-vars
  setFMovePokemon: (arg0: any) => void;
  // eslint-disable-next-line no-unused-vars
  setCMovePokemon: (arg0: any) => void;
  clearData?: () => void;
  disable?: boolean;
  defaultSetting?: PokemonDataStats;
}) => {
  const data = useSelector((state: StoreState) => state.store.data?.pokemonCombat ?? []);
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemonData ?? []);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [pokemonIcon, setPokemonIcon] = useState(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : null);
  const [showPokemon, setShowPokemon] = useState(false);
  const [search, setSearch] = useState(props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : '');

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
      if (!props.pokemon?.stats && props.defaultSetting) {
        value.stats = props.defaultSetting;
      }
      if (props.setCurrentPokemon) {
        props.setCurrentPokemon(value);
      }
      if (props.selected && props.setFMovePokemon) {
        props.setFMovePokemon(props.pokemon ? findMove(value.num, value.forme ?? '', TypeMove.FAST) : null);
      }
      if (props.selected && props.setCMovePokemon) {
        props.setCMovePokemon(props.pokemon ? findMove(value.num, value.forme ?? '', TypeMove.CHARGE) : null);
      }
      if (props.clearData) {
        props.clearData();
      }
    }
  };

  const removePokemon = () => {
    setPokemonIcon(null);
    setSearch('');
    if (props.setCurrentPokemon) {
      props.setCurrentPokemon(null);
    }
    if (props.setFMovePokemon) {
      props.setFMovePokemon(null);
    }
    if (props.setCMovePokemon) {
      props.setCMovePokemon(null);
    }
    if (props.clearData) {
      props.clearData();
    }
  };

  const findMove = (id: number, form: string, type: string) => {
    const resultFirst = data.filter((item) => item.id === id);
    form = form ? form.toLowerCase().replaceAll('-', '_').replaceAll('_standard', '').toUpperCase() : '';
    const result = resultFirst.find((item) => item.name.replace(item.baseSpecies + '_', '') === form);
    const simpleMove: any[] = [];
    if (resultFirst.length === 1 || result == null) {
      if (type === TypeMove.FAST) {
        resultFirst.at(0)?.quickMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        resultFirst.at(0)?.eliteQuickMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
      } else {
        resultFirst.at(0)?.cinematicMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        resultFirst.at(0)?.eliteCinematicMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
        resultFirst.at(0)?.shadowMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
        });
        resultFirst.at(0)?.purifiedMoves.forEach((value: string) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
        });
      }
      return simpleMove.at(0);
    }
    if (type === TypeMove.FAST) {
      result.quickMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
      });
      result.eliteQuickMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
      });
    } else {
      result.cinematicMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
      });
      result.eliteCinematicMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
      });
      result.shadowMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
      });
      result.purifiedMoves.forEach((value: string) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
      });
    }
    return simpleMove.at(0);
  };

  useEffect(() => {
    setPokemonIcon(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : null);
    setSearch(props.pokemon ? splitAndCapitalize(props.pokemon.name.replaceAll('_', '-'), '-', ' ') : '');
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
            onInput={(e: any) => setSearch(e.target.value)}
            placeholder="Enter Name or ID"
            style={{
              background: pokemonIcon ? `url(${pokemonIcon}) left no-repeat` : '',
              paddingLeft: pokemonIcon ? 56 : '',
            }}
          />
        </div>
        <div className="result-pokemon" onScroll={(e) => listenScrollEvent(e)} style={{ display: showPokemon ? 'block' : 'none' }}>
          <div>
            {Object.values(pokemonData)
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
