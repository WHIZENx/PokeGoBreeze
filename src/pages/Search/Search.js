import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import data_effective from '../../type_effectiveness.json';

import './Search.css';

const Search = () => {

    var pokeList = []

    const [data, setData] = useState('');
    const [type_effective, setType_effective] = useState('');
    const [searchTerm, setsearchTerm] = useState('');
    const [release, setRelease] = useState(true);
    const [showResult, setShowResult] = useState(true);

    const [pokemonList, setPokemonList] = useState([]);
    const [pokemonListFilter, setPokemonListFilter] = useState([]);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchMyAPI = async () => {
            const res = await axios.get('https://pokeapi.co/api/v2/pokemon/1');
            setData(res.data);
            setType_effective(getTypeEffective(res.data.types));

            const res_list = await axios.get('https://pogoapi.net/api/v1/pokemon_names.json');
            Object.entries(res_list.data).forEach(([key, value]) => {
                pokeList.push({id: value.id, name: value.name.toLowerCase(), sprites: spritesCollection(value.id)});
            })
            setPokemonList(pokeList);
        }
        fetchMyAPI();

        const results = pokemonList.filter(item => item.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || item.id.toString().includes(searchTerm)).slice(0, 10);
        setPokemonListFilter(results);

    }, [searchTerm]);

    const getInfoPoke = (value) => {
        let id = value.currentTarget.dataset.id;
        setShowResult(false);

        axios.get('https://pokeapi.co/api/v2/pokemon/' + id)
        .then(res => {
            setData(res.data);
            getReleasePoke(res.data.id);
            setType_effective(getTypeEffective(res.data.types));
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + value + ' Not found!', { variant: 'error' });
        });
        
    };

    const getReleasePoke = (value) => {
        axios.get('https://pogoapi.net/api/v1/released_pokemon.json')
        .then(res => {
            const id = res.data[value];

            id !== undefined ? setRelease(true) : setRelease(false);
        })
        .catch(err => {
            enqueueSnackbar(err, { variant: 'error' });
        });
    }

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const getTypeEffective = (types) => {
        let data = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        }
        Object.entries(data_effective).forEach(([key, value]) => {
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
        return data;
    }

    const typeCollection = (type) => {
        return 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_'+type.toUpperCase()+'.png'
    }

    const spritesCollection = (id) => {
        return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+ id +'.png'
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
                    <div className='img-group'>
                        <img alt='img-pokemon' src={data.sprites.front_default}></img>
                        <span className="caption">Original form</span>
                        {data.sprites.front_shiny !== null && <div><img alt='img-pokemon' src={data.sprites.front_shiny}></img>
                        <span className="caption">Shiny form</span></div>}
                    </div>
                    <h4 className='element-top'>Infomation</h4>
                    <h5 className='element-top'>- Pokémon Type:</h5>
                    <ul className='element-top'>
                        {data.types.map((value, index) => (
                            <li key={ index } className='img-group'>
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value.type.name)}></img>
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
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
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