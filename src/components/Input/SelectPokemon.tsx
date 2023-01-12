import CardPokemon from '../Card/CardPokemon';
import CloseIcon from '@mui/icons-material/Close';

import pokemonData from '../../data/pokemon.json';
import React, { useEffect, useState } from 'react';

import './Select.css';
import { splitAndCapitalize } from '../../util/Utils';
import APIService from '../../services/API.service';
import { useSelector, RootStateOrAny } from 'react-redux';

const SelectPokemon = (props: {
  pokemon?: any;
  // eslint-disable-next-line no-unused-vars
  setCurrentPokemon: (arg0: any) => void;
  selected: any;
  // eslint-disable-next-line no-unused-vars
  setFMovePokemon: (arg0: any) => void;
  // eslint-disable-next-line no-unused-vars
  setCMovePokemon: (arg0: any) => void;
  clearData?: () => void;
  disable?: boolean;
}) => {
  const data = useSelector((state: RootStateOrAny) => state.store.data.pokemonCombat);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [pokemonIcon, setPokemonIcon] = useState(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : null);
  const [showPokemon, setShowPokemon] = useState(false);
  const [search, setSearch] = useState(props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : '');

  const listenScrollEvent = (ele: any) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 0.8 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const changePokemon = (value: any) => {
    setShowPokemon(false);
    const name = splitAndCapitalize(value.name, '-', ' ');
    const iconName =
      pokemonIcon && pokemonIcon.split('/')[9] ? splitAndCapitalize(pokemonIcon.split('/')[9].replace('.png', ''), '-', ' ') : '';
    if (iconName !== name) {
      setPokemonIcon(APIService.getPokeIconSprite(value.sprite));
      setSearch(name);
      if (props.setCurrentPokemon) {
        props.setCurrentPokemon(value);
      }
      if (props.selected && props.setFMovePokemon) {
        props.setFMovePokemon(props.pokemon ? findMove(value.num, value.forme, 'FAST') : null);
      }
      if (props.selected && props.setCMovePokemon) {
        props.setCMovePokemon(props.pokemon ? findMove(value.num, value.forme, 'CHARGE') : null);
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

  const findMove = (id: any, form: string, type: string) => {
    const resultFirst = data.filter((item: { id: any }) => item.id === id);
    form = form ? form.toLowerCase().replaceAll('-', '_').replaceAll('_standard', '').toUpperCase() : '';
    const result = resultFirst.find(
      (item: { name: string; baseSpecies: string }) => item.name.replace(item.baseSpecies + '_', '') === form
    );
    const simpleMove: any[] = [];
    if (resultFirst.length === 1 || result == null) {
      if (type === 'FAST') {
        resultFirst[0].quickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        resultFirst[0].eliteQuickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
      } else {
        resultFirst[0].cinematicMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        resultFirst[0].eliteCinematicMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
        resultFirst[0].shadowMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
        });
        resultFirst[0].purifiedMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
        });
      }
      return simpleMove[0];
    }
    if (type === 'FAST') {
      result.quickMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
      });
      result.eliteQuickMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
      });
    } else {
      result.cinematicMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
      });
      result.eliteCinematicMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
      });
      result.shadowMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
      });
      result.purifiedMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
      });
    }
    return simpleMove[0];
  };

  useEffect(() => {
    setPokemonIcon(props.pokemon ? APIService.getPokeIconSprite(props.pokemon.sprite) : null);
    setSearch(props.pokemon ? splitAndCapitalize(props.pokemon.name, '-', ' ') : '');
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
                  item.num <= 905 &&
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
