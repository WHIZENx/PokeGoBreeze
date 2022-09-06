import React, { useState, useEffect, useMemo, Fragment } from 'react';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import pokeListName from '../../../data/pokemon_names.json';

const Search = () => {

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;

    const pokeList: any = useMemo(() => {return []}, []);

    const [id, setId]: any = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [showResult, setShowResult] = useState(false);

    const [pokemonList, setPokemonList]: any = useState([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    useEffect(() => {
        document.title = "Pokémon - Search"
    }, []);

    useEffect(() => {
        if (pokeList.length === 0) {
            pokeList.push(...Object.values(pokeListName).filter(item => item.id > 0).map(item => { return {id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id)}}));
            setPokemonList(pokeList);
        }
        const results = pokemonList.filter((item: { name: string; id: { toString: () => string | string[]; }; }) => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        setPokemonListFilter(results);
    }, [searchTerm, pokemonList, pokeList]);

    const listenScrollEvent = (ele: { currentTarget: { scrollTop: any; offsetHeight: any; }; }) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*1.1 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const getInfoPoke = (value: any) => {
        setShowResult(false);
        setId(value.id);
    };

    const setIDPoke = (id: number) => {
        setId(id);
    }

    const decId = () => {
        setId(id-1);
    }

    const incId = () => {
        setId(id+1);
    }

    return (
        <Fragment>
        <div className="container element-top">
            <h1 id ="main" className='text-center'>Pokémon Info Search</h1>
            <div className="input-group mb-12 element-top">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Search</span>
                </div>
                <input type="text" className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="Enter Name or ID"
                value={searchTerm} onInput={(e: any) => setSearchTerm(e.target.value)} onFocus={() => setShowResult(true)} onBlur={() => setShowResult(false)}/>
            </div>
            <div className="result" style={{display: showResult ? 'block' : 'none' }} onScroll={listenScrollEvent.bind(this)}>
                <Fragment>
                    {pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).map((value: any, index) => (
                        <div className="container card-pokemon" key={ index } onMouseDown={() => getInfoPoke(value)}>
                            <b>#{value.id}</b>
                            <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}
                            onError={(e: any) => {e.onerror=null; e.target.src=APIService.getPokeSprite(0)}}/>
                            {value.name}
                        </div>
                    ))}
                </Fragment>
            </div>
            <Pokemon id={id} onSetIDPoke={setIDPoke} onIncId={incId} onDecId={decId} isSearch={true}/>
        </div>
        </Fragment>
    );
}

export default Search;