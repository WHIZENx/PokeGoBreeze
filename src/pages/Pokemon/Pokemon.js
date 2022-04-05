import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import './Pokemon.css'

import APIService from '../../services/API.service';
import Stats from '../../components/Info/Stats/Stats';
import { sortStatsPoke } from '../../components/Calculate/Calculate';
import FormGroup from '../../components/Info/Gender/FormGroup';

// const Pokemon = (props) => {

//     const params = useParams();

//     const initialize = useRef(null);

//     const [formList, setFormList] = useState([]);

//     const [statATK, setStatATK] = useState(null);
//     const [statDEF, setStatDEF] = useState(null);
//     const [statSTA, setStatSTA] = useState(null);

//     const [weatherEffective, setWeatherEffective] = useState(null);
//     const [typeEffective, setTypeEffective] = useState(null);

//     const [data, setData] = useState(null);
//     const [release, setRelease] = useState(true);

//     const [pokemonRaito, setPokemonRaito] = useState(null);

//     const { enqueueSnackbar } = useSnackbar();

    // const getTypeEffective = useCallback((types) => {
    //     let data = {
    //         very_weak: [],
    //         weak: [],
    //         super_resist: [],
    //         very_resist: [],
    //         resist: [],
    //         neutral: []
    //     };
    //     Object.entries(initialize.current.typeEffective).forEach(([key, value]) => {
    //         let value_effective = 1;
    //         types.forEach((type) => {
    //             value_effective *= value[splitAndCapitalize(type.type.name)];
    //         });
    //         if (value_effective >= 2.56) data.very_weak.push(key);
    //         else if (value_effective >= 1.6) data.weak.push(key);
    //         else if (value_effective >= 1) data.neutral.push(key);
    //         else if (value_effective >= 0.625) data.resist.push(key);
    //         else if (value_effective >= 0.39) data.very_resist.push(key);
    //         else data.super_resist.push(key);
    //     });
    //     setTypeEffective(data);
    // }, []);

    // const getWeatherEffective = useCallback((types) => {
    //     let data = [];
    //     Object.entries(initialize.current.weatherBoosts).forEach(([key, value]) => {
    //         types.forEach((type) => {
    //             if (value.includes(splitAndCapitalize(type.type.name)) && !data.includes(key)) data.push(key);
    //         });
    //     });
    //     setWeatherEffective(data);
    // }, []);

    // const queryPokemon = useCallback((id) => {
    //     APIService.getPokeSpicies(id)
    //     .then(res => {
    //         getReleasePoke(res.data.id);
    //         // getTypeEffective(res.data.types);
    //         // getWeatherEffective(res.data.types);
    //         // getRatioGender(res.data.id);

    //         // setStatATK(initialize.current.pokemonStats.attack.ranking.filter(item => item.id === res.data.id)[0]);
    //         // setStatDEF(initialize.current.pokemonStats.defense.ranking.filter(item => item.id === res.data.id)[0]);
    //         // setStatSTA(initialize.current.pokemonStats.stamina.ranking.filter(item => item.id === res.data.id)[0]);
    //         setData(res.data);
    //         setFormList([]);
    //         res.data.varieties.map(async (value, index) => {
    //             const poke_info = await APIService.getFetchUrl(value.pokemon.url);
    //             const poke_form = await APIService.getFetchUrl(poke_info.data.forms[0].url);
    //             setFormList(oldList => [...oldList, poke_form.data]);
    //         });
    //     })
    //     .catch(err => {
    //         enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
    //     });
    // }, [enqueueSnackbar, getTypeEffective, getWeatherEffective]);

//     useEffect(() => {
//         const fetchMyAPI = async () => {
//             if(!initialize.current) {
//                 try {
//                     const poke_default = await APIService.getPokeSpicies(params.id ? params.id.toLowerCase() : props.id);
//                     console.log(poke_default.data);

//                     // const poke_default = await APIService.getPokeInfo(params.id ? params.id.toLowerCase() : props.id);

//                     initialize.current = {};

//                     const pokemon_stats = sortStatsPoke((await APIService.getPokeJSON('pokemon_stats.json')).data);
//                     initialize.current.pokemonStats = pokemon_stats;

