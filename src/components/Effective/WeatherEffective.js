import React from 'react';
import Type from '../Sprites/Type/Type';

const WeatherEffective = (props) => {

    if (!props.weatherEffective) return false;

    return (
        <div className="element-top">
            <h5 className='element-top'>- Type Pokémon for Boosts:</h5>
            <Type arr={props.weatherEffective} style={{marginLeft: 15}}/>
        </div>
    );
}

export default WeatherEffective;
