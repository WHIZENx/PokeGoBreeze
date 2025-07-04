import React, { Fragment, useEffect, useRef, useState } from 'react';
import APIService from '../../services/API.service';
import FormSelect from './FormSelect';

import { useSelector } from 'react-redux';
import { getPokemonById, mappingPokemonName } from '../../utils/utils';
import { SearchingState, StatsState, StoreState } from '../../store/models/state.model';
import { IPokemonSearching } from '../../core/models/pokemon-searching.model';

import { IFindComponent } from '../models/component.model';
import { TypeAction } from '../../enums/type.enum';
import { combineClasses, getValueOrDefault, isInclude, isNotEmpty, toNumber } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import LoadGroup from '../Sprites/Loading/LoadingGroup';
import { debounce } from 'lodash';

const Find = (props: IFindComponent) => {
  const [startIndex, setStartIndex] = useState(0);
  const firstInit = useRef(20);
  const eachCounter = useRef(10);
  const cardHeight = useRef(65);

  const stats = useSelector((state: StatsState) => state.stats);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);
  const pokemonData = useSelector((state: StoreState) => state.store.data.pokemons);

  const [id, setId] = useState(
    searching
      ? props.isObjective
        ? toNumber(searching?.object?.pokemon?.id, 1)
        : toNumber(searching.current?.pokemon?.id, 1)
      : 1
  );

  const [pokemonList, setPokemonList] = useState<IPokemonSearching[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<IPokemonSearching[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNotEmpty(pokemonData)) {
      const result = mappingPokemonName(pokemonData);
      setPokemonList(result);
    }
  }, [pokemonData]);

  useEffect(() => {
    if (isNotEmpty(pokemonList)) {
      const debouncedSearch = debounce(() => {
        const results = pokemonList.filter(
          (item) =>
            isInclude(item.name, searchTerm, IncludeMode.IncludeIgnoreCaseSensitive) || isInclude(item.id, searchTerm)
        );
        setPokemonListFilter(results);
      });
      debouncedSearch();
      return () => {
        debouncedSearch.cancel();
      };
    }
  }, [pokemonList, searchTerm]);

  const listenScrollEvent = (ele: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: IPokemonSearching) => {
    const currentPokemon = getPokemonById(pokemonData, value.id);
    setId(value.id);
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
    const currentPokemon = getPokemonById(pokemonData, id);
    if (currentPokemon) {
      const current = getPokemonById(pokemonData, currentPokemon.id + modify);
      if (current) {
        setId(current.id);
        if (props.setId) {
          props.setId(current.id);
        }
        if (props.setName) {
          props.setName(current.name);
        }
        ensurePokemonVisibility(current.id);
      }
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
      if (resultRef.current) {
        const selectedElement = resultRef.current.querySelector('.card-pokemon.selected');
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 50);
  };

  const searchPokemon = () => (
    <div
      className="col d-flex justify-content-center"
      style={{
        height:
          Math.min(
            eachCounter.current,
            pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).length + 1
          ) * cardHeight.current,
        maxHeight: eachCounter.current * cardHeight.current,
      }}
    >
      <div className="btn-group-search">
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter Name or ID"
          defaultValue={searchTerm}
          onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </div>
      <div className="result tools" ref={resultRef} onScroll={listenScrollEvent.bind(this)}>
        <Fragment>
          {pokemonListFilter.slice(0, firstInit.current + eachCounter.current * startIndex).map((value, index) => (
            <div
              className={combineClasses('container card-pokemon', value.id === id ? 'selected' : '')}
              key={index}
              onMouseDown={() => getInfoPoke(value)}
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
                  e.currentTarget.src = APIService.getPokeIconSprite();
                }}
              />
              {value.name}
            </div>
          ))}
        </Fragment>
      </div>
    </div>
  );

  const showPokemon = () => (
    <div className="col d-flex justify-content-center text-center">
      <div>
        {isNotEmpty(pokemonList) && (
          <FormSelect
            searching={searching}
            isHide={props.isHide}
            isRaid={props.isRaid}
            setRaid={props.setRaid}
            tier={props.tier}
            setTier={props.setTier}
            setForm={props.setForm}
            id={id}
            setName={props.setName}
            name={pokemonList.find((item) => item.id === id)?.name}
            pokemonData={pokemonData}
            stats={stats}
            onHandleSetStats={handleSetStats}
            onClearStats={props.clearStats}
            onSetPrev={() => modifyId(-1)}
            onSetNext={() => modifyId(1)}
            isObjective={props.isObjective}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="container mt-2">
      <h1 id="main" className="text-center mb-3">
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
        <div className="ph-item d-flex justify-content-center w-100">
          <div
            className="ph-picture d-flex align-item-center justify-content-center position-relative w-50 theme-spinner-bg"
            style={{ height: 600 }}
          >
            <LoadGroup isShow isVertical isHideAttr size={40} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Find;
