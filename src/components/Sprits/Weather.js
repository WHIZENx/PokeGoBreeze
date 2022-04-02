import React from 'react';
import APIService from '../../services/API.service'

const Weather = (props) => {

    if (!props.arr || props.arr.length === 0) return false;

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <ul className='element-top'>
            {props.text && <p>{props.text}</p>}
            {props.arr.map((value, index) => (
                <li className='img-group' key={ index }>
                    <img height={50} alt='img-pokemon' src={APIService.getWeatherSprite(value)}></img>
                    <span className='caption text-black'>{capitalize(value)}</span>
                </li>
            ))
            }
        </ul>
    );
}

export default Weather;