import React, { useState, useEffect, useCallback, useMemo, useRef, createRef, Fragment } from 'react';
import { useSnackbar } from 'notistack';

import './Search.css';

import APIService from '../../services/API.service'
import TypeEffective from '../../components/Effective/TypeEffective';
import Type from '../../components/Sprits/Type';
import Form from '../../components/Info/Gender/Form';
import Effect from '../Weather/Effect';
import WeatherTypeEffective from '../../components/Effective/WeatherTypeEffective';

const Search = () => {

    const cardHeight = 57;
    const pageCardScroll = 10;

    const searchResult = createRef();
    const searchResultID = useRef(0);

    const initialize = useRef(null);
    const pokeList = useMemo(() => {return []}, []);

    const [weatherEffective, setWeatherEffective] = useState('');
    const [typeEffective, setTypeEffective] = useState('');

    const [data, setData] = useState(null);
    
    const [searchTerm, setsearchTerm] = useState('');
    const [release, setRelease] = useState(true);
    const [showResult, setShowResult] = useState(false);

    const [pokemonList, setPokemonList] = useState([]);
    const currentPokemonListFilter = useRef([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const [pokemonRaito, setPokemonRaito] = useState(0);

    const { enqueueSnackbar } = useSnackbar();

    const getTypeEffective = useCallback((types) => {
        let data = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        };
        Object.entries(initialize.current.typeEffective).forEach(([key, value]) => {
            let value_effective = 1;
            types.forEach((type) => {
                value_effective *= value[capitalize(type.type.name)];
            });
            if (value_effective >= 2.56) data.very_weak.push(key);
            else if (value_effective >= 1.6) data.weak.push(key);
            else if (value_effective >= 1) data.neutral.push(key);
            else if (value_effective >= 0.625) data.resist.push(key);
            else if (value_effective >= 0.39) data.very_resist.push(key);
            else data.super_resist.push(key);
        });
        setTypeEffective(data);
    }, []);

    const getWeatherEffective = useCallback((types) => {
        let data = [];
        Object.entries(initialize.current.weatherBoosts).forEach(([key, value]) => {
            types.forEach((type) => {
                if (value.includes(capitalize(type.type.name)) && !data.includes(key)) data.push(key);
            });
        });
        setWeatherEffective(data);
    }, []);

    useEffect(() => {
        const fetchMyAPI = async () => {
            if(!initialize.current) {
                const poke_default = await APIService.getPokeInfo(1);
                setData(poke_default.data);

                initialize.current = {};

                const released_poke = await APIService.getPokeJSON('released_pokemon.json');
                initialize.current.release = released_poke.data;

                const poke_gender = await APIService.getPokeJSON('pokemon_genders.json');
                initialize.current.pokeGender = poke_gender.data;

                const typeEffective = await APIService.getPokeJSON('type_effectiveness.json');
                initialize.current.typeEffective = typeEffective.data;

                getTypeEffective(poke_default.data.types);

                const weatherBoosts = await APIService.getPokeJSON('weather_boosts.json');
                initialize.current.weatherBoosts = weatherBoosts.data;

                getWeatherEffective(poke_default.data.types)

                getRatioGender(poke_default.data.id);
            }

            if (pokeList.length === 0) {
                const res = await APIService.getPokeJSON('pokemon_names.json');
                Object.entries(res.data).forEach(([key, value]) => {
                    pokeList.push({id: value.id, name: value.name.toLowerCase(), sprites: APIService.getPokeSprite(value.id)});
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
    }, [searchTerm, getTypeEffective, getWeatherEffective, pokemonList, pokeList, currentPokemonListFilter]);

    const listenScrollEvent = (ele) => {
        let idScroll = Math.floor((ele.currentTarget.offsetHeight + ele.currentTarget.scrollTop) / (cardHeight*pageCardScroll));
        if (idScroll <= searchResultID.current) return;
        searchResultID.current = idScroll;
        setPokemonListFilter([...pokemonListFilter, ...currentPokemonListFilter.current.slice(idScroll*pageCardScroll, idScroll*pageCardScroll+pageCardScroll)])
    }

    const getInfoPoke = (value) => {
        let id = value.currentTarget.dataset.id;
        setShowResult(false);

        APIService.getPokeInfo(id)
        .then(res => {
            setData(res.data);
            getReleasePoke(res.data.id);
            getTypeEffective(res.data.types);
            getWeatherEffective(res.data.types);
            getRatioGender(res.data.id);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + value + ' Not found!', { variant: 'error' });
        });
    };

    const getReleasePoke = (value) => {
        const id = initialize.current.release[value];
        return (id !== undefined) ? setRelease(true) : setRelease(false);
    }

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const getRatioGender = (id) => {
        Object.entries(initialize.current.pokeGender).forEach(([key, value]) => {
            if (new Set(value.map(v => v.pokemon_id)).has(id)) {
                return setPokemonRaito(key);
            }
        });
    }

    return (
        <div className="container element-top">
            <h1 id ="main" className='center'>Pokémon Info Search</h1>
            <div className="input-group mb-12 element-top">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="inputGroup-sizing-default">Search</span>
                </div>
                <input type="text" className="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default" placeholder="Enter name or ID"
                value={searchTerm} onInput={e => setsearchTerm(e.target.value)} onFocus={() => setShowResult(true)} onBlur={() => setShowResult(false)}></input>
            </div>
            <div className="result" style={showResult ? {display: 'block'} : {display: 'none'}}>
                <ul ref={searchResult}
                    onScroll={listenScrollEvent.bind(this)}
                    style={pokemonListFilter.length < pageCardScroll ? {height: pokemonListFilter.length*cardHeight, overflowY: 'hidden'} : {height: cardHeight*pageCardScroll, overflowY: 'scroll'}}>
                    {pokemonListFilter.map((value, index) => (
                        <li style={{height: cardHeight}} className="container card-pokemon" key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                            <b>#{value.id}</b>
                            <img className='img-search' alt='img-pokemon' src={value.sprites}></img>
                            {capitalize(value.name)}
                        </li>
                    ))}
                </ul>
            </div>
            {data &&
                <div className='element-top'>
                    {!release && 
                    <Fragment>
                        <h5 className='element-top text-danger'>* {capitalize(data.name)} not release in Pokémon go   
                        <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                        </h5>
                    </Fragment>
                    }
                    <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
                    <h4>Pokémon Name: <b>{capitalize(data.name)}</b></h4>
                    <div className='row'>
                        {initialize.current && pokemonRaito &&
                        <div className='col img-form-group'>
                            {!(new Set(initialize.current.pokeGender.Genderless.map(value => value.pokemon_id)).has(data.id)) ?
                                <Fragment>
                                    {pokemonRaito.charAt(0) !== '0' && <Fragment><Form ratio={pokemonRaito} sex='Male' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/></Fragment>}
                                    {pokemonRaito.charAt(0) !== '0' && pokemonRaito.charAt(3) !== '0' && <hr></hr>}
                                    {pokemonRaito.charAt(3) !== '0' && <Fragment><Form ratio={pokemonRaito} sex='Female' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/></Fragment>}
                                </Fragment>
                            : <Form sex='Genderless' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/>
                            }
                        </div>
                        }
                        {initialize.current &&
                        <div className='col img-form-group'>
                            {/* {!(new Set(initialize.current.pokeGender.Genderless.map(value => value.pokemon_id)).has(data.id)) ?
                                <Fragment>
                                    <Form ratio={pokemonRaito} sex='Male' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/>
                                    <hr></hr>
                                    <Form ratio={pokemonRaito} sex='Female' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/>
                                </Fragment>
                            : <Form sex='Genderless' default_m={data.sprites.front_default} shiny_m={data.sprites.front_shiny} default_f={data.sprites.front_female} shiny_f={data.sprites.front_shiny_female}/>
                            } */}
                        </div>
                        }
                    </div>
                    <h4 className='element-top'>Infomation</h4>
                    <h5 className='element-top'>- Pokémon Type:</h5>
                    <Type arr={data.types.map(ele => ele.type.name)}/>
                    <WeatherTypeEffective weatherEffective={weatherEffective}/>
                    <TypeEffective typeEffective={typeEffective}/>
                    <h5 className='element-top'>- Pokémon height: {data.height}, weight: {data.weight}</h5>
                </div>
            }
        </div>
    );
}

export default Search;