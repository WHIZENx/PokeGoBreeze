import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import './Pokemon.css'

import APIService from '../../services/API.service';
import { sortStatsPoke } from '../../components/Calculate/Calculate'

import FormGroup from '../../components/Info/Gender/FormGroup';
// import Evolution from '../../components/Info/Evolution/Evolution';

const Pokemon = (props) => {

    const params = useParams();

    const initialize = useRef(null);
    const megaStats = useRef(null);

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [released, setReleased] = useState(null);
    const [typeEffective, setTypeEffective] = useState(null);
    const [weatherEffective, setWeatherEffective] = useState(null);
    const [genderList, setGenderList] = useState(null);
    const [stats, setStats] = useState(null);

    const [data, setData] = useState(null);

    const [pokeRatio, setPokeRatio] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const getRatioGender = useCallback((id) => {
        Object.entries(genderList).forEach(([key, value]) => {
            if (new Set(value.map(v => v.pokemon_id)).has(id)) {
                return setPokeRatio(key);
            }
        });
    }, [genderList]);

    const fetchMap = useCallback(async (data) => {
        setFormList([]);
        setPokeData([]);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = await APIService.getFetchUrl(value.pokemon.url);
            const poke_form = await APIService.getFetchUrl(poke_info.data.forms[0].url);
            dataPokeList.push(poke_info.data);
            dataFromList.push(poke_form.data);
        }));
        setPokeData(dataPokeList);
        setFormList(dataFromList.map(item => ({form: item, name: data.varieties.find(v => v.pokemon.name === item.pokemon.name).pokemon.name}))
        .sort((a,b) => (a.form.id > b.form.id) ? 1 : ((b.form.id > a.form.id) ? -1 : 0)));
    }, []);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            getRatioGender(res.data.id);
            fetchMap(res.data);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
        });
    }, [enqueueSnackbar, getRatioGender, fetchMap]);

    useEffect(() => {
        if (!initialize.current) {
            APIService.getPokeJSON('released_pokemon.json')
            .then(res => {
                setReleased(res.data);
                return APIService.getPokeJSON('type_effectiveness.json')
            })
            .then(res => {
                setTypeEffective(res.data);
                return APIService.getPokeJSON('weather_boosts.json')
            })
            .then(res => {
                setWeatherEffective(res.data);
                return APIService.getPokeJSON('mega_pokemon.json')
            })
            .then(res => {
                megaStats.current = res.data;
                return APIService.getPokeJSON('pokemon_stats.json')
            })
            .then(res => {
                setStats(sortStatsPoke(res.data, megaStats.current));
                return APIService.getPokeJSON('pokemon_genders.json')
            })
            .then(res => {
                setGenderList(res.data);
            })
            .finally(initialize.current = true);
        } else {
            const id = params.id ? params.id.toLowerCase() : props.id;
            queryPokemon(id);
        }
    }, [params.id, props.id, getRatioGender, queryPokemon]);

    const splitAndCapitalize = (string) => {
        return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    }

    return (
        <Fragment>
            {data &&
            <Fragment>
            <div className='container poke-container poke-parent'>
                <div className='poke-parent'>
                    <div className='row'>
                        <div className='col-5 element-top'>
                            {/* <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go   
                            <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                            </h5> */}
                            <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
                            <h4>Pokémon Name: <b>{splitAndCapitalize(data.name)}</b></h4>
                        </div>
                        <div className='col element-top'>
                            
                        </div>
                    </div>
                </div>
                <div className='img-form-group'>
                {initialize.current && pokeData.length === data.varieties.length && formList.length === data.varieties.length ?
                        <Fragment>
                            <FormGroup
                                onSetPrev={props.onSetPrev}
                                onSetNext={props.onSetNext}
                                id_default={data.id}
                                pokeData={pokeData}
                                pokemonRaito={pokeRatio}
                                formList={formList}
                                genderless={genderList.Genderless}
                                typeEffective={typeEffective}
                                weatherEffective={weatherEffective}
                                stats={stats}
                                released={released}
                                species={data}/>
                        </Fragment>
                    :
                    <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                }
                </div>
                {/* <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={data.evolution_chain.url} id={data.id}/> */}
            </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default Pokemon;