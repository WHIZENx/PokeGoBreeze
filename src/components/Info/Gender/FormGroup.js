import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';
import Form from './Form';

import Stats from '../Stats/Stats'

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';

const FormGroup = (props) => {

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
        form = form === "" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
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
        const findData = props.pokeData.find(item => item.name === e.currentTarget.value);
        const findForm = props.formList.map(item => item.find(item => item.form.name === e.currentTarget.value)).find(item => item);
        setCurrForm(findForm);
        if (findData) setDataPoke(findData)
        else setDataPoke(props.pokeData[0]);
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
            {dataPoke && currForm && props.typeEffective && props.weatherEffective &&
            <Fragment>
                {props.ratio.M !== 0 && props.ratio.F !== 0 ?
                <Fragment>
                {props.ratio.M !== 0 && <Fragment><Form ratio={props.ratio} sex='Male' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                {props.ratio.M !== 0 && props.ratio.F !== 0 && <hr></hr>}
                {props.ratio.F !== 0 && <Fragment><Form ratio={props.ratio} sex='Female' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                </Fragment>
                : <Form sex='Genderless' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/>
                }
                <Stats statATK={statATK}
                    statDEF={statDEF}
                    statSTA={statSTA}
                    pokemonStats={props.stats}
                    stats={dataPoke}/>
                <hr className='w-100'></hr>
                <Info data={dataPoke}
                    currForm={currForm}
                    typeEffective={props.typeEffective}
                    weatherEffective={props.weatherEffective} />
            </Fragment>
            }
            </div>
            <hr className="w-100"></hr>
            <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={props.species.evolution_chain.url} id={props.id_default}/>
        </Fragment>
    )
}

export default FormGroup;