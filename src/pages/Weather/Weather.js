import React, { Fragment, useEffect } from 'react';

import Affect from './Affect';
import Effect from './Effect';

import './Weather.css';
import weatherBoosts from '../../data/weather_boosts.json';
import typeEffective from '../../data/type_effectiveness.json';

const Weather = () => {

    useEffect(() => {
        document.title = "Weather Boosts";
    }, []);

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
