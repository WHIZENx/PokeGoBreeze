/* eslint-disable react/prop-types */
import React, { Fragment } from 'react';
import APIService from '../../services/API.service'

const Weather = (props) => {

    if (!props.arr || props.arr.length === 0) return (
        <Fragment>
            <ul className='element-top'>
                <li className='img-group' key={ 0 }>
                    <img height={50} alt='img-pokemon' src={APIService.getPokeSprite(0)}/>
                    <span className='caption text-black'>None</span>
                </li>
            </ul>
        </Fragment>
    );

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className='element-top' style={props.style}>
            {props.text && <p>{props.text}</p>}
            <div className='d-inline-flex flex-wrap type-list align-items-center'>
                {props.arr.map((value, index) => (
                    <div className='text-center d-flex' key={ index }>
                        <div>
                            <img height={50} alt='img-pokemon' src={APIService.getWeatherSprite(value)}/>
                            <span className='caption text-black'>{capitalize(value)}</span>
                        </div>
                    </div>
                ))
                }
            </div>

        </div>
    );
}

export default Weather;