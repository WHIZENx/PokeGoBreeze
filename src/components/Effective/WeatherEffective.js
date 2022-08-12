/* eslint-disable react/prop-types */
import React from 'react';
import Type from '../Sprites/Type/Type';

const WeatherEffective = (props) => {

    if (!props.weatherEffective) return false;

    return (
        <div className="element-top">
            <h5 className='element-top'><li>Types Pokémon for Boosts</li></h5>
            <Type arr={props.weatherEffective} style={{marginLeft: 15}}/>
        </div>
    );
}

export default WeatherEffective;
