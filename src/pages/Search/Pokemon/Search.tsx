import React, { useState, useEffect, Fragment } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import { useSelector } from 'react-redux';
import { getPokemonById, getPokemonByIndex } from '../../../util/Utils';
import { useTheme } from '@mui/material';
import { Action } from 'history';
import { RouterState, SearchingState, StoreState } from '../../../store/models/state.model';
import { KEY_DOWN, KEY_ENTER, KEY_UP } from '../../../util/Constants';
import { PokemonSearchingModel } from '../../../core/models/pokemon-searching.model';

const Search = () => {
  const theme = useTheme();
  const router = useSelector((state: RouterState) => state.router);
  const searching = useSelector((state: SearchingState) => state.searching.mainSearching);
  const pokemonName = useSelector((state: StoreState) => state.store?.data?.pokemonName ?? []);

  const [first, setFirst] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [id, setId] = useState(router.action === Action.Pop && searching ? searching.id : 1);
  const [selectId, setSelectId] = useState(router.action === Action.Pop && searching ? searching.id : 1);

  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [pokemonList, setPokemonList]: [PokemonSearchingModel[], React.Dispatch<React.SetStateAction<PokemonSearchingModel[]>>] = useState(
    [] as PokemonSearchingModel[]
  );
  const [pokemonListFilter, setPokemonListFilter]: [
    PokemonSearchingModel[],
    React.Dispatch<React.SetStateAction<PokemonSearchingModel[]>>
  ] = useState([] as PokemonSearchingModel[]);

  useEffect(() => {
    if (pokemonName.length > 0) {
      setPokemonList(pokemonName.filter((item) => item.id > 0).map((item) => new PokemonSearchingModel(item)));
    }
  }, [pokemonName]);

  useEffect(() => {
    document.title = 'Pokémon - Search';
  }, []);

  useEffect(() => {
    if (pokemonList.length > 0) {
      const timeOutId = setTimeout(() => {
        const results = pokemonList.filter(
          (item) => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm)
        );
        setPokemonListFilter(results);
      });
      return () => clearTimeout(timeOutId);
    }
  }, [pokemonList, searchTerm]);

  useEffect(() => {
    setSelectId(id);
  }, [id]);

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: number; offsetHeight: number } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: { id: number }) => {
    setShowResult(false);
    setId(value.id);
    if (first) {
      setFirst(false);
    }
  };

  const setIDPoke = (id: number) => {
    setId(id);
  };

  const decId = () => {
    const currentId = getPokemonById(pokemonName, selectId);
    if (currentId) {
      setId(getPokemonByIndex(pokemonName, currentId.index - 1)?.id ?? 0);
    }
  };

  const incId = () => {
    const currentId = getPokemonById(pokemonName, selectId);
    if (currentId) {
      setId(getPokemonByIndex(pokemonName, currentId.index + 1)?.id ?? 0);
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>, search: string) => {
    const currentId = getPokemonById(pokemonName, selectId);
    if (currentId) {
      const result = {
        prev: getPokemonByIndex(pokemonName, currentId.index - 1),
        current: currentId,
        next: getPokemonByIndex(pokemonName, currentId.index + 1),
      };
      if (event.keyCode === KEY_ENTER) {
        setShowResult(false);
        setId(selectId);
      } else if (result.prev && event.keyCode === KEY_UP) {
        setSelectId(result.prev.id);
      } else if (result.next && event.keyCode === KEY_DOWN) {
        setSelectId(result.next.id);
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
            <span className={'input-group-text ' + (theme.palette.mode === 'dark' ? 'input-group-dark' : '')}>Search</span>
          </div>
          <input
            type="text"
            className={'form-control input-search' + (theme.palette.mode === 'dark' ? '-dark' : '')}
            style={{ backgroundColor: (theme.palette.background as any).input, color: theme.palette.text.primary, zIndex: 1 }}
            placeholder="Enter Name or ID"
            defaultValue={searchTerm}
            onFocus={() => setShowResult(true)}
            onBlur={() => setShowResult(false)}
            onKeyUp={(e: any) => onChangeSelect(e, e.target.value)}
          />
        </div>
        <div className="result" style={{ display: showResult ? 'block' : 'none' }} onScroll={listenScrollEvent.bind(this)}>
          <Fragment>
            {pokemonListFilter.slice(0, firstInit + eachCounter * startIndex).map((value, index) => (
              <div
                className={
                  'container card-pokemon' +
                  (value.id === id ? ' highlight-select-pokemon' : '') +
                  (value.id === selectId ? ' current-select-pokemon' : '')
                }
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
                  onError={(e: any) => {
                    e.onerror = null;
                    e.target.src = APIService.getPokeSprite(0);
                  }}
                />
                {value.name}
              </div>
            ))}
          </Fragment>
        </div>
        <Pokemon
          id={id?.toString()}
          onSetIDPoke={setIDPoke}
          onIncId={incId}
          onDecId={decId}
          isSearch={true}
          prevRouter={router}
          searching={searching}
          first={first}
          setFirst={setFirst}
        />
      </div>
    </Fragment>
  );
};

export default Search;
