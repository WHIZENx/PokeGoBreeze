import React from 'react';
import Type from '../Sprits/Type';

const WeatherEffective = (props) => {

    if (props.weatherEffective.length === 0) return false;

    return (
        <div className="element-top">
            <h5 className='element-top'>- Type Pokémon for Boosts:</h5>
            <Type arr={props.weatherEffective} />
        </div>
    );
}

export default WeatherEffective;
