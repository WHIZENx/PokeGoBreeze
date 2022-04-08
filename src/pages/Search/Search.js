import React, { useState, useEffect, useMemo, useRef, Fragment, useCallback } from 'react';

import './Search.css';

import APIService from '../../services/API.service';
import Pokemon from '../Pokemon/Pokemon-test';

const Search = () => {

    const cardHeight = 57;
    const pageCardScroll = 10;

    const searchResult = useRef(null);
    const searchResultID = useRef(0);

    const [prev, setPrev] = useState(false);
    const [next, setNext] = useState(false);

    const pokeList = useMemo(() => {return []}, []);

    const [id, setId] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showResult, setShowResult] = useState(false);

    const [pokemonList, setPokemonList] = useState([]);
    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    useEffect(() => {
        const fetchMyAPI = async () => {
            if (pokeList.length === 0) {
                const res = await APIService.getPokeJSON('pokemon_names.json');
                Object.entries(res.data).forEach(([key, value]) => {
                    pokeList.push({id: value.id, name: value.name, sprites: APIService.getPokeSprite(value.id)});
                });
                setPokemonList(pokeList);
            }
        }
        fetchMyAPI();

        if (searchResult.current.scrollTop > (cardHeight*pageCardScroll)) searchResult.current.scrollTop = (cardHeight*pageCardScroll)-cardHeight;
        searchResultID.current = 1;
        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm));
        currentPokemonListFilter.current = results;
        setPokemonListFilter(currentPokemonListFilter.current.slice(0, 20));
    }, [searchTerm, pokemonList, pokeList, searchResult, id]);

    const listenScrollEvent = (ele) => {
        let idScroll = Math.floor((ele.currentTarget.offsetHeight + ele.currentTarget.scrollTop) / (cardHeight*pageCardScroll));
        if (idScroll <= searchResultID.current) return;
        searchResultID.current = idScroll;
        setPokemonListFilter([...pokemonListFilter, ...currentPokemonListFilter.current.slice(idScroll*pageCardScroll, idScroll*pageCardScroll+pageCardScroll)])
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
        }, 800);
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

    const handleSetPrev = useCallback((bool) => {
        if (bool) setTimeout(() => {setPrev(bool);}, 800);
        else setPrev(bool);
    }, []);

    const handleSetNext = useCallback((bool) => {
        if (bool) setTimeout(() => {setNext(bool);}, 800);
        else setNext(bool);
    }, []);

    return (
        <Fragment>
            <div className='group-prev-next'>
                { id  > 1 && prev &&
                <div className='btn-prev'>
                    <span className="carousel-control-prev-icon previous" onClick={decId}></span>
                </div>
                }
                { id  < pokeList.length && next &&
                    <div className='btn-next'>
                        <span className="carousel-control-next-icon next" onClick={incId}></span>
                    </div>
                }
            </div>
        <div className="container element-top">
            <h1 id ="main" className='center'>Pokémon Info Search</h1>
            <div className="input-group mb-12 element-top">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Search</span>
                </div>
                <input type="text" className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="Enter name or ID"
                value={searchTerm} onInput={e => setSearchTerm(e.target.value)} onFocus={() => setShowResult(true)} onBlur={() => setShowResult(false)}></input>
            </div>
            <div className="result" style={showResult ? {display: 'block'} : {display: 'none'}}>
                <ul ref={searchResult}
                    onScroll={listenScrollEvent.bind(this)}
                    style={pokemonListFilter.length < pageCardScroll ? {height: pokemonListFilter.length*cardHeight, overflowY: 'hidden'} : {height: cardHeight*pageCardScroll, overflowY: 'scroll'}}>
                    {pokemonListFilter.map((value, index) => (
                        <li style={{height: cardHeight}} className="container card-pokemon" key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                            <b>#{value.id}</b>
                            <img width={36} height={36} className='img-search' alt='img-pokemon' src={value.sprites}></img>
                            {value.name}
                        </li>
                    ))}
                </ul>
            </div>
            <Pokemon id={id} onSetIDPoke={setIDPoke} onSetPrev={handleSetPrev} onSetNext={handleSetNext}/>
        </div>
        </Fragment>
    );
}

export default Search;