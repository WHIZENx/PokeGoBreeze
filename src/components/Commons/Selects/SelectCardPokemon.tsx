import React, { useEffect, useRef, useState } from 'react';
import { combineClasses, isInclude, isNotEmpty, isUndefined, toNumber } from '../../../utils/extension';
import { ISelectCardPokemonComponent } from '../models/component.model';
import InputMuiSearch from '../Inputs/InputMuiSearch';
import { MenuList, MenuItem } from '@mui/material';
import { SelectPosition } from './enums/select-type.enum';
import { debounce } from 'lodash';
import { IncludeMode } from '../../../utils/enums/string.enum';
import { splitAndCapitalize } from '../../../utils/utils';
import apiService from '../../../services/api.service';

const SelectCardPokemon = <T,>(props: ISelectCardPokemonComponent<T>) => {
  const [showPokemon, setShowPokemon] = useState(props.isShowPokemon);
  const [search, setSearch] = useState(props.value);
  const [startIndex, setStartIndex] = useState(0);

  const [pokemonIcon, setPokemonIcon] = useState(props.sprite);

  const prependRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const pokemonListFilterSlice = pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex);

  useEffect(() => {
    if (isNotEmpty(props.pokemonList)) {
      const debounced = debounce(() => {
        const results = props.pokemonList.filter((item) => {
          if (props.onFilter) {
            const { name, id } = props.onFilter(item);
            return (
              isInclude(
                splitAndCapitalize(name?.replaceAll('_', '-'), '-', ' '),
                search,
                IncludeMode.IncludeIgnoreCaseSensitive
              ) || isInclude(id, search)
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
  }, [props.pokemonList, search]);

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
      onKeyUp={(e) => props.onChangeSelect?.(e)}
      onFocus={() => setShowPokemon(true)}
      onBlur={() => setShowPokemon(false)}
      labelPrepend={props.label}
      disabled={props.isDisable}
      customPrepend={
        pokemonIcon && (
          <img
            className={combineClasses('tw-object-contain', props.isDisable ? 'filter-gray' : '')}
            width={40}
            height={40}
            alt="Pokémon Image"
            src={pokemonIcon}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = apiService.getPokeIconSprite();
            }}
          />
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
      className="!tw-p-0"
    />
  );

  const renderResult = (position = SelectPosition.Down) => (showPokemon && !props.isDisable &&
    <div
      ref={resultsContainerRef}
      className={combineClasses(
        'result',
        position === SelectPosition.Up ? 'pos-up tw-mb-1' : 'tw-mt-1',
      )}
      onScroll={listenScrollEvent.bind(this)}
      style={{
        maxHeight: props.maxHeight ?? 274,
        left: prependRef.current?.clientWidth,
        width: props.isFit ? textRef.current?.clientWidth : 'auto',
      }}
    >
      {isNotEmpty(pokemonListFilterSlice) && (
        <MenuList>
          {pokemonListFilterSlice.map((value, index) => (
            <MenuItem
              key={index}
              selected={props.onIsSelectedPokemon?.(value)}
              onMouseDown={() => {
                if (props.onSetPokemon) {
                  props.onSetPokemon(value);
                }
                if (props.onSelect) {
                  setSearch(props.onSelect(value));
                }
                if (props.isShowPokemonIcon && props.onSprite) {
                  setPokemonIcon(apiService.getPokeIconSprite(props.onSprite(value)));
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