//                     // setStatATK(pokemon_stats.attack.ranking.filter(item => item.id === poke_default.data.id)[0]);
//                     // setStatDEF(pokemon_stats.defense.ranking.filter(item => item.id === poke_default.data.id)[0]);
//                     // setStatSTA(pokemon_stats.stamina.ranking.filter(item => item.id === poke_default.data.id)[0]);
//                     setData(poke_default.data);
    
//                     const released_poke = await APIService.getPokeJSON('released_pokemon.json');
//                     initialize.current.release = released_poke.data;
    
//                     getReleasePoke(poke_default.data.id);
    
//                     const poke_gender = await APIService.getPokeJSON('pokemon_genders.json');
//                     initialize.current.pokeGender = poke_gender.data;
    
//                     const typeEffective = await APIService.getPokeJSON('type_effectiveness.json');
//                     initialize.current.typeEffective = typeEffective.data;
    
//                     // getTypeEffective(poke_default.data.types);
    
//                     const weatherBoosts = await APIService.getPokeJSON('weather_boosts.json');
//                     initialize.current.weatherBoosts = weatherBoosts.data;
    
//                     // getWeatherEffective(poke_default.data.types);
    
//                     getRatioGender(poke_default.data.id);

                    // poke_default.data.varieties.map(async (value, index) => {
                    //     const poke_info = await APIService.getFetchUrl(value.pokemon.url);
                    //     const poke_form = await APIService.getFetchUrl(poke_info.data.forms[0].url);
                    //     setFormList(oldList => [...oldList, poke_form.data]);
                    // });
//                 } catch {
//                     enqueueSnackbar('Pokémon ID or Name: ' + params.id + ' Not found!', { variant: 'error' });
//                 }
//             }
//             const typeEffective = await APIService.getPokeJSON('type_effectiveness.json');
//             setTypeEffective(typeEffective.data);
//         }
//         fetchMyAPI();

//         if (!params.id && initialize.current) queryPokemon(props.id);
//     }, [getTypeEffective, getWeatherEffective, enqueueSnackbar, params.id, props.id, queryPokemon]);

//     const getReleasePoke = (value) => {
//         const id = initialize.current.release[value];
//         return (id !== undefined) ? setRelease(true) : setRelease(false);
//     }

    // const getRatioGender = (id) => {
    //     Object.entries(initialize.current.pokeGender).forEach(([key, value]) => {
    //         if (new Set(value.map(v => v.pokemon_id)).has(id)) {
    //             return setPokemonRaito(key);
    //         }
    //     });
    // }

    // const splitAndCapitalize = (string) => {
    //     return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    // }

//     return (
//         <Fragment>
//         {data &&
            // <Fragment>
            // <div className='row poke-container'>
            //     <div className='col element-top'>
            //         {!release && 
            //         <Fragment>
            //             <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go   
            //             <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
            //             </h5>
            //         </Fragment>
            //         }
            //         <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
            //         <h4>Pokémon Name: <b>{splitAndCapitalize(data.name)}</b></h4>
            //         {/* {initialize.current.pokemonStats &&
            //         <Stats statATK={statATK}
            //             statDEF={statDEF}
            //             statSTA={statSTA}
            //             pokemonStats={initialize.current.pokemonStats}/>
            //         } */}
            //     </div>
            //     <div className='col element-top'>
            //         test
            //     </div>
            // </div>
            // {initialize.current && typeEffective && pokemonRaito && formList.length > 0 ?
            // <div className='img-form-group'>
            //     <FormGroup pokemonRaito={pokemonRaito}
            //                formList={formList.sort((a,b) => (a.form_name > b.form_name) ? 1 : ((b.form_name > a.form_name) ? -1 : 0))}
            //                genderless={initialize.current.pokeGender.Genderless}
            //                typeEffective={typeEffective}
            //                weatherEffective={weatherEffective}/>
            // </div> :
            // <div className="spinner-border text-info" role="status">
            //     <span className="visually-hidden">Loading...</span>
            // </div>
            // }
