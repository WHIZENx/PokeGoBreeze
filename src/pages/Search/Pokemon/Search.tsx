import React, { useState, useEffect, Fragment, useRef } from 'react';

import '../../Tools/CalculateStats/CalculateStats.scss';

import APIService from '../../../services/api.service';
import Pokemon from '../../Pokemon/Pokemon';

import { useSelector } from 'react-redux';
import { Action } from 'history';
import { SearchingState } from '../../../store/models/state.model';
import { IPokemonSearching } from '../../../core/models/pokemon-searching.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { PokemonType } from '../../../enums/type.enum';
import { combineClasses, isEqual, isInclude, isNotEmpty, toNumber } from '../../../utils/extension';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { SearchOption } from './models/pokemon-search.model';
import { debounce } from 'lodash';
import { keyDown, keyEnter, keyUp } from '../../../utils/helpers/options-context.helpers';
import useDataStore from '../../../composables/useDataStore';
import useRouter from '../../../composables/useRouter';
import usePokemon from '../../../composables/usePokemon';

const Search = () => {
  useTitle({
    title: 'PokéGO Breeze - Pokémon Search',
    description:
      'Search and filter Pokémon in Pokémon GO by type, stats, moves, and more. Find the best Pokémon for your battle teams.',
    keywords: ['Pokémon search', 'find Pokémon', 'Pokémon filter', 'Pokémon GO search', 'Pokémon database'],
  });
  const { routerAction } = useRouter();
  const { getPokemonById, mappingPokemonName } = usePokemon();
  const searching = useSelector((state: SearchingState) => state.searching.mainSearching);
  const { pokemonsData } = useDataStore();

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);

  const [searchOption, setSearchOption] = useState<SearchOption>({
    id: routerAction === Action.Pop && searching ? toNumber(searching.pokemon?.id, 1) : 1,
    form: routerAction === Action.Pop && searching ? searching.form?.form?.formName : '',
    pokemonType: PokemonType.Normal,
  });
  const [selectId, setSelectId] = useState(
    routerAction === Action.Pop && searching ? toNumber(searching.pokemon?.id, 1) : 1
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [pokemonList, setPokemonList] = useState<IPokemonSearching[]>([]);
  const [pokemonListFilter, setPokemonListFilter] = useState<IPokemonSearching[]>([]);

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNotEmpty(pokemonsData)) {
      const result = mappingPokemonName();
      setPokemonList(result);
    }
  }, [pokemonsData]);

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

  const modifyId = (modify: number) => {
    const currentPokemon = getPokemonById(selectId + modify);
    if (currentPokemon) {
      setSelectId(selectId + modify);
      setSearchOption({ id: toNumber(currentPokemon.id) });
    }
  };

  const onChangeSelect = (event: React.KeyboardEvent<HTMLInputElement>, search: string) => {
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
      } else {
        setSearchTerm(search);
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
          ref={resultsContainerRef}
          className={combineClasses('result', showResult ? 'd-block' : 'd-none')}
          onScroll={listenScrollEvent.bind(this)}
        >
          <Fragment>
            {pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).map((value, index) => (
              <div
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
              </div>
            ))}
          </Fragment>
        </div>
        <Pokemon
          searchOption={searchOption}
          setSearchOption={setSearchOption}
          onIncId={() => modifyId(1)}
          onDecId={() => modifyId(-1)}
          isSearch
          searching={searching}
        />
      </div>
    </Fragment>
  );
};

export default Search;
