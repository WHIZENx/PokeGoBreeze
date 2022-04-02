import React from 'react';
import Weather from '../Sprits/Weather';

const WeatherTypeEffective = (props) => {

    if (props.weatherEffective.length === 0) return false;

    return (
        <div className="element-top">
            <h5 className='element-top'>- Weather Boosts:</h5>
            <Weather arr={props.weatherEffective} />
        </div>
    );
}

export default WeatherTypeEffective;
