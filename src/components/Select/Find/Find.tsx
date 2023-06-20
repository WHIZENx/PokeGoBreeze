import React, { Fragment, useEffect, useRef, useState } from 'react';
import APIService from '../../../services/API.service';
import Form from './Form';

import { useSelector } from 'react-redux';
import { getPokemonById, getPokemonByIndex } from '../../../util/Utils';
import { RouterState, SearchingState, StatsState, StoreState } from '../../../store/models/state.model';
import { PokemonModel } from '../../../core/models/pokemon.model';

const Find = (props: {
  // eslint-disable-next-line no-unused-vars
  setId?: (arg0: number) => void;
  // eslint-disable-next-line no-unused-vars
  setName?: (arg0: any) => void;
  clearStats?: any;
  // eslint-disable-next-line no-unused-vars
  setStatATK?: (arg0: any) => void;
  // eslint-disable-next-line no-unused-vars
  setStatDEF?: (arg0: any) => void;
  // eslint-disable-next-line no-unused-vars
  setStatSTA?: (arg0: any) => void;
  hide?: boolean;
  raid?: boolean;
  setRaid?: any;
  tier?: number;
  setTier?: any;
  setForm?: any;
  urlEvo?: { url: string | null };
  setUrlEvo?: any;
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
  const [form, setForm] = useState(null);

  const pokemonList = useRef(
    Object.values(pokemonName)
      .filter((item) => item.id > 0)
      .map((item) => {
        return { id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id) };
      })
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter]: any = useState([]);

  useEffect(() => {
    const results = pokemonList.current.filter(
      (item) => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm)
    );
    setPokemonListFilter(results);
  }, [searchTerm]);

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: number; offsetHeight: number } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: PokemonModel) => {
    const currentId = getPokemonById(Object.values(pokemonName), value.id);
    setId(value.id);
    setForm(null);
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
      const currentId = getPokemonById(Object.values(pokemonName), id);
      if (currentId) {
        const prev = getPokemonByIndex(Object.values(pokemonName), currentId.index - 1);
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
      const currentId = getPokemonById(Object.values(pokemonName), id);
      if (currentId) {
        const next = getPokemonByIndex(Object.values(pokemonName), currentId.index + 1);
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
            value={searchTerm}
            onInput={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="result tools" onScroll={listenScrollEvent.bind(this)}>
          <Fragment>
            {pokemonListFilter.slice(0, firstInit + eachCounter * startIndex).map((value: any, index: React.Key) => (
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
                  onError={(e: any) => {
                    e.onerror = null;
                    APIService.getFetchUrl(e.target.currentSrc)
                      .then(() => {
                        e.target.src = APIService.getPokeSprite(0);
                      })
                      .catch(() => {
                        e.target.src = APIService.getPokeIconSprite('unknown-pokemon');
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
          {pokemonList.current?.length > 0 && (
            <Fragment>
              <Form
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
                name={pokemonList.current.find((item) => item.id === id)?.name ?? ''}
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
            </Fragment>
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
    </div>
  );
};

export default Find;
