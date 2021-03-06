import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import APIService from "../../services/API.service";

import loading from '../../assets/loading.png';
import './Pokemon.css';

import { convertArrStats, splitAndCapitalize } from '../../util/Utils';
import { computeCandyBgColor, computeCandyColor } from '../../util/Compute';
import { regionList } from '../../util/Constants';
import { sortStatsPokemon } from '../../util/Calculate';

import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import Form from "../../components/Info/Form/FormNew";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import pokemonData from '../../data/pokemon.json';
import evoData from '../../data/evolution_pokemon_go.json';
import pokeListName from '../../data/pokemon_names.json';
import PokemonModel from "../../components/Info/Assets/PokemonModel";
import Error from "../Error/Error";
import { Alert } from "react-bootstrap";

const Pokemon = (props) => {

    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [reForm, setReForm] = useState(false);

    const [data, setData] = useState(null);
    const stats = useRef(sortStatsPokemon(convertArrStats(pokemonData)));
    const [pokeRatio, setPokeRatio] = useState(null);

    const [version, setVersion] = useState(null);
    const [region, setRegion] = useState(null);
    const [WH, setWH] = useState({weight: 0, height: 0});
    const [formName, setFormName] = useState(null);
    const [isFound, setIsFound] = useState(true);

    const [onChangeForm, setOnChangeForm] = useState(false);
    const [spinner, setSpinner] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const getRatioGender = useCallback((id) => {
        return Object.values(pokemonData).find(item => id === item.num).genderRatio;
    }, []);

    const fetchMap = useCallback(async (data) => {
        setSpinner(true);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = (await APIService.getFetchUrl(value.pokemon.url)).data;
            const poke_form = await Promise.all(poke_info.forms.map(async (item) => (await APIService.getFetchUrl(item.url)).data));
            dataPokeList.push(poke_info);
            dataFromList.push(poke_form);
        }));
        setPokeData(dataPokeList);
        let modify = false
        dataFromList = dataFromList.map(value => {
            if (value.length === 0) {
                modify = true;
                return dataFromList.find(item => item.length === dataFromList.length);
            }
            return value
        })
        if (modify) dataFromList = dataFromList.map((value, index) => {return [value[index]]});
        dataFromList = dataFromList.map(item => {
            return item.map(item => ({form: item, name: data.varieties.find(v => item.pokemon.name.includes(v.pokemon.name)).pokemon.name, default_name: data.name}))
            .sort((a,b) => a.form.id - b.form.id);
        }).sort((a,b) => a[0].form.id - b[0].form.id);
        setFormList(dataFromList);
        let defaultFrom, isDefaultForm, defaultData;
        let form = searchParams.get("form");

        if (form) {
            if (data.id === 555 && form === "galar") form += "-standard"
            defaultFrom = dataFromList.find(value => value.find(item => item.form.form_name === form.toLowerCase() || item.form.name === item.default_name+"-"+form.toLowerCase()));

            if (defaultFrom) {
                isDefaultForm = defaultFrom[0];
                if (isDefaultForm.form_name !== form.toLowerCase() && isDefaultForm.form.name !== isDefaultForm.default_name+"-"+form.toLowerCase()) {
                    isDefaultForm = defaultFrom.find(value => value.form.form_name === form.toLowerCase());
                }
            }
            else {
                defaultFrom = dataFromList.map(value => value.find(item => item.form.is_default));
                isDefaultForm = defaultFrom.find(item => item.form.id === data.id);
                searchParams.delete('form');
                setSearchParams(searchParams);
            }
        } else {
            defaultFrom = dataFromList.map(value => value.find(item => item.form.is_default));
            isDefaultForm = defaultFrom.find(item => item.form.id === data.id);
        }
        defaultData = dataPokeList.find(value => value.name === isDefaultForm.form.name);
        if (!defaultData) defaultData = dataPokeList.find(value => value.name === isDefaultForm.name);
        setWH(prevWH => ({...prevWH, weight: defaultData.weight, height: defaultData.height}));
        if (isDefaultForm) setVersion(splitAndCapitalize(isDefaultForm.form.version_group.name, "-", " "));
        else setVersion(splitAndCapitalize(defaultFrom[0].form.version_group.name, "-", " "));
        if (!params.id) setRegion(regionList[parseInt(data.generation.url.split("/")[6])]);
        const nameInfo = splitAndCapitalize(form ? isDefaultForm.form.name : data.name, "-", " ");
        setFormName(nameInfo);
        if (params.id) document.title = `#${data.id} - ${nameInfo}`;
        setOnChangeForm(false);
    }, [searchParams, setSearchParams, params.id]);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            setPokeRatio(getRatioGender(res.data.id));
            fetchMap(res.data);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pok??mon ID or name: ' + id + ' Not found!', { variant: 'error' });
            if (params.id) document.title = `#${params.id} - Not Found`;
            setIsFound(false);
        });
    }, [enqueueSnackbar, getRatioGender, fetchMap, params.id]);

    useEffect(() => {
        const id = params.id ? params.id.toLowerCase() : props.id;
        queryPokemon(id);
        // if (!initialize.current) {
        //     setStats(sortStatsPokemon(convertArrStats()));
        //     // APIService.getFetchUrl('https://itsjavi.com/pokemon-assets/assets/data/pokemon.json')
        //     // .then(res => {
        //         // setStats(sortStatsPokemon(convertArrStats(res.data)));
        //         // setDataPri(res.data);
        //     //     return APIService.getPokeJSON('released_pokemon.json');
        //     // })
        //     // .finally(initialize.current = true);
        //     initialize.current = true;
        // }
    }, [params.id, props.id, queryPokemon, reForm]);

    const getNumGen = (url) => {
        return "Gen " + url.split("/")[6]
    }

    const setVersionName = (version) => {
        setVersion(splitAndCapitalize(version, "-", " "));
    }

    const getCostModifier = (id) => {
        return evoData.find(item => item.id === id)
    }

    return (
        <Fragment>
            {!isFound ?
            <Error />
            :
            <Fragment>
            {data &&
                <Fragment>
                <div className="w-100 row prev-next-block sticky-top" style={{margin:0, height: 60}}>
                    {params.id ?
                    <Fragment>
                    {data.id > 1 && <div title="Previous Pok??mon" className="prev-block col" style={{padding:0}}>
                        <Link onClick={() => setReForm(false)} className="d-flex justify-content-start align-items-center" to={"/pokemon/"+(parseInt(params.id)-1)} title={`#${data.id-1} ${splitAndCapitalize(pokeListName[data.id-1].name, "-", " ")}`}>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateBeforeIcon fontSize="large"/></b>
                            </div>
                            <div style={{width: 60, cursor: "pointer"}}>
                                <img className="pokemon-navigate-sprite" alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id-1)}/>
                            </div>
                            <div className="w-100" style={{cursor: "pointer"}}>
                                <div style={{textAlign: "start"}}>
                                    <b>#{data.id-1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id-1].name, "-", " ")}
                                </div>
                            </div>
                        </Link>
                    </div>}
                    {data.id < Object.keys(pokeListName).length && pokeListName[data.id+1] && <div title="Next Pok??mon" className="next-block col" style={{float: "right", padding: 0}}>
                        <Link onClick={() => setReForm(false)} className="d-flex justify-content-end align-items-center" to={"/pokemon/"+(parseInt(data.id)+1)} title={`#${params.id+1} ${splitAndCapitalize(pokeListName[data.id+1].name, "-", " ")}`}>
                            <div className="w-100" style={{cursor: "pointer", textAlign: "end"}}>
                                <div style={{textAlign: "end"}}>
                                    <b>#{data.id+1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id+1].name, "-", " ")}
                                </div>
                            </div>
                            <div style={{width: 60, cursor: "pointer"}}>
                                <img className="pokemon-navigate-sprite" alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id+1)}/>
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
                    {data.id > 1 && <div title="Previous Pok??mon" className="prev-block col" style={{padding:0}}>
                        <div className="d-flex justify-content-start align-items-center" onClick={() => props.onDecId()}  title={`#${data.id-1} ${splitAndCapitalize(pokeListName[data.id-1].name, "-", " ")}`}>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateBeforeIcon fontSize="large"/></b>
                            </div>
                            <div style={{width: 60, cursor: "pointer"}}>
                                <img className="pokemon-navigate-sprite" alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id-1)}/>
                            </div>
                            <div className="w-100" style={{cursor: "pointer"}}>
                                <div style={{textAlign: "start"}}>
                                    <b>#{data.id-1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id-1].name, "-", " ")}
                                </div>
                            </div>
                        </div>
                    </div>}
                    {data.id < Object.keys(pokeListName).length && pokeListName[data.id+1] && <div title="Next Pok??mon" className="next-block col" style={{float: "right", padding: 0}}>
                        <div className="d-flex justify-content-end align-items-center" onClick={() => props.onIncId()}  title={`#${data.id+1} ${splitAndCapitalize(pokeListName[data.id+1].name, "-", " ")}`}>
                            <div className="w-100" style={{cursor: "pointer", textAlign: "end"}}>
                                <div style={{textAlign: "end"}}>
                                    <b>#{data.id+1}</b>
                                </div>
                                <div className="text-navigate">
                                    {splitAndCapitalize(pokeListName[data.id+1].name, "-", " ")}
                                </div>
                            </div>
                            <div style={{width: 60, cursor: "pointer"}}>
                                <img className="pokemon-navigate-sprite" alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id+1)}/>
                            </div>
                            <div style={{cursor: "pointer"}}>
                                <b><NavigateNextIcon fontSize="large"/></b>
                            </div>
                        </div>
                    </div>}
                    </Fragment>
                    :
                    <div className='loading-group'>
                        <img className="loading" width={20} height={20} alt='img-pokemon' src={loading}/>
                        <span className='caption text-black' style={{fontSize: 14}}><b>Loading...</b></span>
                    </div>
                    }
                    </Fragment>
                    }
                </div>
                <div className={'position-relative poke-container'+(props.isSearch ? "" : " container")}>
                    <div className='position-fixed loading-group-spin' style={{display: spinner ? "block" : "none"}}></div>
                    <div className="position-fixed loading-spin text-center" style={{display: spinner ? "block" : "none"}}>
                        <img className="loading" width={64} height={64} alt='img-pokemon' src={loading}/>
                        <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
                    </div>
                    <div className="w-100 text-center d-inline-block align-middle" style={{marginTop: 15, marginBottom: 15}}>
                        {Object.values(pokemonData).find(item => item.num === data.id && splitAndCapitalize(item.name, "-", " ") === formName) &&
                        !Object.values(pokemonData).find(item => item.num === data.id && splitAndCapitalize(item.name, "-", " ") === formName).releasedGO &&
                            <Alert variant="danger">
                                <h5 className='text-danger' style={{margin: 0}}>* <b>{formName}</b> not released in Pok??mon GO
                                <img width={50} height={50} style={{marginLeft: 10}} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}/>
                                </h5>
                            </Alert>
                        }
                        <div className="d-inline-block img-desc">
                            <img className="pokemon-main-sprite" style={{verticalAlign: 'baseline'}} alt="img-full-pokemon" src={APIService.getPokeFullSprite(data.id)}/>
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
                                    <tr className="text-center">
                                        <td className="table-sub-header">Unlock third move</td>
                                        <td className="table-sub-header">Costs</td>
                                    </tr>
                                    <tr className="info-costs">
                                        <td><img alt="img-cost-info" width={100} src={APIService.getItemSprite("Item_1202")}/></td>
                                        <td style={{padding:0}}>
                                            <div className="d-flex align-items-center row-extra td-costs">
                                                <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeCandyBgColor(data.id), marginRight: 5}}>
                                                    <div className="poke-candy" style={{background: computeCandyColor(data.id), width: 20, height: 20}}></div>
                                                </div>
                                                <span>{getCostModifier(data.id) && getCostModifier(data.id).thirdMove.candy ? `x${getCostModifier(data.id).thirdMove.candy}` : "Unavailable"}</span>
                                            </div>
                                            <div className="row-extra">
                                                <div className="d-inline-flex justify-content-center" style={{width: 20, marginRight: 5}}>
                                                    <img alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}/>
                                                </div>
                                                <span>{getCostModifier(data.id) && getCostModifier(data.id).thirdMove.stardust ? `x${getCostModifier(data.id).thirdMove.stardust}` : "Unavailable"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="text-center">
                                        <td className="table-sub-header">Purified</td>
                                        <td className="table-sub-header">Costs</td>
                                    </tr>
                                    <tr className="info-costs">
                                        <td><img alt="img-cost-info" width={60} height={60} src={APIService.getPokePurified()}/></td>
                                        <td style={{padding:0}}>
                                            <div className="d-flex align-items-center row-extra td-costs">
                                                <div className="d-inline-block bg-poke-candy" style={{backgroundColor: computeCandyBgColor(data.id), marginRight: 5}}>
                                                    <div className="poke-candy" style={{background: computeCandyColor(data.id), width: 20, height: 20}}></div>
                                                </div>
                                                <span>{getCostModifier(data.id) && getCostModifier(data.id).purified.candy ? `x${getCostModifier(data.id).purified.candy}` : "Unavailable"}</span>
                                            </div>
                                            <div className="row-extra">
                                                <div className="d-inline-flex justify-content-center" style={{width: 20, marginRight: 5}}>
                                                    <img alt='img-stardust' height={20} src={APIService.getItemSprite("stardust_painted")}/>
                                                </div>
                                                <span>{getCostModifier(data.id) && getCostModifier(data.id).purified.stardust ? `x${getCostModifier(data.id).purified.stardust}` : "Unavailable"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Form
                        setSpinner={setSpinner}
                        onChangeForm={onChangeForm}
                        setOnChangeForm={setOnChangeForm}
                        onSetPrev={props.onSetPrev}
                        onSetNext={props.onSetNext}
                        onSetReForm={setReForm}
                        setVersion={setVersionName}
                        region={region}
                        setRegion={setRegion}
                        setWH={setWH}
                        formName={formName}
                        setFormName={setFormName}
                        id_default={data.id}
                        pokeData={pokeData}
                        pokemonRaito={pokeRatio}
                        formList={formList}
                        ratio={pokeRatio}
                        stats={stats.current}
                        species={data}
                        onSetIDPoke={props.onSetIDPoke}
                        paramForm={searchParams.get('form') && searchParams.get('form').toLowerCase()}/>
                    <PokemonModel id={data.id} name={data.name}/>
                </div>
                </Fragment>
            }
            </Fragment>
            }
        </Fragment>
    )
}

export default Pokemon;