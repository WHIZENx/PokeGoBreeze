import React, { useEffect, useRef, useState } from 'react';
import { combineClasses, isNotEmpty, isUndefined, toNumber } from '../../../utils/extension';
import { ISelectCustomPokemonComponent } from '../models/component.model';
import InputMuiSearch from '../Input/InputMuiSearch';
import { MenuList, MenuItem } from '@mui/material';
import { SelectPosition } from './enums/select-type.enum';
import { debounce } from 'lodash';

const SelectCustomPokemon = <T,>(props: ISelectCustomPokemonComponent<T>) => {
  const [showPokemon, setShowPokemon] = useState(props.isShowPokemon);
  const [search, setSearch] = useState(props.value);
  const [startIndex, setStartIndex] = useState(0);

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
            return props.onFilter(item, search);
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
      customPrepend={props.customPrepend}
      onRemove={() => {
        if (props.onRemove) {
          if (props.onSetSearch) {
            props.onSetSearch('');
          }
          setSearch('');
          props.onRemove();
        }
      }}
      isShowRemove={props.isShowRemove}
      customIconStart={props.customIconStart}
      className="p-0"
    />
  );

  const renderResult = (position = SelectPosition.Down) => (
    <div
      ref={resultsContainerRef}
      className={combineClasses(
        'result mt-1',
        position === SelectPosition.Up ? 'pos-up' : '',
        showPokemon ? 'd-block' : 'd-none'
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
    <div className="position-relative">
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

export default SelectCustomPokemon;
