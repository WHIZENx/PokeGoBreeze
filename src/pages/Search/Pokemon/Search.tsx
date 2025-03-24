import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import { useSelector } from 'react-redux';
import { getPokemonById, mappingPokemonName } from '../../../util/utils';
import { useTheme } from '@mui/material';
import { Action } from 'history';
import { RouterState, SearchingState, StoreState } from '../../../store/models/state.model';
import { KEY_DOWN, KEY_ENTER, KEY_UP } from '../../../util/constants';
import { IPokemonSearching } from '../../../core/models/pokemon-searching.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { TypeTheme } from '../../../enums/type.enum';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { combineClasses, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { IncludeMode } from '../../../util/enums/string.enum';

const Search = () => {
  useChangeTitle('Pokémon - Search');
  const theme = useTheme<ThemeModify>();
  const router = useSelector((state: RouterState) => state.router);
  const searching = useSelector((state: SearchingState) => state.searching.mainSearching);
  const pokemonName = useSelector((state: StoreState) => state.store.data.pokemons);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [id, setId] = useState(router.action === Action.Pop && searching ? searching.id : 1);
  const [selectId, setSelectId] = useState(router.action === Action.Pop && searching ? searching.id : 1);

  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [pokemonList, setPokemonList] = useState<IPokemonSearching[]>([]);
  const [pokemonListFilter, setPokemonListFilter] = useState<IPokemonSearching[]>([]);

  useEffect(() => {
    if (isNotEmpty(pokemonName)) {
      const result = mappingPokemonName(pokemonName);
      setPokemonList(result);
    }
  }, [pokemonName]);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (isNotEmpty(pokemonList)) {
        const results = pokemonList.filter(
          (item) => isInclude(item.name, searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) || isInclude(item.id, searchTerm)
        );
        setPokemonListFilter(results);
      }
    });
    return () => clearTimeout(timeOutId);
  }, [pokemonList, searchTerm]);

  useEffect(() => {
    setSelectId(id);
  }, [id]);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: IPokemonSearching) => {
    setShowResult(false);
    setId(value.id);
    setSelectId(value.id);
  };

  const decId = () => {
    const currentPokemon = getPokemonById(pokemonName, selectId - 1);
    if (currentPokemon) {
      setSelectId(selectId - 1);
      setId(toNumber(currentPokemon.id));
    }
  };

  const incId = () => {
    const currentPokemon = getPokemonById(pokemonName, selectId + 1);
    if (currentPokemon) {
      setSelectId(selectId + 1);
      setId(toNumber(currentPokemon.id));
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>, search: string) => {
    const currentPokemon = getPokemonById(pokemonName, selectId);
    if (currentPokemon) {
      const prev = getPokemonById(pokemonName, currentPokemon.id - 1);
      const next = getPokemonById(pokemonName, currentPokemon.id + 1);
      if (event.keyCode === KEY_ENTER) {
        setShowResult(false);
        setId(selectId);
      } else if (prev && event.keyCode === KEY_UP) {
        setSelectId(prev.id);
      } else if (next && event.keyCode === KEY_DOWN) {
        setSelectId(next.id);
      } else {
        setSearchTerm(search);
      }
    }
  };

  return (
    <Fragment>
      <div className="container element-top">
        <h1 id="main" className="text-center" style={{ color: theme.palette.text.primary }}>
          Pokémon Info Search
        </h1>
        <div className="input-group mb-12 element-top">
          <div className="input-group-prepend">
            <span className={combineClasses('input-group-text', theme.palette.mode === TypeTheme.Dark ? 'input-group-dark' : '')}>
              Search
            </span>
          </div>
          <input
            type="text"
            className={combineClasses('form-control', `input-search${theme.palette.mode === TypeTheme.Dark ? '-dark' : ''}`)}
            style={{ backgroundColor: theme.palette.background.input, color: theme.palette.text.primary, zIndex: 1 }}
            placeholder="Enter Name or ID"
            defaultValue={searchTerm}
            onFocus={(e) => {
              setShowResult(true);
              if (!isEqual(e.currentTarget.value, searchTerm)) {
                setSearchTerm(e.currentTarget.value);
              }
            }}
            onBlur={() => setShowResult(false)}
            onKeyUp={(e) => onChangeSelect(e, e.currentTarget.value)}
          />
        </div>
        <div className="result" style={{ display: showResult ? 'block' : 'none' }} onScroll={listenScrollEvent.bind(this)}>
          <Fragment>
            {pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).map((value, index) => (
              <div
                className={combineClasses(
                  'container card-pokemon',
                  value.id === id ? 'highlight-select-pokemon' : '',
                  value.id === selectId ? 'current-select-pokemon' : ''
                )}
                key={index}
                onMouseDown={() => getInfoPoke(value)}
                onMouseOver={() => setSelectId(value.id)}
              >
                <b>#{value.id}</b>
                <img
                  width={36}
                  height={36}
                  className="img-search"
                  alt="img-pokemon"
                  src={value.sprites}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = APIService.getPokeSprite();
                  }}
                />
                {value.name}
              </div>
            ))}
          </Fragment>
        </div>
        <Pokemon id={id.toString()} setId={setId} onIncId={incId} onDecId={decId} isSearch={true} searching={searching} />
      </div>
    </Fragment>
  );
};

export default Search;
