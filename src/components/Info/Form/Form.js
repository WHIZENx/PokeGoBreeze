import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Move/Table/MoveTable'
import Stats from '../Stats/Stats'

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';

const Form = (props) => {

    const formDefault = useRef(props.formList.map(item => {
        return item.find(item => item.form.is_default)
    }));

    const [currForm, setCurrForm] = useState(formDefault.current.find(item => item.id === props.id_default));
    const [dataPoke, setDataPoke] = useState(props.pokeData.find(item => item.id === props.id_default));

    const pokeID = useRef(null);

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const splitAndCapitalize = (string, join) => {
        return string.split("-").map(text => capitalize(text)).join(join);
    };

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" || form === "standard" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
        const firstFilter = stats.find(item => item.id === id &&
            currForm.form.form_name.toLowerCase() === item.form.toLowerCase());
        if (firstFilter) return firstFilter;
        const filterForm = stats.find(item => item.id === id &&
            filterFormName(currForm.form.form_name, item.form));
        if (filterId.length === 1 && props.formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === props.formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [currForm, props.formList, filterFormName]);

    useEffect(() => {
        if (!currForm) {
            setCurrForm(formDefault.current[0]);
            pokeID.current = formDefault.current[0].form.id;
        } else {
            setStatATK(filterFormList(props.stats.attack.ranking, props.id_default));
            setStatDEF(filterFormList(props.stats.defense.ranking, props.id_default));
            setStatSTA(filterFormList(props.stats.stamina.ranking, props.id_default));
            if (!pokeID.current) {
                pokeID.current = currForm.form.id;
            }
        }
        if (currForm && dataPoke && props.onSetPrev != null && props.onSetNext != null) {
            props.onSetPrev(true);
            props.onSetNext(true);
        }
    }, [filterFormList, props, currForm, dataPoke, formDefault])

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const changeForm = (e) => {
        const findData = props.pokeData.find(item => e.currentTarget.value.includes(item.name));
        const findForm = props.formList.map(item => item.find(item => item.form.name === e.currentTarget.value)).find(item => item);
        setCurrForm(findForm);
        props.setFormName(splitAndCapitalize(findForm.form.name, " "));
        if (findData) {
            setDataPoke(findData);
            props.setWH(prevWH => ({...prevWH, weight: findData.weight, height: findData.height}));
        } else if (findForm) {
            let oriForm = props.pokeData[0];
            oriForm.types = findForm.form.types;
            setDataPoke(oriForm);
            props.setWH(prevWH => ({...prevWH, weight: oriForm.weight, height: oriForm.height}));
        } else {
            setDataPoke(props.pokeData[0]);
            props.setWH(prevWH => ({...prevWH, weight: props.pokeData[0].weight, height: props.pokeData[0].height}));
        }
        props.setVersion(findForm.form.version_group.name);
    }

    return (
        <Fragment>
            <div className='form-container'>
                <div className='scroll-form'>
                {currForm && pokeID.current &&
                    <Fragment>
                    {props.formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button value={value.form.name} key={index} className={"btn btn-form"+(value.form.id === currForm.form.id ? " form-selected" : "")} onClick={(e) => changeForm(e)}>
                                    <img width={64} height={64} onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(value.default_name)}} alt="img-icon-form" src={APIService.getPokeIconSprite(value.form.name)}></img>
                                    <p>{value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, " ")}</p>
                                    {value.form.id === pokeID.current &&
                                        <b><small className=''> (Default)</small></b>
                                    }
                                </button>
                            ))
                            }
                        </Fragment>
                    ))
                    }
                    </Fragment>
                }
                </div>
            {dataPoke && currForm &&
            <Fragment>
                {props.ratio.M !== 0 && props.ratio.F !== 0 ?
                <Fragment>
                {props.ratio.M !== 0 && <Fragment><Gender ratio={props.ratio} sex='Male' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                {props.ratio.M !== 0 && props.ratio.F !== 0 && <hr></hr>}
                {props.ratio.F !== 0 && <Fragment><Gender ratio={props.ratio} sex='Female' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                </Fragment>
                : <Gender sex='Genderless' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/>
                }
                <Stats statATK={statATK}
                    statDEF={statDEF}
                    statSTA={statSTA}
                    pokemonStats={props.stats}
                    stats={dataPoke}/>
                <hr className='w-100'></hr>
                <div className="row w-100" style={{margin:0}}>
                    <div className="col-md-5"  style={{padding:0}}>
                        <Info data={dataPoke} currForm={currForm} />
                    </div>
                    <div className="col-md-7" style={{padding:0}}>
                        <TableMove data={dataPoke} types={currForm.form.types}/>
                    </div>
                </div>
            </Fragment>
            }
            </div>
            {dataPoke && currForm &&
            <Fragment>
            <hr className="w-100"></hr>
            {props.formList.filter(item => item[0].form.form_name.includes("mega")).map(item => item[0].form).length > 0 ?
            <div className='row w-100' style={{margin:0}}>
                <div className='col-xl' style={{padding:0}}>
                    <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={props.species.evolution_chain.url} id={props.id_default} form={currForm.form}/>
                </div>
                <div className='col-xl' style={{padding:0}}>
                    <Mega onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} formList={props.formList} id={props.id_default}/>
                </div>
            </div>
            :
            <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={props.species.evolution_chain.url} id={props.id_default} form={currForm.form}/>
            }
            </Fragment>
            }
            </Fragment>
    )
}

export default Form;