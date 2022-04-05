import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';
import Form from './Form';

import Stats from '../Stats/Stats'

import './Form.css';

const FormGroup = (props) => {

    const [currForm, setCurrForm] = useState(props.formList.find(item => item.name === props.pokeData.find(item => item.is_default).name));
    const [dataPoke, setDataPoke] = useState(props.pokeData.find(item => item.id === props.id_default));

    const pokeID = useRef(props.pokeData.find(item => item.is_default));

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const splitAndCapitalize = useCallback((string, join) => {
        return string.split("-").map(text => capitalize(text)).join(join);
    }, []);

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" ? "Normal" : form.includes("mega") ? splitAndCapitalize(form, "-") : splitAndCapitalize(form, " ").replaceAll("-", "_");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return formStats.includes(form);
    }, [splitAndCapitalize]);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
        const filterForm = stats.find(item => item.id === id && 
            filterFormName(currForm.form.form_name, item.form));
        if (filterId.length === 1 && props.formList.length === 1 && !filterForm) return filterId[0];
        else return filterForm;
    }, [currForm.form.form_name, props.formList, filterFormName]);

    useEffect(() => {
        setStatATK(filterFormList(props.stats.attack.ranking, props.id_default));
        setStatDEF(filterFormList(props.stats.defense.ranking, props.id_default));
        setStatSTA(filterFormList(props.stats.stamina.ranking, props.id_default));
    }, [filterFormList, props.id_default, props.stats.attack.ranking, props.stats.defense.ranking, props.stats.stamina.ranking])

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const changeForm = (e) => {
        setCurrForm(props.formList.find(item => item.name === e.target.value));
        setDataPoke(props.pokeData.find(item => item.name === e.target.value));
    }

    return (
        <Fragment>
            {props.formList.map((value, index) =>(
                <button value={value.form.name} key={index} className="btn btn-primary btn-form" onClick={(e) => changeForm(e)}>
                    {value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, " ")}
                </button>
            ))
            }
            <div>
                <div className='form-border'>
                    <h5>Form: <b>{currForm.form.form_name === "" ? "Normal" : splitAndCapitalize(currForm.form.form_name, " ")}</b>
                    {currForm.form.id === pokeID.current.id && 
                        <small className='text-danger'> (Default)</small>
                    }
                    </h5>
                </div>
            </div>
            {dataPoke && currForm &&
            <Fragment>
            {!(new Set(props.genderless.map(value => value.pokemon_id)).has(pokeID.current.id)) ?
            <Fragment>
                {props.pokemonRaito.charAt(0) !== '0' && <Fragment><Form ratio={props.pokemonRaito} sex='Male' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                {props.pokemonRaito.charAt(0) !== '0' && props.pokemonRaito.charAt(3) !== '0' && <hr></hr>}
                {props.pokemonRaito.charAt(3) !== '0' && <Fragment><Form ratio={props.pokemonRaito} sex='Female' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
            </Fragment>
            : <Form sex='Genderless' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/>
            }
            <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={props.stats}/>
            <Info data={dataPoke}
                  typeEffective={props.typeEffective}
                  weatherEffective={props.weatherEffective}
                  released={props.released}/>
            </Fragment>
            }
        </Fragment>
    )
}

export default FormGroup;