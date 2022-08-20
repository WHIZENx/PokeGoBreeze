import { useSnackbar } from "notistack";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import APIService from "../../../services/API.service";
import FormTools from "./FormTools";

import loading from '../../../assets/loading.png';
import { splitAndCapitalize, TypeRadioGroup } from "../../../util/Utils";
import Type from "../../Sprites/Type/Type";
import { FormControlLabel, Radio } from "@mui/material";

const Tools = (props) => {

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [typePoke, setTypePoke] = useState(props.raid ? "boss" : "pokemon");
    const [tier, setTier] = useState(props.tier ?? 1);

    const [data, setData] = useState(null);

    const [currForm, setCurrForm] = useState(null);

    const [pokeID, setPokeID] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const fetchMap = useCallback(async (data, axios, source) => {
        setFormList([]);
        setPokeData([]);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = await axios.getFetchUrl(value.pokemon.url, {cancelToken: source.token});
            const poke_form = await Promise.all(poke_info.data.forms.map(async (item) => (await axios.getFetchUrl(item.url, {cancelToken: source.token})).data));
            dataPokeList.push(poke_info.data);
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
        const formDefault = dataFromList.map(item => {
            return item.find(item => item.form.is_default);
        });
        const isDefault = formDefault.find(item => item.form.id === data.id);
        if (isDefault) {
            setCurrForm(isDefault);
            setPokeID(isDefault.form.id);
        }
        else {
            setCurrForm(formDefault[0]);
            setPokeID(formDefault[0].form.id);
        }
    }, []);

    const queryPokemon = useCallback((id, axios, source) => {
        axios.getPokeSpicies(id, {
            cancelToken: source.token
        })
        .then(res => {
            fetchMap(res.data, axios, source);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
            source.cancel();
        });
    }, [enqueueSnackbar, fetchMap]);

    useEffect(() => {
        const axios = APIService;
        const cancelToken = axios.getAxios().CancelToken;
        const source = cancelToken.source();
        queryPokemon(props.id, axios, source);
    }, [props.id, queryPokemon]);

    const changeForm = (e) => {
        const findForm = formList.map(item => item.find(item => item.form.name === e.currentTarget.value)).find(item => item);
        setCurrForm(findForm);
        props.onClearStats();
    }

    const onSetTier = (tier) => {
        if (props.setTier) props.setTier(tier);
        setTier(tier);
    }

    return (
        <Fragment>
            <div className="d-inline-block" style={{width: 60, height: 60}}>
                {props.id > 1 &&
                    <div style={{cursor: 'pointer'}} onClick={() => props.onSetPrev()}>
                        <div>
                            <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(props.id-1)}/>
                        </div>
                        <span><b><span style={{color: 'red', fontSize: 20}}>{"<"}</span> #{props.id-1}</b></span>
                    </div>
                }
            </div>
            <img height={200} alt="img-full-pokemon" src={APIService.getPokeFullSprite(props.id)}/>
            <div className="d-inline-block" style={{width: 60, height: 60}}>
                {props.id < props.count &&
                    <div style={{cursor: 'pointer'}} onClick={() => props.onSetNext()}>
                        <div>
                            <img height={60} alt="img-full-pokemon" src={APIService.getPokeFullSprite(props.id+1)}/>
                        </div>
                        <span><b>#{props.id+1} <span style={{color: 'red', fontSize: 20}}>{">"}</span></b></span>
                    </div>
                }
            </div>
            <div className="element-top" style={{height: 64}}>
                {currForm && pokeID && pokeData.length === data.varieties.length && formList.length === data.varieties.length &&
                    <Type arr={currForm.form.types.map(type => type.type.name)}/>
                }
            </div>
            <h4><b>#{props.id} {currForm ? splitAndCapitalize(currForm.form.name, "-", " ") : props.name}</b></h4>
            <div className="scroll-card">
                {currForm && pokeID && pokeData.length === data.varieties.length && formList.length === data.varieties.length ?
                    <Fragment>
                    {formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button value={value.form.name} key={index} className={"btn btn-form"+(value.form.id === currForm.form.id ? " form-selected" : "")} onClick={(e) => changeForm(e)}>
                                    <img width={64} height={64}
                                    onError={(e) => {
                                        e.onerror=null;
                                        APIService.getFetchUrl(e.target.currentSrc)
                                        .then(() => {
                                            e.target.src=APIService.getPokeIconSprite(value.default_name);
                                        })
                                        .catch(() => {
                                            e.target.src=APIService.getPokeIconSprite("unknown-pokemon");
                                        });
                                    }}
                                    alt="img-icon-form" src={APIService.getPokeIconSprite(value.form.name)}/>
                                    <div>{value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, "-", " ")}</div>
                                    {value.form.id === pokeID &&
                                        <b><small>(Default)</small></b>
                                    }
                                </button>
                            ))
                            }
                        </Fragment>
                    ))
                    }
                    </Fragment>
                :   <div className='loading-group vertical-center'>
                        <img className="loading" width={40} height={40} alt='img-pokemon' src={loading}/>
                        <span className='caption text-black' style={{fontSize: 18}}><b>Loading<span id='p1'>.</span><span id='p2'>.</span><span id='p3'>.</span></b></span>
                    </div>
                }
            </div>
            {!props.hide &&
                <div className="d-flex justify-content-center text-center">
                    <TypeRadioGroup
                        row
                        aria-labelledby="row-types-group-label"
                        name="row-types-group"
                        value={typePoke}
                        onChange={(e) => {
                            setTypePoke(e.target.value);
                            if (props.setRaid) props.setRaid(e.target.value === "pokemon" ? false : true);
                            if (props.onClearStats) props.onClearStats(true);
                        }}>
                        <FormControlLabel value="pokemon" control={<Radio />} label={<span><img height={32} alt="img-pokemon" src={APIService.getItemSprite("pokeball_sprite")}/> Pokémon Stats</span>} />
                        <FormControlLabel value="boss" control={<Radio />} label={<span><img className="img-type-icon" height={32} alt="img-boss" src={APIService.getRaidSprite("ic_raid_small")}/> Boss Stats</span>} />
                    </TypeRadioGroup>
                </div>
            }
            <div className="row">
                <div className="col-sm-6"></div>
                <div className="col-sm-6"></div>
            </div>
            <FormTools hide={props.hide} raid={typePoke === "pokemon" ? false : true} tier={tier} setTier={onSetTier} setForm={props.setForm} id={props.id} dataPoke={pokeData} currForm={currForm} formList={formList} stats={props.stats} onSetStats={props.onHandleSetStats} onClearStats={props.onClearStats}/>
        </Fragment>
    )
}

export default Tools;