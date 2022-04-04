import React, { Fragment, useReducer, useRef } from 'react';
import Info from '../Info';
import Stats from '../Stats/Stats';
import Form from './Form';

import './Form.css';

const FormGroup = (props) => {

    const reducer = (_, newState) => {
        return newState;
    }

    const [currForm, setCurrForm] = useReducer(reducer, props.formList.find(item => item.name === props.pokeData.find(item => item.is_default).name));
    const [dataPoke, setDataPoke] = useReducer(reducer, props.pokeData.find(item => item.id === props.id_default));

    const pokeID = useRef(props.pokeData.find(item => item.is_default))

    const splitAndCapitalize = (string) => {
        return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    }

    const changeForm = (e) => {
        setCurrForm(props.formList.find(item => item.name === e.target.value));
        setDataPoke(props.pokeData.find(item => item.name === e.target.value));
    }

    return (
        <Fragment>
            {props.formList.map((value, index) =>(
                <button value={value.form.name} key={index} className="btn btn-primary btn-form" onClick={(e) => changeForm(e)}>
                    {value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name)}
                </button>
            ))
            }
            <div>
                <div className='form-border'>
                    <h5>Form: <b>{currForm.form.form_name === "" ? "Normal" : splitAndCapitalize(currForm.form.form_name)}</b>
                    {currForm.form.id === pokeID.current.id && 
                        <small className='text-danger'> (Default form)</small>
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
            {/* <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={props.pokemonStats}/> */}
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