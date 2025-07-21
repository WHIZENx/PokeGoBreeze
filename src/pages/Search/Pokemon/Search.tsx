import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/api.service';
import Pokemon from '../../Pokemon/Pokemon';

import { Action } from 'history';
import { IPokemonSearching } from '../../../core/models/pokemon-searching.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { PokemonType } from '../../../enums/type.enum';
import { combineClasses, isInclude, isNotEmpty, toNumber } from '../../../utils/extension';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { SearchOption } from './models/pokemon-search.model';
import { debounce } from 'lodash';
import { keyDown, keyEnter, keyUp } from '../../../utils/helpers/options-context.helpers';
import useRouter from '../../../composables/useRouter';
import usePokemon from '../../../composables/usePokemon';
import useSearch from '../../../composables/useSearch';
import InputMuiSearch from '../../../components/Commons/Input/InputMuiSearch';
import { MenuItem, MenuList } from '@mui/material';

const Search = () => {
  useTitle({
    title: 'PokéGO Breeze - Pokémon Search',
    description:
      'Search and filter Pokémon in Pokémon GO by type, stats, moves, and more. Find the best Pokémon for your battle teams.',
    keywords: ['Pokémon search', 'find Pokémon', 'Pokémon filter', 'Pokémon GO search', 'Pokémon database'],
  });
  const { routerAction } = useRouter();
  const { getPokemonById, mappingPokemonName } = usePokemon();
  const { searchingMainData } = useSearch();

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [searchOption, setSearchOption] = useState<SearchOption>({
    id: routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1,
    form: routerAction === Action.Pop && searchingMainData ? searchingMainData.form?.form?.formName : '',
    pokemonType: PokemonType.Normal,
  });
  const [selectId, setSelectId] = useState(
    routerAction === Action.Pop && searchingMainData ? toNumber(searchingMainData.pokemon?.id, 1) : 1
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [pokemonList, setPokemonList] = useState<IPokemonSearching[]>([]);
  const [pokemonListFilter, setPokemonListFilter] = useState<IPokemonSearching[]>([]);

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const result = mappingPokemonName();
    setPokemonList(result);
  }, [mappingPokemonName]);

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
    const scrollingElement = ele.currentTarget;
    const scrollTop = toNumber(scrollingElement.scrollTop);
    const fullHeight = toNumber(scrollingElement.offsetHeight);
    const scrollHeight = toNumber(scrollingElement.scrollHeight);

    if (scrollTop + fullHeight >= scrollHeight * 0.8) {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }

      scrollDebounceRef.current = setTimeout(() => {
        setStartIndex((prevIndex) => prevIndex + 1);
      }, 100);
    }
  };

  const getInfoPoke = (value: IPokemonSearching) => {
    setShowResult(false);
    setSearchOption({ id: value.id });
    setSelectId(value.id);
  };

  const modifyId = (modify: number) => {
    const currentPokemon = getPokemonById(selectId + modify);
    if (currentPokemon) {
      setSelectId(selectId + modify);
      setSearchOption({ id: toNumber(currentPokemon.id) });
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const currentPokemon = getPokemonById(selectId);
    if (currentPokemon) {
      const prev = getPokemonById(currentPokemon.id - 1);
      const next = getPokemonById(currentPokemon.id + 1);
      if (isNotEmpty(pokemonListFilter) && event.keyCode === keyEnter()) {
        const input = document.getElementById('input-search-pokemon');
        input?.blur();
        setShowResult(false);
        setSearchOption({ id: selectId });
      } else if (prev && event.keyCode === keyUp()) {
        event.preventDefault();
        setSelectId(prev.id);
        scrollToSelectedItem(prev.id);
      } else if (next && event.keyCode === keyDown()) {
        event.preventDefault();
        setSelectId(next.id);
        scrollToSelectedItem(next.id);
      }
    }
  };

  const scrollToSelectedItem = (id: number) => {
    if (!resultsContainerRef.current) {
      return;
    }

    setTimeout(() => {
      const container = resultsContainerRef.current;
      if (!container) {
        return;
      }

      const selectedElement = container.querySelector(`#pokemon-card-${id}`) as HTMLElement;
      if (!selectedElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + containerRect.height;
      const elementTop = selectedElement.offsetTop;
      const elementBottom = elementTop + selectedElement.offsetHeight;

      const isInView = elementTop >= containerTop && elementBottom <= containerBottom;

      if (!isInView) {
        if (elementTop < containerTop) {
          container.scrollTo({
            top: elementTop,
            behavior: 'smooth',
          });
        } else if (elementBottom > containerBottom) {
          container.scrollTo({
            top: elementBottom - containerRect.height,
            behavior: 'smooth',
          });
        }
      }
    });
  };

  const pokemonListFilterSlice = pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex);

  return (
    <Fragment>
      <div className="container mt-2">
        <h1 id="main" className="text-center">
          Pokémon Info Search
        </h1>
        <InputMuiSearch
          id="input-search-pokemon"
          isNoWrap
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder="Enter Name or ID"
          onKeyUp={(e) => onChangeSelect(e)}
          onFocus={() => setShowResult(true)}
          onBlur={() => setShowResult(false)}
          labelPrepend="Search"
          className="p-0"
        />
        <div
          ref={resultsContainerRef}
          className={combineClasses('result', showResult ? 'd-block' : 'd-none')}
          onScroll={listenScrollEvent.bind(this)}
        >
          {isNotEmpty(pokemonListFilterSlice) && (
            <MenuList>
              {pokemonListFilterSlice.map((value, index) => (
                <MenuItem
                  id={`pokemon-card-${value.id}`}
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
                </MenuItem>
              ))}
            </MenuList>
          )}
        </div>
        <Pokemon
          searchOption={searchOption}
          setSearchOption={setSearchOption}
          onIncId={() => modifyId(1)}
          onDecId={() => modifyId(-1)}
          isSearch
        />
      </div>
    </Fragment>
  );
};

export default Search;
