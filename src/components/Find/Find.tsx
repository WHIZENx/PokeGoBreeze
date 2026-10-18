import React, { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import FormSelect from './FormSelect';

import { IPokemonSearching } from '../../core/models/pokemon-searching.model';

import { IFindComponent } from '../models/component.model';
import { TypeAction } from '../../enums/type.enum';
import { combineClasses, getValueOrDefault, isInclude, isNotEmpty, toNumber } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import LoadGroup from '../Sprites/Loading/LoadingGroup';
import { debounce } from 'lodash';
import useSearch from '../../composables/useSearch';
import usePokemon from '../../composables/usePokemon';
import InputMuiSearch from '../Commons/Inputs/InputMuiSearch';
import { Skeleton } from '@mui/material';
import PokemonTableIcon from '../Sprites/PokemonTableIcon/PokemonTableIcon';
import { isNearScrollEnd } from '../../utils/scroll';
import { toolPokemonOptionId } from './find-navigation';
import { getPokemonKeyboardIndex, getScrollTopToReveal } from '../../utils/pokemon-keyboard-navigation';

const Find = (props: IFindComponent) => {
  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);
  const cardHeight = useRef(65);

  const { searchingToolData, searchingToolCurrentData, searchingToolObjectData } = useSearch();
  const { mappingPokemonName, getPokemonById, getPokemonNavigation, getFilteredPokemons } = usePokemon();

  const [id, setId] = useState(
    searchingToolData
      ? props.isObjective
        ? toNumber(searchingToolObjectData?.pokemon?.id, 1)
        : toNumber(searchingToolCurrentData?.pokemon?.id, 1)
      : 1
  );
  const [activePokemonId, setActivePokemonId] = useState(id);
  const instanceId = useId().replace(/:/g, '');
  const listboxId = `tool-pokemon-list-${instanceId}`;

  const [pokemonList, setPokemonList] = useState<IPokemonSearching[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<IPokemonSearching[]>([]);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const result = mappingPokemonName();
    if (!props.pokemonFilter) {
      setPokemonList(result);
      return;
    }
    const eligibleIds = new Set(getFilteredPokemons(props.pokemonFilter).map((pokemon) => pokemon.num));
    setPokemonList(result.filter((pokemon) => eligibleIds.has(pokemon.id)));
  }, [getFilteredPokemons, mappingPokemonName, props.pokemonFilter]);

  useEffect(() => {
    if (!props.pokemonFilter || !isNotEmpty(pokemonList) || pokemonList.some((pokemon) => pokemon.id === id)) {
      return;
    }
    const fallbackPokemon = pokemonList[0];
    setId(fallbackPokemon.id);
    setActivePokemonId(fallbackPokemon.id);
    props.setId?.(fallbackPokemon.id);
    props.setName?.(fallbackPokemon.name);
    props.clearStats?.();
  }, [id, pokemonList, props.clearStats, props.pokemonFilter, props.setId, props.setName]);

  useEffect(() => {
    setActivePokemonId((current) => {
      if (!isNotEmpty(pokemonListFilter)) {
        return id;
      }
      if (pokemonListFilter.some((pokemon) => pokemon.id === current)) {
        return current;
      }
      return pokemonListFilter.find((pokemon) => pokemon.id === id)?.id ?? pokemonListFilter[0].id;
    });
  }, [id, pokemonListFilter]);

  useEffect(() => {
    const activeIndex = pokemonListFilter.findIndex((pokemon) => pokemon.id === activePokemonId);
    const visibleCount = firstInit.current + eachCounter.current * startIndex;
    if (activeIndex >= visibleCount) {
      setStartIndex(Math.ceil((activeIndex + 1 - firstInit.current) / eachCounter.current));
    }
  }, [activePokemonId, pokemonListFilter, startIndex]);

  const debouncedFilter = useRef(
    debounce((list: IPokemonSearching[], term: string) => {
      const results = list.filter(
        (item) => isInclude(item.name, term, IncludeMode.IncludeIgnoreCaseSensitive) || isInclude(item.id, term)
      );
      setPokemonListFilter(results);
    }, 150)
  );

  useEffect(() => {
    if (isNotEmpty(pokemonList)) {
      debouncedFilter.current(pokemonList, searchTerm);
    }
    return () => {
      debouncedFilter.current.cancel();
    };
  }, [pokemonList, searchTerm]);

  useEffect(() => {
    setStartIndex(0);
  }, [searchTerm]);

  const currentPokemonName = useMemo(() => pokemonList.find((item) => item.id === id)?.name, [pokemonList, id]);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (isNearScrollEnd(ele.currentTarget)) {
      setStartIndex((current) => {
        const visibleCount = firstInit.current + eachCounter.current * current;
        return visibleCount < pokemonListFilter.length ? current + 1 : current;
      });
    }
  };

  const getInfoPoke = (value: IPokemonSearching) => {
    const currentPokemon = getPokemonById(value.id);
    setId(value.id);
    setActivePokemonId(value.id);
    if (props.setId) {
      props.setId(value.id);
    }
    if (props.setName && currentPokemon) {
      props.setName(currentPokemon.name);
    }
    if (props.clearStats) {
      props.clearStats();
    }
  };

  const handleSetStats = (type: TypeAction, value: number) => {
    if (type === TypeAction.Atk && props.setStatATK) {
      props.setStatATK(value);
    } else if (type === TypeAction.Def && props.setStatDEF) {
      props.setStatDEF(value);
    } else if (type === TypeAction.Sta && props.setStatSTA) {
      props.setStatSTA(value);
    }
  };

  const modifyId = (modify: number) => {
    const navigation = getPokemonNavigation(id);
    const currentIndex = pokemonList.findIndex((pokemon) => pokemon.id === id);
    const filteredTarget =
      props.pokemonFilter && currentIndex >= 0
        ? pokemonList[(currentIndex + modify + pokemonList.length) % pokemonList.length]
        : undefined;
    const targetPokemon = filteredTarget ?? (modify < 0 ? navigation.prev : navigation.next);
    if (targetPokemon) {
      setId(targetPokemon.id);
      setActivePokemonId(targetPokemon.id);
      if (props.setId) {
        props.setId(targetPokemon.id);
      }
      if (props.setName) {
        props.setName(targetPokemon.name);
      }
      ensurePokemonVisibility(targetPokemon.id);
    }
    if (props.clearStats) {
      props.clearStats();
    }
  };

  const ensurePokemonVisibility = (pokemonId: number) => {
    const pokemonIndex = pokemonListFilter.findIndex((item) => item.id === pokemonId);
    if (pokemonIndex >= 0 && pokemonIndex >= firstInit.current + eachCounter.current * startIndex) {
      const newStartIndex = Math.floor(pokemonIndex / eachCounter.current);
      setStartIndex(newStartIndex);
    }

    setTimeout(() => {
      const container = resultRef.current;
      const selectedElement = container?.querySelector(
        `#${toolPokemonOptionId(instanceId, pokemonId)}`
      ) as HTMLElement | null;
      if (!container || !selectedElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      const nextScrollTop = getScrollTopToReveal(
        container.scrollTop,
        containerRect.top,
        containerRect.bottom,
        elementRect.top,
        elementRect.bottom
      );
      if (nextScrollTop !== container.scrollTop) {
        container.scrollTo({ top: nextScrollTop, behavior: 'auto' });
      }
    });
  };

  const handlePokemonKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const activePokemon = pokemonListFilter.find((pokemon) => pokemon.id === activePokemonId);
      if (activePokemon) {
        event.preventDefault();
        getInfoPoke(activePokemon);
      }
      return;
    }

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    setIsKeyboardNavigating(true);
    const currentIndex = pokemonListFilter.findIndex((pokemon) => pokemon.id === activePokemonId);
    const targetIndex = getPokemonKeyboardIndex(
      pokemonListFilter.length,
      currentIndex,
      event.key === 'ArrowDown' ? 1 : -1
    );
    const targetPokemon = pokemonListFilter[targetIndex];
    if (targetPokemon) {
      setActivePokemonId(targetPokemon.id);
      ensurePokemonVisibility(targetPokemon.id);
    }
  };

  const searchPokemon = () => (
    <div
      className="col tw-flex tw-justify-center"
      style={{
        height:
          Math.min(
            eachCounter.current,
            pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).length + 1
          ) * cardHeight.current,
        maxHeight: eachCounter.current * cardHeight.current,
      }}
    >
      <InputMuiSearch
        value={searchTerm}
        onChange={(value) => setSearchTerm(value)}
        onKeyDown={handlePokemonKeyDown}
        placeholder="Enter Name or ID"
        width={300}
        inputProps={{
          role: 'combobox',
          'aria-controls': listboxId,
          'aria-expanded': true,
          'aria-activedescendant': toolPokemonOptionId(instanceId, activePokemonId),
        }}
      />
      <div
        id={listboxId}
        role="listbox"
        className={combineClasses('result tools', isKeyboardNavigating ? 'keyboard-navigation' : '')}
        ref={resultRef}
        onScroll={listenScrollEvent.bind(this)}
        onMouseMove={() => setIsKeyboardNavigating(false)}
        onWheel={() => setIsKeyboardNavigating(false)}
      >
        <Fragment>
          {pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).map((value) => (
            <div
              className={combineClasses(
                'tw-container card-pokemon tw-flex tw-items-center',
                value.id === activePokemonId ? 'selected' : ''
              )}
              id={toolPokemonOptionId(instanceId, value.id)}
              key={value.id}
              role="option"
              aria-selected={value.id === activePokemonId}
              onMouseDown={() => {
                setIsKeyboardNavigating(false);
                getInfoPoke(value);
              }}
            >
              <b>#{value.id}</b>
              <PokemonTableIcon num={value.id} name={value.name} className="img-search" size={36} />
              {value.name}
            </div>
          ))}
        </Fragment>
      </div>
    </div>
  );

  const showPokemon = () => (
    <div className="col tw-flex tw-justify-center tw-text-center">
      <div>
        {isNotEmpty(pokemonList) && (
          <FormSelect
            isHide={props.isHide}
            isRaid={props.isRaid}
            setRaid={props.setRaid}
            tier={props.tier}
            setTier={props.setTier}
            setForm={props.setForm}
            id={id}
            setName={props.setName}
            name={currentPokemonName}
            onHandleSetStats={handleSetStats}
            onClearStats={props.clearStats}
            onSetPrev={() => modifyId(-1)}
            onSetNext={() => modifyId(1)}
            isObjective={props.isObjective}
            excludedPokemonTypes={props.excludedPokemonTypes}
            includePokemonGoBattleModifiers={props.includePokemonGoBattleModifiers}
            pokemonFilter={props.pokemonFilter}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="tw-container tw-mt-2">
      <h1 id="main" className="tw-text-center tw-mb-3">
        {getValueOrDefault(String, props.title, 'Pokémon GO Tools')}
      </h1>
      {isNotEmpty(pokemonList) ? (
        <div className="row search-container">
          {props.isSwap ? (
            <Fragment>
              {showPokemon()}
              {searchPokemon()}
            </Fragment>
          ) : (
            <Fragment>
              {searchPokemon()}
              {showPokemon()}
            </Fragment>
          )}
        </div>
      ) : (
        <div className="slide-container !tw-p-0 tw-flex tw-justify-center tw-relative !tw-w-full !tw-h-[600px]">
          <Skeleton variant="rectangular" animation="wave" className="tw-w-full !tw-h-full" />
          <LoadGroup isShow isVertical isHideAttr size={40} />
        </div>
      )}
    </div>
  );
};

export default Find;
