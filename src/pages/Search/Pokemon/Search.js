import React, { useState, useEffect, useMemo, Fragment } from 'react';

import './Search.css';

import APIService from '../../../services/API.service';
import Pokemon from '../../Pokemon/Pokemon';

import pokeListName from '../../../data/pokemon_names.json';

const Search = () => {

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;

    const [prev, setPrev] = useState(false);
    const [next, setNext] = useState(false);

    const pokeList = useMemo(() => {return []}, []);

    const [id, setId] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [showResult, setShowResult] = useState(false);

    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    useEffect(() => {
        document.title = "Pokémon - Search"
        // const fetchMyAPI = async () => {
        //     if (pokeList.length === 0) {
        //         const res = await APIService.getPokeJSON('pokemon_names.json');
        //         Object.entries(res.data).forEach(([key, value]) => {
        //             pokeList.push({id: value.id, name: value.name, sprites: APIService.getPokeSprite(value.id)});
        //         });
        //         setPokemonList(pokeList);
        //     }
        // }
        // fetchMyAPI();

        if (pokeList.length === 0) {
            pokeList.push(...Object.values(pokeListName).map(item => { return {id: item.id, name: item.name, sprites: APIService.getPokeSprite(item.id)}}));
            setPokemonList(pokeList);
        }
        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        setPokemonListFilter(results);
    }, [searchTerm, pokemonList, pokeList]);

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*1.1 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const getInfoPoke = (value) => {
        const id = parseInt(value.currentTarget.dataset.id);
        setShowResult(false);
        setPrev(false);
        setNext(false);
        setId(id);
        setTimeout(() => {
            setPrev(true);
            setNext(true);
        }, 500);
    };

    const setIDPoke = (id) => {
        setId(id);
    }

    const decId = () => {
        setPrev(false);
        setId(id-1);
    }

    const incId = () => {
        setNext(false);
        setId(id+1);
    }

    const handleSetPrev = (bool) => {
        if (bool) setTimeout(() => {setPrev(bool)}, 500);
        else setPrev(bool);
    }

    const handleSetNext = (bool) => {
        if (bool) setTimeout(() => {setNext(bool)}, 500);
        else setNext(bool);
    }

    return (
        <Fragment>
        <div className="container element-top">
            <h1 id ="main" className='center'>Pokémon Info Search</h1>
            <div className="input-group mb-12 element-top">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Search</span>
                </div>
                <input type="text" className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="Enter name or ID"
                value={searchTerm} onInput={e => setSearchTerm(e.target.value)} onFocus={() => setShowResult(true)} onBlur={() => setShowResult(false)}></input>
            </div>
            <div className="result" style={{display: showResult ? 'block' : 'none' }} onScroll={listenScrollEvent.bind(this)}>
                <Fragment>
                    {pokemonListFilter.slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                        <div className="container card-pokemon" key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                            <b>#{value.id}</b>
                            <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}></img>
                            {value.name}
                        </div>
                    ))}
                </Fragment>
            </div>
            <Pokemon id={id} onSetIDPoke={setIDPoke} prev={prev} next={next} onIncId={incId} onDecId={decId} onSetPrev={handleSetPrev} onSetNext={handleSetNext} isSearch={true}/>
        </div>
        </Fragment>
    );
}

export default Search;