//             <h4 className='element-top'>Infomation</h4>
//             <h5 className='element-top'>- Pokémon Type:</h5>
//             {/* <Type arr={data.types.map(ele => ele.type.name)}/>
            // <WeatherTypeEffective weatherEffective={weatherEffective}/>
            // <TypeEffective typeEffective={typeEffective}/>
//             <h5 className='element-top'>- Pokémon height: {data.height}, weight: {data.weight}</h5> */}
//             </Fragment>
//         }
//         </Fragment>
//     )

// }

// export default Pokemon;

const Pokemon = (props) => {

    const params = useParams();

    const initialize = useRef(null);
    const [pokeData, setPokeData] = useState([]);

    const [formList, setFormList] = useState([]);

    const [released, setReleased] = useState(null);
    const [typeEffective, setTypeEffective] = useState(null);
    const [weatherEffective, setWeatherEffective] = useState(null);
    const [genderList, setGenderList] = useState(null);

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
            // setPokeData(oldList => [...oldList, poke_info.data]);
            // setFormList(oldList => [...oldList, poke_form.data]);
            dataPokeList.push(poke_info.data);
            dataFromList.push(poke_form.data);
        }));
        // console.log(dataFromList.map(item => ({form: item, name: data.varieties.find(v => v.pokemon.name === item.name).pokemon.name})))
        setPokeData(dataPokeList);
        // console.log(dataFromList.map(item => ({form: item, name: data.varieties.find(v => v.pokemon.name === item.name)}))
        // .sort((a,b) => (a.form.id > b.form.id) ? 1 : ((b.form.id > a.form.id) ? -1 : 0)));
        setFormList(dataFromList.map(item => ({form: item, name: data.varieties.find(v => v.pokemon.name === item.pokemon.name).pokemon.name}))
        .sort((a,b) => (a.form.id > b.form.id) ? 1 : ((b.form.id > a.form.id) ? -1 : 0)));
    }, []);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            
            // getReleasePoke(res.data.id);
            // getTypeEffective(res.data.types);
            // getWeatherEffective(res.data.types);
            getRatioGender(res.data.id);

            // setStatATK(initialize.current.pokemonStats.attack.ranking.filter(item => item.id === res.data.id)[0]);
            // setStatDEF(initialize.current.pokemonStats.defense.ranking.filter(item => item.id === res.data.id)[0]);
            // setStatSTA(initialize.current.pokemonStats.stamina.ranking.filter(item => item.id === res.data.id)[0]);
            
            
            
            // const res = await Promise.all(res.data.varieties.map(async (value, index) => {
            //     const poke_info = await APIService.getFetchUrl(value.pokemon.url);
            //     const poke_form = await APIService.getFetchUrl(poke_info.data.forms[0].url);
            //     setFormList(oldList => [...oldList, poke_form.data]);
                
            //     if (!pokeDefaultData && poke_info.data.is_default) {
            //         setPokeDefaultData(poke_info.data)
            //         console.log(res.data)
            //     };
            // }));
            fetchMap(res.data);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
        });
    }, [enqueueSnackbar, getRatioGender, fetchMap, props.data]);

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
                <div className='row poke-container'>
                    <div className='col element-top'>
                        {/* <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go   
                        <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                        </h5> */}
                        <h4 className='element-top'>Pokémon ID: <b>#{data.id}</b></h4>
                        <h4>Pokémon Name: <b>{splitAndCapitalize(data.name)}</b></h4>
                        {/* {initialize.current.pokemonStats &&
                        <Stats statATK={statATK}
                            statDEF={statDEF}
                            statSTA={statSTA}
                            pokemonStats={initialize.current.pokemonStats}/>
                        } */}
                    </div>
                    <div className='col element-top'>
                        Deploy!
                    </div>
                </div>
                <div className='img-form-group'>
                {initialize.current && pokeData.length === data.varieties.length && formList.length === data.varieties.length ?
                        <FormGroup 
                                id_default={data.id}
                                pokeData={pokeData}
                                pokemonRaito={pokeRatio}
                                formList={formList}
                                genderless={genderList.Genderless}
                                typeEffective={typeEffective}
                                weatherEffective={weatherEffective}
                                released={released}/>
                    :
                    <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                }
                </div> 
            </Fragment>
            }
        </Fragment>
    )
}

export default Pokemon;