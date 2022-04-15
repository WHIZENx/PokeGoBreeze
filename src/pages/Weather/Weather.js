import React, { Fragment, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

import APIService from '../../services/API.service'
import Affect from './Affect';
import Effect from './Effect';

import './Weather.css';

const Weather = () => {

    const [weatherBoosts, setWeatherBoosts] = useState(null);
    const [typeEffective, setTypeEffective] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (!weatherBoosts) {
            APIService.getPokeJSON('weather_boosts.json')
            .then(res => {
                setWeatherBoosts(res.data);
            })
            .catch(err => {
                enqueueSnackbar(err, { variant: 'error' })
            })
        };
        if (!typeEffective) {
            APIService.getPokeJSON('type_effectiveness.json')
            .then(res => {
                setTypeEffective(res.data);
            })
            .catch(err => {
                enqueueSnackbar(err, { variant: 'error' })
            })
        };
    }, [weatherBoosts, typeEffective, enqueueSnackbar]);

    return (
        <div className="container element-top">
            {weatherBoosts && typeEffective &&
            <Fragment>
                <div className="container-fluid"><Affect weathers={weatherBoosts}/></div>
                <hr style={{marginTop: 15, marginBottom: 15}}></hr>
                <div className="container w-75"><Effect weathers={weatherBoosts} types={typeEffective}/></div>
            </Fragment>
            }
        </div>
    )
}

export default Weather;
