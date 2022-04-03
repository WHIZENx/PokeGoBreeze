import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import './Pokemon.css'

import APIService from '../../services/API.service';
import Form from '../../components/Info/Gender/Form';
import Type from '../../components/Sprits/Type';
import WeatherTypeEffective from '../../components/Effective/WeatherTypeEffective';
import TypeEffective from '../../components/Effective/TypeEffective';
import Stats from '../../components/Info/Stats/Stats';

const Pokemon = (props) => {

    const params = useParams();

    const initialize = useRef(null);

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const [weatherEffective, setWeatherEffective] = useState(null);
    const [typeEffective, setTypeEffective] = useState(null);

    const [data, setData] = useState(null);
    const [release, setRelease] = useState(true);

    const [pokemonRaito, setPokemonRaito] = useState(null);

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
                value_effective *= value[splitAndCapitalize(type.type.name)];
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
                if (value.includes(splitAndCapitalize(type.type.name)) && !data.includes(key)) data.push(key);
            });
        });
        setWeatherEffective(data);
    }, []);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeInfo(id)
        .then(res => {
            getReleasePoke(res.data.id);
            getTypeEffective(res.data.types);
            getWeatherEffective(res.data.types);
            getRatioGender(res.data.id);

            setStatATK(props.stats.attack.ranking.filter(item => item.id === res.data.id)[0]);
            setStatDEF(props.stats.defense.ranking.filter(item => item.id === res.data.id)[0]);
            setStatSTA(props.stats.stamina.ranking.filter(item => item.id === res.data.id)[0]);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
        });
    }, [enqueueSnackbar, getTypeEffective, getWeatherEffective, props.stats]);

    useEffect(() => {
        const fetchMyAPI = async () => {
            if(!initialize.current) {
                try {
                    const poke_default = await APIService.getPokeInfo(params.id ? params.id.toLowerCase() : props.id);

                    setStatATK(props.stats.attack.ranking.filter(item => item.id === poke_default.data.id)[0]);
                    setStatDEF(props.stats.defense.ranking.filter(item => item.id === poke_default.data.id)[0]);
                    setStatSTA(props.stats.stamina.ranking.filter(item => item.id === poke_default.data.id)[0]);
    
                    setData(poke_default.data);

                    initialize.current = {};
    
                    const released_poke = await APIService.getPokeJSON('released_pokemon.json');
                    initialize.current.release = released_poke.data;
    
                    getReleasePoke(poke_default.data.id);
    
                    const poke_gender = await APIService.getPokeJSON('pokemon_genders.json');
                    initialize.current.pokeGender = poke_gender.data;
    
                    const typeEffective = await APIService.getPokeJSON('type_effectiveness.json');
                    initialize.current.typeEffective = typeEffective.data;
    
                    getTypeEffective(poke_default.data.types);
    
                    const weatherBoosts = await APIService.getPokeJSON('weather_boosts.json');
                    initialize.current.weatherBoosts = weatherBoosts.data;
    
                    getWeatherEffective(poke_default.data.types);
    
                    getRatioGender(poke_default.data.id);
                } catch {
                    enqueueSnackbar('Pokémon ID or Name: ' + params.id + ' Not found!', { variant: 'error' });
                }
            }
        }
        fetchMyAPI();

        if (!params.id && initialize.current) queryPokemon(props.id);
    }, [getTypeEffective, getWeatherEffective, enqueueSnackbar, params.id, props.id, props.stats, queryPokemon]);

    const getReleasePoke = (value) => {
        const id = initialize.current.release[value];
        return (id !== undefined) ? setRelease(true) : setRelease(false);
    }

    const getRatioGender = (id) => {
        Object.entries(initialize.current.pokeGender).forEach(([key, value]) => {
            if (new Set(value.map(v => v.pokemon_id)).has(id)) {
                return setPokemonRaito(key);
            }
        });
    }

    const splitAndCapitalize = (string) => {
        return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    }

    return (
        <Fragment>
        {data &&
            <Fragment>
            <div className='element-top poke-container'>
            {!release && 
            <Fragment>
                <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go   
                <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                </h5>
            </Fragment>
            }
            <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
            <h4>Pokémon Name: <b>{splitAndCapitalize(data.name)}</b></h4>
            <Stats statATK={statATK} statDEF={statDEF} statSTA={statSTA} attack_max_rank={props.stats.attack.max_rank}  defense_max_rank={props.stats.defense.max_rank}  stamina_max_rank={props.stats.stamina.max_rank}/>
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
            </Fragment>
        }
        </Fragment>
    )

}

export default Pokemon;