import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import { useSelector } from 'react-redux';
import { getPokemonById, mappingPokemonName } from '../../../util/utils';
import { Action } from 'history';
import { RouterState, SearchingState, StoreState } from '../../../store/models/state.model';
import { KEY_DOWN, KEY_ENTER, KEY_UP } from '../../../util/constants';
import { IPokemonSearching } from '../../../core/models/pokemon-searching.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { PokemonType } from '../../../enums/type.enum';
import { combineClasses, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { IncludeMode } from '../../../util/enums/string.enum';
import { SearchOption } from './models/pokemon-search.model';
import { debounce } from 'lodash';

const Search = () => {
  useChangeTitle('Pokémon - Search');
  const router = useSelector((state: RouterState) => state.router);
  const searching = useSelector((state: SearchingState) => state.searching.mainSearching);
  const pokemonName = useSelector((state: StoreState) => state.store.data.pokemons);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [searchOption, setSearchOption] = useState<SearchOption>({
    id: router.action === Action.Pop && searching ? toNumber(searching.pokemon?.id, 1) : 1,
    form: router.action === Action.Pop && searching ? searching.form?.form?.formName : '',
    pokemonType: PokemonType.Normal,
  });
  const [selectId, setSelectId] = useState(
    router.action === Action.Pop && searching ? toNumber(searching.pokemon?.id, 1) : 1
  );

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
    if (isNotEmpty(pokemonList)) {
      const debounced = debounce(() => {
        const results = pokemonList.filter(
          (item) =>
            isInclude(item.name, searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) || isInclude(item.id, searchTerm)
        );
        setPokemonListFilter(results);
      });
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [pokemonList, searchTerm]);

  useEffect(() => {
    setSelectId(searchOption.id);
  }, [searchOption.id]);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: IPokemonSearching) => {
    setShowResult(false);
    setSearchOption({ id: value.id });
    setSelectId(value.id);
  };

  const decId = () => {
    const currentPokemon = getPokemonById(pokemonName, selectId - 1);
    if (currentPokemon) {
      setSelectId(selectId - 1);
      setSearchOption({ id: toNumber(currentPokemon.id) });
    }
  };

  const incId = () => {
    const currentPokemon = getPokemonById(pokemonName, selectId + 1);
    if (currentPokemon) {
      setSelectId(selectId + 1);
      setSearchOption({ id: toNumber(currentPokemon.id) });
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>, search: string) => {
    const currentPokemon = getPokemonById(pokemonName, selectId);
    if (currentPokemon) {
      const prev = getPokemonById(pokemonName, currentPokemon.id - 1);
      const next = getPokemonById(pokemonName, currentPokemon.id + 1);
      if (isNotEmpty(pokemonListFilter) && event.keyCode === KEY_ENTER) {
        const input = document.getElementById('input-search-pokemon');
        input?.blur();
        setShowResult(false);
        setSearchOption({ id: pokemonListFilter[0].id });
        setSelectId(pokemonListFilter[0].id);
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
      <div className="container mt-2">
        <h1 id="main" className="text-center">
          Pokémon Info Search
        </h1>
        <div className="input-group mb-12 mt-2">
          <div className="input-group-prepend">
            <span className="input-group-text">Search</span>
          </div>
          <input
            id="input-search-pokemon"
            type="text"
            autoComplete="false"
            className="form-control input-search"
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
        <div
          className="result"
          style={{ display: showResult ? 'block' : 'none' }}
          onScroll={listenScrollEvent.bind(this)}
        >
          <Fragment>
            {pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).map((value, index) => (
              <div
                className={combineClasses(
                  'container card-pokemon',
                  value.id === searchOption.id ? 'highlight-select-pokemon' : '',
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
                  alt="Pokémon Image"
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
        <Pokemon
          searchOption={searchOption}
          setSearchOption={setSearchOption}
          onIncId={incId}
          onDecId={decId}
          isSearch
          searching={searching}
        />
      </div>
    </Fragment>
  );
};

export default Search;
