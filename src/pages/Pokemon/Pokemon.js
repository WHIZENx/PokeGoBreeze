import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import APIService from "../../services/API.service";

import './Pokemon.css';

import { calBaseATK, calBaseDEF, calBaseSTA, sortStatsPokemon } from '../../components/Calculate/Calculate';
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import FormGroup from "../../components/Info/Gender/FormGroup";

const Pokemon = (props) => {

    const params = useParams();

    const initialize = useRef(false);

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [dataPri, setDataPri] = useState(null);

    const [released, setReleased] = useState(null);
    const [typeEffective, setTypeEffective] = useState(null);
    const [weatherEffective, setWeatherEffective] = useState(null);
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [pokeRatio, setPokeRatio] = useState(null);

    const [version, setVersion] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const convertArrStats = (data) => {
        return Object.entries(data).map(([key, value]) => {
            return {id: value.num, name: value.slug, base_stats: value.baseStats, 
            baseStatsPokeGo: {attack: calBaseATK(value.baseStats), defense: calBaseDEF(value.baseStats), stamina: calBaseSTA(value.baseStats)}}
        })
    };

    const getRatioGender = useCallback((data, id) => { 
        let genderRatio;
        Object.entries(data).forEach(([key, value]) => {
            if (id === value.num) {
                genderRatio = value.genderRatio;
                return;
            };
        });
        return genderRatio;
    }, []);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string) => {
        return string.split("-").map(text => capitalize(text)).join(" ");
    }, []);

    const fetchMap = useCallback(async (data) => {
        setFormList([]);
        setPokeData([]);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = await APIService.getFetchUrl(value.pokemon.url);
            // const poke_form = await APIService.getFetchUrl(poke_info.data.forms[0].url);
            const poke_form = await Promise.all(poke_info.data.forms.map(async (item) => (await APIService.getFetchUrl(item.url)).data));
            dataPokeList.push(poke_info.data);
            dataFromList.push(poke_form);
        }));
        setPokeData(dataPokeList);
        dataFromList = dataFromList.map(item => {
            return item.map(item => ({form: item, name: data.varieties.find(v => item.pokemon.name.includes(v.pokemon.name)).pokemon.name, default_name: data.name}))
            .sort((a,b) => (a.form.id > b.form.id) ? 1 : ((b.form.id > a.form.id) ? -1 : 0));
        }).sort((a,b) => (a[0].form.id > b[0].form.id) ? 1 : ((b[0].form.id > a[0].form.id) ? -1 : 0));
        setFormList(dataFromList);
        const defaultFrom = dataFromList.map(item => item.find(item => item.form.is_default));
        const isDefaultForm = defaultFrom.find(item => item.form.id === data.id);
        if (isDefaultForm) setVersion(splitAndCapitalize(isDefaultForm.form.version_group.name));
        else setVersion(splitAndCapitalize(defaultFrom[0].form.version_group.name));
    }, [splitAndCapitalize]);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            setPokeRatio(getRatioGender(dataPri, res.data.id));
            fetchMap(res.data);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
        });
    }, [enqueueSnackbar, getRatioGender, fetchMap, dataPri]);

    useEffect(() => {

        if (!initialize.current) {
            APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')
            .then(res => {
                setStats(sortStatsPokemon(convertArrStats(res.data)));
                setDataPri(res.data);
                return APIService.getPokeJSON('released_pokemon.json');
            })
            .then(res => {
                setReleased(res.data);
                return APIService.getPokeJSON('type_effectiveness.json');
            })
            .then(res => {
                setTypeEffective(res.data);
                return APIService.getPokeJSON('weather_boosts.json');
            })
            .then(res => {
                setWeatherEffective(res.data);
            })
            .finally(initialize.current = true);
        } else {
            const id = params.id ? params.id.toLowerCase() : props.id;
            queryPokemon(id);
        }
    }, [params.id, props.id, queryPokemon]);

    const getNumGen = (url) => {
        return "Gen " + url.split("/")[6]
    }

    const setVersionName = (version) => {
        setVersion(splitAndCapitalize(version));
    }

    return (
        <Fragment>
            {data && released &&
                <Fragment>
                    {/* <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go   
                            <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                            </h5> */}
                <div className='poke-container'>
                    <div className="row group-desc">
                        <div className="col-2 img-desc">
                            <img height={200} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id)}></img>
                        </div>
                        <div className="col text-desc">
                            <h4 className='element-top'>ID: <b>#{data.id}</b></h4>
                            <h4>Name: <b>{splitAndCapitalize(data.name)}</b></h4>
                            <h4>Generation: <b>{data.generation.name.split("-")[1].toUpperCase()}</b> <span className="text-gen">({getNumGen(data.generation.url)})</span></h4>
                            <h4>Version: {version}<b></b></h4>
                        </div>
                    </div>
                    <div className='img-form-group'>
                    {initialize.current && pokeData.length === data.varieties.length && formList.length === data.varieties.length ?
                            <Fragment>
                                <FormGroup
                                    onSetPrev={props.onSetPrev}
                                    onSetNext={props.onSetNext}
                                    setVersion={setVersionName}
                                    id_default={data.id}
                                    pokeData={pokeData}
                                    pokemonRaito={pokeRatio}
                                    formList={formList}
                                    ratio={pokeRatio}
                                    typeEffective={typeEffective}
                                    weatherEffective={weatherEffective}
                                    stats={stats}
                                    species={data}
                                    onSetIDPoke={props.onSetIDPoke}/>
                            </Fragment>
                        :
                        <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    }
                    </div>
                </div>
                </Fragment>
            }
        </Fragment>
    )

}

export default Pokemon;