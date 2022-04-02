import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSnackbar } from 'notistack';

import './Search.css';

import APIService from '../../components/API.service'

const Search = () => {

    const initialize = useRef(null);
    const pokeList = useMemo(() => {return []}, []);

    const [type_effective, setType_effective] = useState('');

    const [data, setData] = useState(null);
    
    const [searchTerm, setsearchTerm] = useState('');
    const [release, setRelease] = useState(true);
    const [showResult, setShowResult] = useState(true);

    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

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
        Object.entries(initialize.current.type_effective).forEach(([key, value]) => {
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
        setType_effective(data);
    }, []);

    useEffect(() => {
        const fetchMyAPI = async () => {
            if(!initialize.current) {
                const poke_default = await APIService.getPokeInfo('1');
                setData(poke_default.data);

                initialize.current = {};

                const released_poke = await APIService.getPokeJSON('released_pokemon.json');
                initialize.current.release = released_poke.data;

                const type_effective = await APIService.getPokeJSON('type_effectiveness.json');
                initialize.current.type_effective = type_effective.data;

                getTypeEffective(poke_default.data.types);
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

        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm)).slice(0, 10);
        setPokemonListFilter(results);

    }, [searchTerm, getTypeEffective, pokemonList, pokeList]);

    const getInfoPoke = (value) => {
        let id = value.currentTarget.dataset.id;
        setShowResult(false);

        APIService.getPokeInfo(id)
        .then(res => {
            setData(res.data);
            getReleasePoke(res.data.id);
            getTypeEffective(res.data.types);
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
            {searchTerm !== '' && showResult &&
                <div className="result">
                    <ul>
                        {pokemonListFilter.map((value, index) => (
                            <li className="container card-pokemon" key={ index } onMouseDown={getInfoPoke.bind(this)} data-id={value.id}>
                                <b>#{value.id}</b>
                                <img className='img-search' alt='img-pokemon' src={value.sprites}></img>
                                {capitalize(value.name)}
                            </li>
                        ))}
                    </ul>
                </div>
            }
            {type_effective !== '' && typeof data === 'object' &&
                <div className='element-top'>
                    {!release && <h5 className='element-top text-danger'>* This pokémon not release in Pokémon GO</h5>}
                    <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
                    <h4>Pokémon Name: <b>{capitalize(data.name)}</b></h4>
                    <div className='img-form-group'>
                        <img width='40' height='40' alt='img-pokemon-sex' src={APIService.getGenderSprite('male')}></img>
                        <ul>
                            <li className='img-group'>
                                <img alt='img-pokemon' src={data.sprites.front_default}></img>
                                <span className="caption">Original form</span>
                            </li>
                            <li className='img-group'>
                                <img alt='img-pokemon' src={data.sprites.front_shiny}></img>
                                <span className="caption">Shiny form</span>
                            </li>
                        </ul>
                        <hr></hr>
                        <img width='40' height='40' alt='img-pokemon-sex' src={APIService.getGenderSprite('female')}></img>
                        <ul>
                            <li className='img-group'>
                                {data.sprites.front_female ? <img alt='img-pokemon' src={data.sprites.front_female}></img> : <img alt='img-pokemon' src={data.sprites.front_default}></img>}
                                <span className="caption">Original form</span>
                            </li>
                            <li className='img-group'>
                                {data.sprites.front_shiny_female ? <img alt='img-pokemon' src={data.sprites.front_shiny_female}></img> : <img alt='img-pokemon' src={data.sprites.front_shiny}></img>}
                                <span className="caption">Shiny form</span>
                            </li>
                        </ul>
                    </div>
                    <h4 className='element-top'>Infomation</h4>
                    <h5 className='element-top'>- Pokémon Type:</h5>
                    <ul className='element-top'>
                        {data.types.map((value, index) => (
                            <li key={ index } className='img-group'>
                                <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value.type.name)}></img>
                                <span className='caption text-black'>{capitalize(value.type.name)}</span>
                            </li>
                        ))
                        }
                    </ul>
                    <h5 className='element-top'>- Pokémon Type Effective:</h5>
                    <h6 className='element-top'><b>Weakness</b></h6>
                    {type_effective.very_weak.length !== 0 &&
                        <ul className='element-top'>
                            <p>2.56x damage from</p>
                            {type_effective.very_weak.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    <ul className='element-top'>
                        <p>1.6x damage from</p>
                        {type_effective.weak.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                    <h6 className='element-top'><b>Resistance</b></h6>
                    {type_effective.super_resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.244x damage from</p>
                            {type_effective.super_resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    {type_effective.very_resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.391x damage from</p>
                            {type_effective.very_resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    {type_effective.resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.625x damage from</p>
                            {type_effective.resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    <h6 className='element-top'><b>Neutral</b></h6>
                    <ul className='element-top'>
                        <p>1x damage from</p>
                        {type_effective.neutral.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                    <h5 className='element-top'>- Pokémon height: {data.height}, weight: {data.weight}</h5>
                </div>
            }
        </div>
    );

}

export default Search;