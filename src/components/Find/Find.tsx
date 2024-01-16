import React, { Fragment, useEffect, useState } from 'react';
import APIService from '../../services/API.service';
import FormSelect from './FormSelect';

import { useSelector } from 'react-redux';
import { getPokemonById, getPokemonByIndex } from '../../util/Utils';
import { RouterState, SearchingState, StatsState, StoreState } from '../../store/models/state.model';
import { PokemonSearchingModel } from '../../core/models/pokemon-searching.model';

import loading from '../../assets/loading.png';
import { PokemonFormModify } from '../../core/models/API/form.model';

const Find = (props: {
  setId?: React.Dispatch<React.SetStateAction<number>>;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  // eslint-disable-next-line no-unused-vars
  clearStats?: (reset?: boolean) => void;
  setStatATK?: React.Dispatch<React.SetStateAction<number>>;
  setStatDEF?: React.Dispatch<React.SetStateAction<number>>;
  setStatSTA?: React.Dispatch<React.SetStateAction<number>>;
  hide?: boolean;
  raid?: boolean;
  setRaid?: React.Dispatch<React.SetStateAction<boolean>>;
  tier?: number;
  setTier?: React.Dispatch<React.SetStateAction<number>>;
  // eslint-disable-next-line no-unused-vars
  setForm?: (form: PokemonFormModify | undefined) => void;
  urlEvo?: { url: string | null };
  setUrlEvo?: React.Dispatch<
    React.SetStateAction<{
      url: string;
    }>
  >;
  title?: string;
  swap?: boolean;
  objective?: boolean;
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;
  const cardHeight = 65;

  const stats = useSelector((state: StatsState) => state.stats);
  const router = useSelector((state: RouterState) => state.router);
  const searching = useSelector((state: SearchingState) => state.searching.toolSearching);
  const pokemonData = useSelector((state: StoreState) => state.store.data?.pokemonData ?? []);
  const pokemonName = useSelector((state: StoreState) => state.store.data?.pokemonName ?? []);

  const [id, setId] = useState(
    searching ? (props.objective ? (searching ? (searching.obj ? searching.obj?.id : 1) : 1) : searching.id) : 1
  );
  const [form, setForm]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();

  const [pokemonList, setPokemonList]: [PokemonSearchingModel[], React.Dispatch<React.SetStateAction<PokemonSearchingModel[]>>] = useState(
    [] as PokemonSearchingModel[]
  );

  const [searchTerm, setSearchTerm] = useState('');
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

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: number; offsetHeight: number } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: PokemonSearchingModel) => {
    const currentId = getPokemonById(pokemonName, value.id);
    setId(value.id);
    setForm(undefined);
    if (props.setId) {
      props.setId(value.id);
    }
    if (props.setName && currentId) {
      props.setName(currentId.name);
    }
    if (props.clearStats) {
      props.clearStats();
    }
  };

  const handleSetStats = (type: string, value: number) => {
    if (type === 'atk' && props.setStatATK) {
      props.setStatATK(value);
    } else if (type === 'def' && props.setStatDEF) {
      props.setStatDEF(value);
    } else if (type === 'sta' && props.setStatSTA) {
      props.setStatSTA(value);
    }
  };

  const decId = () => {
    setTimeout(() => {
      const currentId = getPokemonById(pokemonName, id);
      if (currentId) {
        const prev = getPokemonByIndex(pokemonName, currentId.index - 1);
        if (prev) {
          setId(prev.id);
          if (props.setId) {
            props.setId(prev.id);
          }
          if (props.setName) {
            props.setName(prev.name);
          }
          if (props.clearStats) {
            props.clearStats();
          }
        }
      }
    }, 300);
    if (props.clearStats) {
      props.clearStats();
    }
  };

  const incId = () => {
    setTimeout(() => {
      const currentId = getPokemonById(pokemonName, id);
      if (currentId) {
        const next = getPokemonByIndex(pokemonName, currentId.index + 1);
        if (next) {
          setId(next.id);
          if (props.setId) {
            props.setId(next.id);
          }
          if (props.setName) {
            props.setName(next.name);
          }
          if (props.clearStats) {
            props.clearStats();
          }
        }
      }
    }, 300);
    if (props.clearStats) {
      props.clearStats();
    }
  };

  const searchPokemon = () => {
    return (
      <div
        className="col d-flex justify-content-center"
        style={{
          height: Math.min(eachCounter, pokemonListFilter.slice(0, firstInit + eachCounter * startIndex).length + 1) * cardHeight,
          maxHeight: eachCounter * cardHeight,
        }}
      >
        <div className="btn-group-search">
          <input
            type="text"
            className="form-control"
            aria-label="search"
            aria-describedby="input-search"
            placeholder="Enter Name or ID"
            defaultValue={searchTerm}
            onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </div>
        <div className="result tools" onScroll={listenScrollEvent.bind(this)}>
          <Fragment>
            {pokemonListFilter.slice(0, firstInit + eachCounter * startIndex).map((value, index) => (
              <div
                className={'container card-pokemon ' + (value.id === id ? 'selected' : '')}
                key={index}
                onMouseDown={() => getInfoPoke(value)}
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
                    APIService.getFetchUrl(e.currentTarget.currentSrc)
                      .then(() => {
                        e.currentTarget.src = APIService.getPokeSprite(0);
                      })
                      .catch(() => {
                        e.currentTarget.src = APIService.getPokeIconSprite('unknown-pokemon');
                      });
                  }}
                />
                {value.name}
              </div>
            ))}
          </Fragment>
        </div>
      </div>
    );
  };

  const showPokemon = () => {
    return (
      <div className="col d-flex justify-content-center text-center">
        <div>
          {pokemonList.length > 0 && (
            <FormSelect
              router={router}
              searching={searching}
              hide={props.hide}
              raid={props.raid}
              setRaid={props.setRaid}
              tier={props.tier}
              setTier={props.setTier}
              form={form}
              setForm={props.setForm}
              setFormOrigin={setForm}
              id={id}
              name={pokemonList.find((item) => item.id === id)?.name ?? ''}
              data={pokemonData}
              stats={stats}
              onHandleSetStats={handleSetStats}
              onClearStats={props.clearStats}
              onSetPrev={decId}
              onSetNext={incId}
              setUrlEvo={props.setUrlEvo}
              objective={props.objective}
              pokemonName={pokemonName}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container element-top">
      <h1 id="main" className="text-center" style={{ marginBottom: 15 }}>
        {props.title ? props.title : 'Pokémon GO Tools'}
      </h1>
      {pokemonList.length > 0 ? (
        <div className="row search-container">
          {props.swap ? (
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
            className="ph-picture d-flex align-item-center justify-content-center position-relative w-50"
            style={{ height: 600, backgroundColor: '#f8f8f8' }}
          >
            <div className="loading-group vertical-center">
              <img className="loading" width={40} height={40} alt="img-pokemon" src={loading} />
              <span className="caption text-black" style={{ fontSize: 18 }}>
                <b>
                  Loading<span id="p1">.</span>
                  <span id="p2">.</span>
                  <span id="p3">.</span>
                </b>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Find;
