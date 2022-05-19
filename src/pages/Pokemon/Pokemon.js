import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import APIService from "../../services/API.service";

import loading from '../../assets/loading.png';
import './Pokemon.css';

import { calculateStatsByTag, regionList, sortStatsPokemon } from '../../components/Calculate/Calculate';
import { Link, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import Form from "../../components/Info/Form/Form";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import pokemonData from '../../data/pokemon.json';
import evoData from '../../data/evolution_pokemon_go.json';
import pokeListName from '../../data/pokemon_names.json';
import PokemonModel from "./PokemonModel";

const Pokemon = (props) => {

    const params = useParams();

    const initialize = useRef(false);

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [dataPri, setDataPri] = useState(null);

    // const [released, setReleased] = useState(null);
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [pokeRatio, setPokeRatio] = useState(null);

    const [version, setVersion] = useState(null);
    const [region, setRegion] = useState(null);
    const [WH, setWH] = useState({weight: 0, height: 0});
    const [formName, setFormName] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const convertArrStats = (data) => {
        return Object.entries(data).map(([key, value]) => {
            let stats = calculateStatsByTag(value.baseStats, value.slug);
            return {id: value.num, name: value.slug, base_stats: value.baseStats,
            baseStatsPokeGo: {attack: stats.atk, defense: stats.def, stamina: stats.sta}}
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
        setFormName(splitAndCapitalize(data.name));
        setFormList([]);
        setPokeData([]);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = (await APIService.getFetchUrl(value.pokemon.url)).data;
            const poke_form = await Promise.all(poke_info.forms.map(async (item) => (await APIService.getFetchUrl(item.url)).data));
            dataPokeList.push(poke_info);
            dataFromList.push(poke_form);
            if (poke_info.id === data.id) setWH(prevWH => ({...prevWH, weight: poke_info.weight, height: poke_info.height}));
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
        setRegion(regionList[parseInt(data.generation.url.split("/")[6])]);
    }, [splitAndCapitalize]);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            setPokeRatio(getRatioGender(dataPri, res.data.id));
            fetchMap(res.data);
            setData(res.data);
            if (params.id) document.title =  `#${res.data.id} - ${splitAndCapitalize(res.data.name)}`;
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
            if (params.id) document.title = `#${params.id} - Not Found`
        });
    }, [enqueueSnackbar, getRatioGender, fetchMap, dataPri, params.id, splitAndCapitalize]);

    useEffect(() => {
        if (!initialize.current) {
            setStats(sortStatsPokemon(convertArrStats(pokemonData)));
            setDataPri(pokemonData);
            // APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')
            // .then(res => {
                // setStats(sortStatsPokemon(convertArrStats(res.data)));
                // setDataPri(res.data);
            //     return APIService.getPokeJSON('released_pokemon.json');
            // })
            // APIService.getPokeJSON('released_pokemon.json')
            // .then(res => {
            //     setReleased(res.data);
            // })
            // .finally(initialize.current = true);
            initialize.current = true;
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

    const getCostModifier = (id) => {
        return evoData.find(item => item.id === id)
    }

    return (
        <Fragment>
            {data &&
                <Fragment>
                    {/* <h5 className='element-top text-danger'>* {splitAndCapitalize(data.name)} not release in Pokémon go
                            <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img>
                            </h5> */}
                <div className="w-100 row prev-next-block sticky-top" style={{margin:0, height: 60}}>
                    {params.id ?
                    <Fragment>
                    {data.id > 1 && <div title="Previous Pokémon" className="prev-block col" style={{padding:0}}>
                        <Link className="d-flex justify-content-start align-items-center" to={"/pokemon/"+(parseInt(params.id)-1)}>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateBeforeIcon fontSize="large"/></b>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id-1)}></img>
                            </div>
                            <div className="w-100" style={{cursor: "pointer"}}>
                                <div style={{textAlign: "start"}}>
                                    <b>#{data.id-1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id-1].name)}
                                </div>
                            </div>
                        </Link>
                    </div>}
                    {data.id < Object.keys(pokeListName).length && <div title="Next Pokémon" className="next-block col" style={{float: "right", padding: 0}}>
                        <Link className="d-flex justify-content-end align-items-center" to={"/pokemon/"+(parseInt(params.id)+1)}>
                            <div className="w-100" style={{cursor: "pointer", textAlign: "end"}}>
                                <div style={{textAlign: "end"}}>
                                    <b>#{data.id+1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id+1].name)}
                                </div>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id+1)}></img>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateNextIcon fontSize="large"/></b>
                            </div>
                        </Link>
                    </div>}
                    </Fragment>
                    :
                    <Fragment>
                    {props.prev && props.next ?
                    <Fragment>
                    {data.id > 1 && <div title="Previous Pokémon" className="prev-block col" style={{padding:0}}>
                        <div className="d-flex justify-content-start align-items-center" onClick={() => props.onDecId()}>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateBeforeIcon fontSize="large"/></b>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id-1)}></img>
                            </div>
                            <div className="w-100" style={{cursor: "pointer"}}>
                                <div style={{textAlign: "start"}}>
                                    <b>#{data.id-1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id-1].name)}
                                </div>
                            </div>
                        </div>
                    </div>}
                    {data.id < Object.keys(pokeListName).length && <div title="Next Pokémon" className="next-block col" style={{float: "right", padding: 0}}>
                        <div className="d-flex justify-content-end align-items-center" onClick={() => props.onIncId()}>
                            <div className="w-100" style={{cursor: "pointer", textAlign: "end"}}>
                                <div style={{textAlign: "end"}}>
                                    <b>#{data.id+1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id+1].name)}
                                </div>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id+1)}></img>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateNextIcon fontSize="large"/></b>
                            </div>
                        </div>
                    </div>}
                    </Fragment>
                    :
                    <div className='loading-group'>
                        <img className="loading" width={20} height={20} alt='img-pokemon' src={loading}></img>
                        <span className='caption text-black' style={{fontSize: 14}}><b>Loading...</b></span>
                    </div>
                    }
                    </Fragment>
                    }
                </div>
                <div className={'poke-container'+(props.isSearch ? "" : " container")}>
                    <div className="w-100 center d-inline-block align-middle" style={{marginTop: 15, marginBottom: 15}}>
                        <div className="d-inline-block img-desc">
                            <img style={{verticalAlign: 'baseline'}} height={211} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id)}></img>
                        </div>
                        <div className="d-inline-block">
                            <table className="table-info table-desc">
                                <thead></thead>
                                <tbody>
                                    <tr>
                                        <td><h5>ID</h5></td>
                                        <td colSpan={2}><h5><b>#{data.id}</b></h5></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Name</h5></td>
                                        <td colSpan={2}><h5><b>{formName}</b></h5></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Generation</h5></td>
                                        <td colSpan={2}><h5><b>{data.generation.name.split("-")[1].toUpperCase()}</b> <span className="text-gen">({getNumGen(data.generation.url)})</span></h5></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Region</h5></td>
                                        <td colSpan={2}><h5>{region}</h5></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Version</h5></td>
                                        <td colSpan={2}><h5>{version}</h5></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Body</h5></td>
                                        <td colSpan={2} style={{padding:0}}>
                                            <div className="d-flex align-items-center first-extra-col h-100" style={{float: "left", width: "50%"}}>
                                                <div>
                                                    <div className="d-inline-block" style={{marginRight: 5}}><h6>Weight:</h6></div>
                                                    <div className="d-inline-block"><h6>{WH.weight/10} kg</h6></div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center h-100" style={{float: "left", width: "50%"}}>
                                                <div>
                                                    <div className="d-inline-block" style={{marginRight: 5}}><h6>Height:</h6></div>
                                                    <div className="d-inline-block"><h6>{WH.height/10} m</h6></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="d-inline-block" style={{padding:0}}>
                            <table className="table-info table-main">
                                <thead></thead>
                                <tbody>
                                    <tr className="center">
                                        <td className="table-sub-header">Unlock third move</td>
                                        <td className="table-sub-header">Costs</td>
                                    </tr>
                                    <tr className="info-costs">
                                        <td><img alt="img-cost-info" width={100} src={APIService.getItemSprite("Item_1202")}></img></td>
                                        <td style={{padding:0}}>
                                            <div className="row-extra td-costs">
                                                <img style={{marginRight: 5}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                <span>{getCostModifier(data.id).thirdMove.candy ? `x${getCostModifier(data.id).thirdMove.candy}` : "Unavailable"}</span>
                                            </div>
                                            <div className="row-extra">
                                                <div className="d-inline-flex justify-content-center" style={{width: 20, marginRight: 5}}>
                                                    <img alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>
                                                </div>
                                                <span>{getCostModifier(data.id).thirdMove.stardust ? `x${getCostModifier(data.id).thirdMove.stardust}` : "Unavailable"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="center">
                                        <td className="table-sub-header">Purified</td>
                                        <td className="table-sub-header">Costs</td>
                                    </tr>
                                    <tr className="info-costs">
                                        <td><img alt="img-cost-info" width={60} height={60} src={APIService.getPokePurified()}></img></td>
                                        <td style={{padding:0}}>
                                            <div className="row-extra td-costs">
                                                <img style={{marginRight: 5}} alt='img-stardust' height={20} src={APIService.getItemSprite("Item_1301")}></img>
                                                <span>{getCostModifier(data.id).purified.candy ? `x${getCostModifier(data.id).purified.candy}` : "Unavailable"}</span>
                                            </div>
                                            <div className="row-extra">
                                                <div className="d-inline-flex justify-content-center" style={{width: 20, marginRight: 5}}>
                                                    <img alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}></img>
                                                </div>
                                                <span>{getCostModifier(data.id).purified.stardust ? `x${getCostModifier(data.id).purified.stardust}` : "Unavailable"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='img-form-group' style={{textAlign: (initialize.current && pokeData.length === data.varieties.length && formList.length === data.varieties.length) ? null : 'center'}}>
                    {initialize.current && pokeData.length === data.varieties.length && formList.length === data.varieties.length ?
                            <Fragment>
                                <Form
                                    onSetPrev={props.onSetPrev}
                                    onSetNext={props.onSetNext}
                                    setVersion={setVersionName}
                                    setRegion={setRegion}
                                    setWH={setWH}
                                    setFormName={setFormName}
                                    id_default={data.id}
                                    pokeData={pokeData}
                                    pokemonRaito={pokeRatio}
                                    formList={formList}
                                    ratio={pokeRatio}
                                    stats={stats}
                                    species={data}
                                    onSetIDPoke={props.onSetIDPoke}/>
                                <PokemonModel id={data.id} name={data.name}/>
                            </Fragment>
                        :
                        <div className='loading-group'>
                            <img className="loading" width={40} height={40} alt='img-pokemon' src={loading}></img>
                            <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
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