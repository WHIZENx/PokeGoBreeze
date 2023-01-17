import React, { useState, useEffect, useRef, Fragment } from 'react';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import pokeListName from '../../../data/pokemon_names.json';
import { useSelector, RootStateOrAny } from 'react-redux';
import { RouterState } from '../../..';

const Search = () => {
  const router = useSelector((state: RouterState) => state.router);
  const searching = useSelector((state: RootStateOrAny) => state.searching.mainSearching);

  const [startIndex, setStartIndex] = useState(0);
  const firstInit = 20;
  const eachCounter = 10;

  const [id, setId]: any = useState(router.action === 'POP' && searching ? searching.id : 1);
  const [selectId, setSelectId]: any = useState(router.action === 'POP' && searching ? searching.id : 1);

  const [searchTerm, setSearchTerm] = useState('');
  const [showResult, setShowResult] = useState(false);

  const pokemonList = useRef(
    Object.values(pokeListName)
      .filter((item: any) => item.id > 0)
      .map((item: any) => {
        return { id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id) };
      })
  );
  const [pokemonListFilter, setPokemonListFilter]: any = useState([]);

  useEffect(() => {
    document.title = 'Pokémon - Search';
  }, []);

  useEffect(() => {
    const results = pokemonList.current.filter(
      (item: any) => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm)
    );
    setPokemonListFilter(results);
  }, [searchTerm]);

  useEffect(() => {
    setSelectId(id);
  }, [id]);

  const listenScrollEvent = (ele: { currentTarget: { scrollTop: any; offsetHeight: any } }) => {
    const scrollTop = ele.currentTarget.scrollTop;
    const fullHeight = ele.currentTarget.offsetHeight;
    if (scrollTop * 1.1 >= fullHeight * (startIndex + 1)) {
      setStartIndex(startIndex + 1);
    }
  };

  const getInfoPoke = (value: any) => {
    setShowResult(false);
    setId(value.id);
  };

  const setIDPoke = (id: number) => {
    setId(id);
  };

  const decId = () => {
    setId(id - 1);
  };

  const incId = () => {
    setId(id + 1);
  };

  const onChangeSelect = (event: any) => {
    if (event.keyCode === 13) {
      setShowResult(false);
      setId(selectId);
    } else if (selectId - 1 > 0 && event.keyCode === 38) {
      setSelectId(selectId - 1);
    } else if (selectId + 1 <= 905 && event.keyCode === 40) {
      setSelectId(selectId + 1);
    }
  };

  return (
    <Fragment>
      <div className="container element-top">
        <h1 id="main" className="text-center">
          Pokémon Info Search
        </h1>
        <div className="input-group mb-12 element-top">
          <div className="input-group-prepend">
            <span className="input-group-text">Search</span>
          </div>
          <input
            type="text"
            className="form-control"
            style={{ zIndex: 1 }}
            placeholder="Enter Name or ID"
            value={searchTerm}
            onInput={(e: any) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResult(true)}
            onBlur={() => setShowResult(false)}
            onKeyUp={(e) => onChangeSelect(e)}
          />
        </div>
        <div className="result" style={{ display: showResult ? 'block' : 'none' }} onScroll={listenScrollEvent.bind(this)}>
          <Fragment>
            {pokemonListFilter.slice(0, firstInit + eachCounter * startIndex).map((value: any, index: React.Key) => (
              <div
                className={
                  'container card-pokemon' +
                  (value.id === id ? ' highlight-select-pokemon' : '') +
                  (value.id === selectId ? ' current-select-pokemon' : '')
                }
                key={index}
                onMouseDown={() => getInfoPoke(value)}
                onMouseOver={() => setSelectId(value.id)}
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
                    e.target.src = APIService.getPokeSprite(0);
                  }}
                />
                {value.name}
              </div>
            ))}
          </Fragment>
        </div>
        <Pokemon id={id} onSetIDPoke={setIDPoke} onIncId={incId} onDecId={decId} isSearch={true} router={router} searching={searching} />
      </div>
    </Fragment>
  );
};

export default Search;
