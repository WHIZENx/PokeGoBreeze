import React, { useEffect, useRef, useState } from 'react';
import './Select.scss';
import { combineClasses, isInclude, isNotEmpty, isUndefined } from '../../../utils/extension';
import { ISelectCardPokemonComponent } from '../models/component.model';
import InputMuiSearch from '../Inputs/InputMuiSearch';
import { CircularProgress, MenuList, MenuItem } from '@mui/material';
import { SelectPosition } from './enums/select-type.enum';
import { debounce } from 'lodash';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { formatPokemonDisplayName } from '../../../utils/pokemon-display-name';
import { getViewportPrefetchThreshold, isNearScrollEnd, shouldPreventScrollChaining } from '../../../utils/scroll';
import { getScrollTopToReveal } from '../../../utils/pokemon-keyboard-navigation';

const SelectCardPokemon = <T,>(props: ISelectCardPokemonComponent<T>) => {
  const [showPokemon, setShowPokemon] = useState(props.isShowPokemon);
  const [search, setSearch] = useState(props.value);
  const [startIndex, setStartIndex] = useState(0);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  const [pokemonIcon, setPokemonIcon] = useState<React.ReactNode>(props.selectedPokemonIcon);

  const prependRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);
  const internalResultsContainerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = props.resultsContainerRef ?? internalResultsContainerRef;
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const pokemonListFilterSlice = props.isRemoteSearch
    ? pokemonListFilter
    : pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex);
  const activeOption = pokemonListFilterSlice.find((pokemon) => props.onIsSelectedPokemon?.(pokemon));
  const activeDescendantId = activeOption === undefined ? undefined : props.getOptionId?.(activeOption);

  useEffect(() => {
    setPokemonIcon(props.selectedPokemonIcon);
  }, [props.selectedPokemonIcon]);

  useEffect(() => {
    setSearch(props.value);
  }, [props.value]);

  useEffect(() => {
    if (props.isRemoteSearch) {
      setPokemonListFilter(props.pokemonList);
      return;
    }
    if (isNotEmpty(props.pokemonList)) {
      const debounced = debounce(() => {
        const results = props.pokemonList.filter((item) => {
          if (props.onFilter) {
            const { name, id } = props.onFilter(item);
            return (
              isInclude(formatPokemonDisplayName(name), search, IncludeMode.IncludeIgnoreCaseSensitive) ||
              isInclude(name, search, IncludeMode.IncludeIgnoreCaseSensitive) ||
              isInclude(
                name?.replace(/[-_]/g, ' '),
                search?.replace(/[-_]/g, ' '),
                IncludeMode.IncludeIgnoreCaseSensitive
              ) ||
              isInclude(id, search)
            );
          }
          return true;
        });
        setPokemonListFilter(results);
      });
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [props.isRemoteSearch, props.pokemonList, search]);

  useEffect(() => {
    setStartIndex(0);
  }, [search]);

  useEffect(() => {
    if (!showPokemon || !activeDescendantId) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const container = resultsContainerRef.current;
      const activeElement = document.getElementById(activeDescendantId);
      if (!container || !activeElement || !container.contains(activeElement)) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      const nextScrollTop = getScrollTopToReveal(
        container.scrollTop,
        containerRect.top,
        containerRect.bottom,
        activeRect.top,
        activeRect.bottom
      );
      if (nextScrollTop !== container.scrollTop) {
        container.scrollTo({ top: nextScrollTop, behavior: 'auto' });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeDescendantId, resultsContainerRef, showPokemon]);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const prefetchThreshold = props.isRemoteSearch ? getViewportPrefetchThreshold(ele.currentTarget) : undefined;
    if (isNearScrollEnd(ele.currentTarget, prefetchThreshold)) {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }

      scrollDebounceRef.current = setTimeout(() => {
        if (props.isRemoteSearch) {
          if (props.hasMore && !props.isLoading) {
            props.onLoadMore?.();
          }
        } else {
          setStartIndex((current) => {
            const visibleCount = firstInit.current + eachCounter.current * current;
            return visibleCount < pokemonListFilter.length ? current + 1 : current;
          });
        }
      }, 100);
    }
  };

  const renderInput = () => (
    <InputMuiSearch
      inputRef={props.inputRef}
      textRef={textRef}
      prependRef={prependRef}
      isNoWrap
      value={search}
      onChange={(value) => {
        setSearch(value);
        if (props.onSetSearch) {
          props.onSetSearch(value);
        }
      }}
      placeholder={props.placeholder || 'Enter Name or ID'}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          setIsKeyboardNavigating(true);
        }
        props.onChangeSelect?.(event);
      }}
      onFocus={() => setShowPokemon(true)}
      onBlur={() => setShowPokemon(false)}
      labelPrepend={props.label}
      disabled={props.isDisable}
      customPrepend={
        pokemonIcon && (
          <span
            className={combineClasses(
              'tw-inline-flex tw-h-10 tw-w-10 tw-items-center',
              props.isDisable ? 'filter-gray' : ''
            )}
          >
            {pokemonIcon}
          </span>
        )
      }
      onRemove={() => {
        if (props.onRemove) {
          if (props.onSetSearch) {
            props.onSetSearch('');
          }
          if (props.isShowPokemonIcon) {
            setPokemonIcon('');
          }
          setSearch('');
          props.onRemove();
        }
      }}
      isShowRemove={props.isShowPokemonIcon && !!pokemonIcon}
      customIconStart={props.customIconStart}
      inputProps={{ 'aria-activedescendant': activeDescendantId }}
      className="!tw-p-0"
    />
  );

  const renderResult = (position = SelectPosition.Down) =>
    showPokemon &&
    !props.isDisable && (
      <div
        ref={resultsContainerRef}
        className={combineClasses(
          'result',
          isKeyboardNavigating ? 'keyboard-navigation' : '',
          props.isRemoteSearch ? 'tw-overscroll-contain' : '',
          position === SelectPosition.Up ? 'pos-up tw-mb-1' : 'tw-mt-1'
        )}
        onScroll={listenScrollEvent.bind(this)}
        onMouseMove={() => setIsKeyboardNavigating(false)}
        onWheel={(event) => {
          setIsKeyboardNavigating(false);
          if (!props.isRemoteSearch) {
            return;
          }
          event.stopPropagation();
          if (shouldPreventScrollChaining(event.currentTarget, event.deltaY)) {
            event.preventDefault();
          }
        }}
        style={{
          maxHeight: props.maxHeight ?? 274,
          left: prependRef.current?.clientWidth,
          width: props.isFit ? textRef.current?.clientWidth : 'auto',
        }}
        aria-busy={props.isLoading}
      >
        {props.isLoading && (
          <div className="tw-sticky tw-top-0 tw-z-10 tw-flex tw-justify-center tw-bg-black tw-bg-opacity-30 tw-py-2">
            <CircularProgress size={24} aria-label="Loading Pokémon" />
          </div>
        )}
        {isNotEmpty(pokemonListFilterSlice) && (
          <MenuList>
            {pokemonListFilterSlice.map((value, index) => (
              <MenuItem
                key={index}
                id={props.getOptionId?.(value)}
                className={props.onIsSelectedPokemon?.(value) ? 'selected' : undefined}
                disabled={props.isLoading && !props.isRemoteSearch}
                selected={props.onIsSelectedPokemon?.(value)}
                onMouseDown={() => {
                  setIsKeyboardNavigating(false);
                  const selectedLabel = props.onSelect?.(value) ?? props.onFilter?.(value).name;
                  if (props.onSetPokemon) {
                    props.onSetPokemon(value);
                  }
                  if (selectedLabel !== undefined && !props.preserveSearchOnSelect) {
                    setSearch(formatPokemonDisplayName(selectedLabel));
                  }
                  if (props.isShowPokemonIcon && props.renderSelectedPokemonIcon) {
                    setPokemonIcon(props.renderSelectedPokemonIcon(value));
                  }
                }}
                onMouseOver={() => props.onSetSelectId?.(value)}
              >
                {props.cardElement?.(value)}
              </MenuItem>
            ))}
          </MenuList>
        )}
      </div>
    );

  return (
    <div className="tw-relative">
      {isUndefined(props.position) || props.position === SelectPosition.Down ? (
        <>
          {renderInput()}
          {renderResult(props.position)}
        </>
      ) : (
        <>
          {renderResult(props.position)}
          {renderInput()}
        </>
      )}
    </div>
  );
};

export default SelectCardPokemon;
